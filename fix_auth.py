import re

with open('src/pages/Auth.tsx', 'r') as f:
    content = f.read()

# Add Shield and Lock imports if they are not present, wait ShieldCheck is already there. Let's change ShieldCheck to Shield
content = content.replace('ShieldCheck, Lock', 'Shield, Lock')

# 1. Shadow refinement
content = content.replace('shadow-[0_16px_48px_rgba(15,23,42,0.08)]', 'shadow-[0_12px_36px_rgba(15,23,42,0.07)]')

# 2. Left Panel replacement
old_left_panel = r'<div className="relative hidden w-full lg:flex lg:w-\[48%\] flex-col items-center justify-center overflow-hidden border-r border-slate-100 bg-black">.*?</div>'
new_left_panel = """<div className="relative hidden w-full lg:flex lg:w-[48%] flex-col justify-between overflow-hidden border-r border-slate-100 bg-black p-12 lg:p-20">
            <img 
              src={authHeroImg} 
              alt="" 
              aria-hidden="true"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover object-[40%_center] z-0 opacity-90" 
            />
            
            {/* Logo & Headline */}
            <div className="relative z-10 w-full flex flex-col gap-10 max-w-[400px]">
              <div 
                className="cursor-pointer" 
                onClick={() => navigate("/")}
              >
                 <img src={prymeLogo} alt="Pryme Logo" className="h-[32px] w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
              </div>

              <div>
                <h1 className="text-[40px] font-bold text-white leading-[1.05] tracking-tight mb-4">
                  Capital for the modern business.
                </h1>
                <p className="text-[16px] text-white/80 font-normal leading-relaxed max-w-[34ch]">
                  Unlock growth with fast, secure, and flexible financing built for scale.
                </p>
              </div>
            </div>

            {/* Bottom Statistics Strip */}
            <div className="relative z-10 w-full">
              <div className="inline-flex items-center gap-4 px-6 py-3.5 bg-white/85 backdrop-blur-md rounded-full text-[#0a1530] text-[13px] font-semibold">
                <div className="flex items-center gap-1 text-[#10B981]">
                  <span className="text-[14px]">★</span>
                  <span className="text-[14px]">★</span>
                  <span className="text-[14px]">★</span>
                  <span className="text-[14px]">★</span>
                  <span className="text-[14px]">★</span>
                  <span className="ml-1 text-[#0a1530]">4.8</span>
                </div>
                <div className="w-[4px] h-[4px] rounded-full bg-slate-300"></div>
                <span>10,000+ Customers</span>
                <div className="w-[4px] h-[4px] rounded-full bg-slate-300"></div>
                <span>15+ Banks</span>
              </div>
            </div>
          </div>"""
content = re.sub(old_left_panel, new_left_panel, content, flags=re.DOTALL)

# 3. Right column reposition (mt-[24px])
content = content.replace('<div className="w-full max-w-[360px] z-10 flex flex-col items-stretch">', '<div className="w-full max-w-[360px] z-10 flex flex-col items-stretch mt-0 lg:mt-[24px]">')

# 4. Google divider spacing
content = content.replace('className="relative my-8"', 'className="relative my-12"')

# 5. Trust footer replacement
old_footer = r'{/\* Fintech Trust Signals \*/\}.*?</motion\.div>'
new_footer = """{/* Fintech Trust Signals */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="mt-12 flex items-center justify-center gap-4 w-full text-slate-400"
                >
                   <div className="flex items-center gap-2">
                      <Shield className="w-[18px] h-[18px] text-slate-400" strokeWidth={1.5} />
                      <span className="text-[13px] font-medium tracking-wide">RBI Compliant</span>
                   </div>
                   <div className="w-[4px] h-[4px] rounded-full bg-slate-300"></div>
                   <div className="flex items-center gap-2">
                      <Lock className="w-[18px] h-[18px] text-slate-400" strokeWidth={1.5} />
                      <span className="text-[13px] font-medium tracking-wide">256-bit Encryption</span>
                   </div>
                </motion.div>"""
content = re.sub(old_footer, new_footer, content, flags=re.DOTALL)

with open('src/pages/Auth.tsx', 'w') as f:
    f.write(content)

