import re

with open('src/components/ui/input.tsx', 'r') as f:
    content = f.read()

# Update input classes
# We want: h-[52px], rounded-[14px], px-4 (16px), focus-visible:ring-2, focus-visible:ring-[#103783]
# Original input might have h-12 (48px), rounded-md (6px), px-3 (12px).
# Wait, I previously changed it to h-12, let's just do a regex replace on the className string

pattern = r'className=\{cn\(\n\s*"([^"]+)",'

def repl(m):
    cls = m.group(1)
    cls = re.sub(r'h-\d+|h-\[[^\]]+\]', 'h-[52px]', cls)
    cls = re.sub(r'rounded-\w+|rounded-\[[^\]]+\]', 'rounded-[14px]', cls)
    cls = re.sub(r'px-\d+', 'px-4', cls)
    cls = re.sub(r'duration-\d+|duration-\[[^\]]+\]', 'duration-[150ms]', cls)
    
    # Ensure transition-all instead of transition-colors if needed, though already there
    
    return f'className={{cn(\n          "{cls}",'

content = re.sub(pattern, repl, content)

with open('src/components/ui/input.tsx', 'w') as f:
    f.write(content)

