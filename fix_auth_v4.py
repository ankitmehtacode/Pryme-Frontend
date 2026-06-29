import re

with open('src/pages/Auth.tsx', 'r') as f:
    content = f.read()

# 1. Update Google Button height & radius
# Currently: h-[40px] ... rounded-full text-[14px] font-medium
content = content.replace('h-[40px]', 'h-[56px]')
content = content.replace('rounded-full text-[14px] font-medium', 'rounded-[14px] text-[16px] font-semibold')

# 2. Update gap between heading and paragraph to 12px (mb-3)
content = content.replace('text-[#0a1530] mb-2 tracking-tight', 'text-[#0a1530] mb-3 tracking-tight')

# 3. Update divider to exactly 48px top and bottom
content = content.replace('className="relative my-12"', 'className="relative mt-[48px] mb-[48px]"')
content = content.replace('className="relative my-8"', 'className="relative mt-[48px] mb-[48px]"')

# 4. Update transitions to 180ms
content = content.replace('transition={{ duration: 0.2, ease: "easeOut" }}', 'transition={{ duration: 0.18, ease: "easeOut" }}')

# 5. Fix trust footer icons font size
content = content.replace('text-[13px] font-medium tracking-wide', 'text-[12px] font-medium')

with open('src/pages/Auth.tsx', 'w') as f:
    f.write(content)

