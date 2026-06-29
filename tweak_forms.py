import re
import glob

for filename in glob.glob('src/components/auth/*Form.tsx'):
    with open(filename, 'r') as f:
        content = f.read()

    # Change text-[12px] sm:text-[11px] on the primary button to text-[16px]
    content = content.replace('text-[12px] sm:text-[11px]', 'text-[16px]')
    content = content.replace('text-[14px] sm:text-[13px]', 'text-[16px]')

    # Remove pl-1 from Keep me logged in
    content = content.replace('mt-5 sm:mt-6 pl-1 group', 'mt-5 sm:mt-6 group')
    
    # Remove pl-1 from Labels to snap to the left edge perfectly
    content = content.replace('text-slate-700 pl-1', 'text-slate-700')
    content = content.replace('ease-out pl-1 mt-2', 'ease-out mt-2')

    with open(filename, 'w') as f:
        f.write(content)
        
