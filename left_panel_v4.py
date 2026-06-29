import re

with open('src/pages/Auth.tsx', 'r') as f:
    content = f.read()

# Replace the Left Panel content block
old_block_pattern = r'\{/\* Logo & Headline \*/\}(.*?)\{/\* ========================================================= \*/'
new_block = """{/* Logo & Headline */}
            <div className="relative z-10 w-full flex flex-col max-w-[400px]">
              <div 
                className="cursor-pointer mb-[72px]" 
                onClick={() => navigate("/")}
              >
                 <img src={prymeLogo} alt="Pryme Logo" className="h-[32px] w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
              </div>

              <div>
                <h1 className="text-[40px] lg:text-[44px] font-bold text-white leading-[1.05] tracking-tight mb-4" style={{ fontFamily: 'Transducer, sans-serif' }}>
                  Business lending, reimagined.
                </h1>
                <p className="text-[16px] text-white/80 font-normal leading-relaxed max-w-[34ch] font-sans">
                  Compare offers from India's leading banks with one secure application.
                </p>
              </div>
            </div>

            {/* Bottom Statistics Strip */}
            <div className="relative z-10 w-full opacity-85">
              <div className="inline-flex items-center gap-4 text-white text-[13px] font-semibold">
                <div className="flex items-center gap-1 text-[#10B981]">
                  <span className="text-[14px]">★</span>
                  <span className="text-[14px]">★</span>
                  <span className="text-[14px]">★</span>
                  <span className="text-[14px]">★</span>
                  <span className="text-[14px]">★</span>
                  <span className="ml-1 text-white">4.8</span>
                </div>
                <div className="w-[4px] h-[4px] rounded-full bg-white/40"></div>
                <span>10,000+ businesses</span>
                <div className="w-[4px] h-[4px] rounded-full bg-white/40"></div>
                <span>15+ lending partners</span>
              </div>
            </div>
          </div>
          
          {/* ========================================================= */"""

content = re.sub(old_block_pattern, new_block, content, flags=re.DOTALL)

with open('src/pages/Auth.tsx', 'w') as f:
    f.write(content)

