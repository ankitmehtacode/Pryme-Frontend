import re

def update_form_styles(filename, button_text="Sign in →"):
    with open(filename, 'r') as f:
        content = f.read()

    # 1. Update inputs
    # h-10 sm:h-9 -> h-[52px]
    content = content.replace("h-10 sm:h-9", "h-[52px]")
    content = content.replace("h-12", "h-[52px]")

    # 2. Update primary button
    # className="... w-full h-[46px] sm:h-[42px] ... uppercase ... font-extrabold tracking-widest ..."
    # we need to remove uppercase, tracking-widest, hover:-translate-y-[2px]
    
    # We will use regex to find the button class inside <Button type="submit" ...>
    button_pattern = r'(<Button type="submit".*?className=")([^"]+)(".*?>)'
    
    def repl_btn_class(m):
        cls = m.group(2)
        cls = re.sub(r'h-\[[^\]]+\]\s*(sm:h-\[[^\]]+\])?', 'h-[56px]', cls)
        cls = cls.replace('uppercase', '')
        cls = cls.replace('tracking-widest', '')
        cls = cls.replace('font-extrabold', 'font-semibold')
        cls = cls.replace('hover:-translate-y-[2px]', '')
        cls = cls.replace('shadow-[0_8px_24px_rgba(16,55,131,0.25)]', '')
        cls = cls.replace('hover:shadow-[0_12px_28px_rgba(16,55,131,0.35)]', '')
        cls = cls.replace('duration-300', 'duration-[160ms] ease-out')
        # clean up multiple spaces
        cls = re.sub(r'\s+', ' ', cls)
        return f"{m.group(1)}{cls}{m.group(3)}"
    
    content = re.sub(button_pattern, repl_btn_class, content, flags=re.DOTALL)
    
    # We will replace the button text
    if "LoginForm" in filename:
        # Relocate Forgot Password?
        forgot_pw_block = r'\s*<button type="button" onClick=\{onForgotPassword\} className="text-\[11px\] sm:text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors pl-1">\n\s*Forgot Password\?\n\s*</button>'
        content = re.sub(forgot_pw_block, '', content)
        
        # Put it under the password AnimatePresence block
        # <AnimatePresence> ... </AnimatePresence>\n      </div>\n\n      <div \n        onClick={() => setRememberMe(!rememberMe)}
        target = r'</AnimatePresence>\n      </div>'
        replacement = f'</AnimatePresence>\n        <button type="button" onClick={{onForgotPassword}} className="text-[13px] font-semibold text-[#103783] hover:underline transition-all duration-[150ms] ease-out pl-1 mt-2 text-left">\n          Forgot password?\n        </button>\n      </div>'
        content = content.replace('</AnimatePresence>\n      </div>', replacement)
        
        # update Continue text
        content = content.replace('Continue <ArrowRight className="w-4 h-4 ml-1" />', f'{button_text}')

    elif "SignupForm" in filename:
        content = content.replace('Create Account <ArrowRight className="w-4 h-4 ml-1" />', 'Create account →')
        
    elif "ForgotPasswordForm" in filename:
        content = content.replace('Send Reset Link <ArrowRight className="w-4 h-4 ml-1" />', 'Send reset link →')

    with open(filename, 'w') as f:
        f.write(content)

update_form_styles('src/components/auth/LoginForm.tsx', 'Sign in →')
update_form_styles('src/components/auth/SignupForm.tsx', 'Create account →')
update_form_styles('src/components/auth/ForgotPasswordForm.tsx', 'Send reset link →')
