import re

def strip_input_classes(filename):
    with open(filename, 'r') as f:
        content = f.read()

    # The custom classes look like: className="h-[52px] w-full border-0 border-b border-[#103783]/10 hover:border-[#103783]/30 rounded-none bg-transparent px-1 font-medium text-[#103783] placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-[#10B981] transition-colors shadow-none text-[14px] sm:text-[13px]"
    
    # Let's remove the className prop completely from <Input ... />
    # Or just replace it with className="" if needed.
    
    # We can match: <Input [^>]*className="[^"]+"
    def repl(m):
        full_match = m.group(0)
        # We want to remove the className="..."
        return re.sub(r'\s*className="[^"]+"', '', full_match)

    content = re.sub(r'<Input[^>]*className="[^"]+"', repl, content)
    
    # Also in SignupForm, there is `className={cn("...", form.formState.errors... ? "..." : "...")}`
    # For password fields, there is a dynamic class:
    # className={cn("h-[52px] w-full border-0 border-b rounded-none ...", form.formState.errors...)}
    
    def strip_dynamic_cn(m):
        # Instead of parsing arbitrary CN, let's just make it simple
        return m.group(1) + ' className={cn(form.formState.errors.' + m.group(2) + ' ? "border-rose-500 focus-visible:ring-rose-500 text-rose-600" : "")}'

    # The pattern for the password input:
    pattern = r'(<Input[^>]*?)className=\{cn\(\s*"[^"]+",\s*form\.formState\.errors\.([^ ]+)[\s\S]*?\)\}'
    content = re.sub(pattern, strip_dynamic_cn, content)
    
    # Remove hover and other custom classes for the primary buttons too
    # Button height: 56px. Sentence case. No uppercase. No excessive tracking.
    # Radius: Google button "Must match primary button ... Same radius". Let's set Button radius to rounded-[14px]
    def repl_btn(m):
        return m.group(1) + m.group(2).replace('rounded-full', 'rounded-[14px]') + m.group(3)
        
    content = re.sub(r'(<Button[^>]*?className=")([^"]+)(")', repl_btn, content)

    with open(filename, 'w') as f:
        f.write(content)

strip_input_classes('src/components/auth/LoginForm.tsx')
strip_input_classes('src/components/auth/SignupForm.tsx')
strip_input_classes('src/components/auth/ForgotPasswordForm.tsx')

