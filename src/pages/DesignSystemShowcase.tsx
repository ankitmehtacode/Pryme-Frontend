import React from "react";
import { PageShell, Surface, Stack, Inline, ContentContainer, SplitLayout, MediaPanel } from "@/components/layout";
import authHeroImg from "@/assets/images/auth-hero-v2.png";

export default function DesignSystemShowcase() {
  return (
    <PageShell className="py-12 min-h-screen bg-[hsl(var(--background))]">
      <Stack gap="var(--space-8)">
        <Inline justify="space-between" align="center">
          <div>
            <h1 className="text-[length:var(--text-display)] font-bold text-[hsl(var(--foreground))]">Pryme UI Foundation</h1>
            <p className="text-[length:var(--text-title)] text-[hsl(var(--muted-foreground))]">Phase 2: Generic Primitives Showcase</p>
          </div>
        </Inline>

        <Surface className="p-[var(--space-section)]">
          <Stack gap="var(--space-4)">
            <h2 className="text-[length:var(--text-heading)] font-semibold text-[hsl(var(--foreground))]">Surface Component</h2>
            <p className="text-[length:var(--text-body)] text-[hsl(var(--muted-foreground))]">
              This white box is a <code>Surface</code>. It automatically inherits the design system's background color, text color, radius, and shadow.
            </p>
          </Stack>
        </Surface>

        <Inline gap="var(--space-4)">
          <Surface className="flex-1 p-[var(--space-section)]">
            <Stack gap="var(--space-4)">
              <h3 className="text-[length:var(--text-heading)] font-semibold">Inline Component</h3>
              <p className="text-[length:var(--text-body)] text-[hsl(var(--muted-foreground))]">
                These two blocks sit next to each other using an <code>Inline</code>.
              </p>
            </Stack>
          </Surface>

          <Surface className="flex-1 p-[var(--space-section)]">
            <Stack gap="var(--space-4)">
              <h3 className="text-[length:var(--text-heading)] font-semibold">Stack Component</h3>
              <p className="text-[length:var(--text-body)] text-[hsl(var(--muted-foreground))]">
                Notice how heading and text flow vertically using a <code>Stack</code>.
              </p>
            </Stack>
          </Surface>
        </Inline>

        <ContentContainer width="readable">
          <Surface className="p-[var(--space-section)] bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]">
            <Stack gap="var(--space-4)">
              <h3 className="text-[length:var(--text-heading)] font-semibold">ContentContainer (Readable)</h3>
              <p className="text-[length:var(--text-body)]">
                This surface is wrapped in a <code>ContentContainer width="readable"</code>, constraining its max-width so that text remains at an optimal line length.
              </p>
            </Stack>
          </Surface>
        </ContentContainer>

        <Surface className="min-h-[400px]">
          <SplitLayout>
            <SplitLayout.Media>
              <MediaPanel>
                <img src={authHeroImg} alt="Hero showcase" className="absolute inset-0 h-full w-full object-cover" />
              </MediaPanel>
            </SplitLayout.Media>
            <SplitLayout.Content className="p-8 justify-center items-center">
              <Stack gap="var(--space-4)">
                <h3 className="text-[length:var(--text-heading)] font-semibold">SplitLayout & MediaPanel</h3>
                <p className="text-[length:var(--text-body)] text-[hsl(var(--muted-foreground))]">
                  These components handle side-by-side structures natively.
                </p>
              </Stack>
            </SplitLayout.Content>
          </SplitLayout>
        </Surface>

        {/* --- ANTI-PATTERNS SECTION --- */}
        <Surface className="p-[var(--space-section)] border border-[hsl(var(--destructive))]">
          <Stack gap="var(--space-4)">
            <h2 className="text-[length:var(--text-heading)] font-semibold text-[hsl(var(--destructive))]">Anti-patterns</h2>
            <p className="text-[length:var(--text-body)] text-[hsl(var(--muted-foreground))] mb-4">
              What NOT to do when building with the UI Foundation:
            </p>

            <ul className="list-disc pl-6 space-y-4">
              <li>
                <strong>❌ Nesting multiple PageShells:</strong> <code>PageShell</code> defines the outermost boundary. Nesting them breaks responsive constraints.
              </li>
              <li>
                <strong>❌ Using Stack for horizontal layouts:</strong> <code>Stack</code> is strictly for vertical flow. Use <code>Inline</code> for side-by-side elements.
              </li>
              <li>
                <strong>❌ Applying raw spacing utilities:</strong> Never use <code>mt-4</code>, <code>p-8</code>, etc. inside features. Always use <code>var(--space-*)</code> or <code>var(--layout-*)</code>.
              </li>
              <li>
                <strong>❌ Adding feature-specific props:</strong> Primitives should never accept props like <code>isLoggedIn</code> or <code>showSidebar</code>.
              </li>
            </ul>
          </Stack>
        </Surface>

      </Stack>
    </PageShell>
  );
}
