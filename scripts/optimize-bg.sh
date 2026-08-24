#!/usr/bin/env bash
#
# optimize-bg.sh — turn a high-resolution artwork export into the two WebP
# files the auth background needs, and report what it cost.
#
#   ./scripts/optimize-bg.sh ~/Downloads/auth-bg@3x.png
#
# Why two files and not one:
#   The auth background is displayed full-bleed. On a 1x display a 1600x900
#   image is exactly right; on a 2x (Retina) display the browser needs 3200x1800
#   physical pixels for the same area. Shipping only 1600x900 is what made the
#   current background look soft — the browser upscaled it 2x, and the baked-in
#   text was the first thing to fall apart. Shipping only 3200x1800 fixes 2x
#   displays but makes 1x users download ~4x the pixels they can show. srcset
#   lets the browser pick, so we emit both.
#
# Why q90 and not -lossless:
#   Lossless on this artwork is ~6x the bytes for no visible gain — measured on
#   the old file: 68K JPEG -> 412K lossless WebP, pixel-identical. Sharpness
#   comes from RESOLUTION here, not from the quantiser. q90 at 2x looks better
#   than lossless at 1x and is a fraction of the size. The script prints the
#   lossless numbers too so the tradeoff stays visible rather than assumed.
#
# Requires: cwebp (brew install webp). No other dependencies — cwebp does the
# resampling itself, so this does not need sips/ImageMagick and is not
# macOS-only.

set -euo pipefail

SRC="${1:-}"
OUT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/src/assets/images"
BASENAME="auth-bg-custom"

if [[ -z "$SRC" ]]; then
  echo "usage: $0 <path-to-high-res-export>" >&2
  exit 64
fi
if [[ ! -f "$SRC" ]]; then
  echo "error: no such file: $SRC" >&2
  exit 66
fi
if ! command -v cwebp >/dev/null 2>&1; then
  echo "error: cwebp not found. Install it with:  brew install webp" >&2
  exit 69
fi

# Refuse a source that cannot actually produce a sharp 2x asset. Upscaling
# invents no detail, so silently accepting a small file here would reproduce
# exactly the bug this script exists to fix.
#
# Dimensions via Pillow, falling back to sips (macOS built-in). Both are read
# only — neither rewrites the source.
read -r W H <<<"$(
  python3 - "$SRC" <<'PY' 2>/dev/null || true
import sys
try:
    from PIL import Image
    with Image.open(sys.argv[1]) as im:
        print(im.width, im.height)
except Exception:
    pass
PY
)"
if [[ -z "${W:-}" ]] && command -v sips >/dev/null 2>&1; then
  W="$(sips -g pixelWidth  "$SRC" 2>/dev/null | awk '/pixelWidth/{print $2}')"
  H="$(sips -g pixelHeight "$SRC" 2>/dev/null | awk '/pixelHeight/{print $2}')"
fi
if [[ -z "${W:-}" ]]; then
  echo "warning: could not read source dimensions; skipping the size guard." >&2
fi

if [[ -n "${W:-}" ]] && (( W < 3200 )); then
  echo "REFUSING: source is ${W}x${H}, which is under 3200 wide." >&2
  echo "A 2x asset built from this would be upscaled, i.e. still blurry —" >&2
  echo "the exact problem this replaces. Re-export at 3200x1800 or larger." >&2
  exit 65
fi
echo "source: $SRC  (${W:-?}x${H:-?})"

# A dimension check alone is not enough. Enlarging the old 1600px JPEG to
# 3200 in Photoshop or an AI upscaler satisfies it while adding no real
# detail, and would ship a ~1MB file that is every bit as blurry — the same
# failure wearing a bigger number.
#
# So test for detail rather than size: halve the image and enlarge it back.
# A genuine 3200px export loses real information doing that and diverges from
# the original; an upscaled one is reconstructed almost exactly, because
# everything it contains was already derivable from half resolution. High
# similarity therefore means "no detail beyond 1600px", i.e. an upscale.
#
# The threshold is a heuristic, calibrated against a synthetic stand-in rather
# than a real export of this artwork: a native-resolution render of the same
# mostly-smooth design scored 41.4 dB and a 1600->3200 enlargement 53.9 dB, so
# 45 sits in the gap with room either side. If a legitimate export ever trips
# it anyway, ALLOW_UPSCALE=1 skips the check rather than blocking real work:
#   ALLOW_UPSCALE=1 ./scripts/optimize-bg.sh <file>
python3 - "$SRC" "${ALLOW_UPSCALE:-0}" <<'PY' || exit 65
import sys
try:
    from PIL import Image, ImageChops
    import math
except Exception:
    sys.exit(0)                      # Pillow missing: skip rather than block
try:
    im = Image.open(sys.argv[1]).convert("RGB")
except Exception:
    sys.exit(0)
half  = im.resize((im.width // 2, im.height // 2), Image.LANCZOS)
back  = half.resize(im.size, Image.LANCZOS)
diff  = ImageChops.difference(im, back)
hist  = diff.histogram()
sq    = sum(v * (i % 256) ** 2 for i, v in enumerate(hist))
mse   = sq / (im.width * im.height * 3)
psnr  = 99.0 if mse == 0 else 10 * math.log10((255 ** 2) / mse)
print(f"  detail check: round-trip PSNR {psnr:.1f} dB", end="")
if psnr > 45 and sys.argv[2] == "1":
    print("  <-- would fail, overridden by ALLOW_UPSCALE=1")
    sys.exit(0)
if psnr > 45:
    print("  <-- NO REAL DETAIL BEYOND HALF RESOLUTION")
    print()
    print("REFUSING: this looks like an UPSCALE, not a true high-res export.",
          file=sys.stderr)
    print("Shrinking it by half and enlarging it back reproduces it almost",
          file=sys.stderr)
    print("exactly, which means it carries no information a 1600px file did",
          file=sys.stderr)
    print("not already have. Converting it would ship a much larger file that",
          file=sys.stderr)
    print("is just as blurry. Re-export from the original design file at",
          file=sys.stderr)
    print("3200x1800 instead of enlarging the JPEG.", file=sys.stderr)
    sys.exit(65)
print("  (genuine detail present)")
PY
echo

mkdir -p "$OUT_DIR"

emit () { # label  width  height  outfile  extra-args...
  local label="$1" w="$2" h="$3" out="$4"; shift 4
  cwebp -quiet -resize "$w" "$h" "$@" "$SRC" -o "$out"
  printf "  %-28s %-11s %8s\n" "$(basename "$out")" "${w}x${h}" "$(du -h "$out" | cut -f1)"
}

echo "shipping (q90):"
emit "1x" 1600  900 "$OUT_DIR/${BASENAME}.webp"     -q 90
emit "2x" 3200 1800 "$OUT_DIR/${BASENAME}@2x.webp"  -q 90

echo
echo "for comparison, lossless (NOT shipped — see header):"
TMP="$(mktemp -d)"
emit "1x" 1600  900 "$TMP/${BASENAME}.lossless.webp"    -lossless -z 9
emit "2x" 3200 1800 "$TMP/${BASENAME}@2x.lossless.webp" -lossless -z 9
rm -rf "$TMP"

echo
echo "Written to src/assets/images/. Next: point Auth.tsx at them via srcset —"
echo "  srcset={\`\${bg1x} 1x, \${bg2x} 2x\`}"
echo "and delete ${BASENAME}.jpg once the new files render correctly."
