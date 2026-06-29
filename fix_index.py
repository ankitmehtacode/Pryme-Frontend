import re

with open("src/pages/Index.tsx", "r") as f:
    content = f.read()

# Fix imports
content = content.replace(
    'import { Section, Container } from "@/components/layout/Primitives";',
    'import { Surface, Section, Container } from "@/components/layout/Primitives";'
)

# Find the main tag
main_start = content.find('<main className="flex-1 w-full pt-16 md:pt-20">')
main_end = content.find('</main>', main_start) + len('</main>')

new_main = """          <main className="flex-1 w-full pt-16 md:pt-20">
            
            {/* 1. TOP OF FUNNEL (Hero, Products, Partners) */}
            <Surface variant="default">
              {/* 🧠 1. HERO SECTION: The Billboard */}
              <Section bleed spacing="xl" className="relative z-30 pt-0" style={{ paddingBlockEnd: "clamp(16px, 2vh, 24px)" }}>
                <SectionBackground variant="hero" />
                <Container size="wide">
                  <HeroSection />
                </Container>
              </Section>

              {/* 🧠 2. THE DYNAMIC PRODUCT GRID & PARTNERS REGION */}
              <ScrollReveal direction="up" duration={0.8}>
                <Section spacing="sm" id="products" className="relative z-20 pt-0 pb-2 md:pb-4 hidden md:block" style={{ paddingBlockStart: 0 }}>
                  <Container size="expanded">
                    <ProductSelectorGrid />
                  </Container>
                </Section>
              </ScrollReveal>

              {/* 🧠 3. STATIC PARTNERSHIP BAR — visible on all breakpoints */}
              <Section spacing="xs" className="relative z-20 pt-0 pb-0">
                <Container size="max">
                  <PartnerBankMarquee />
                </Container>
              </Section>
            </Surface>

            {/* 🧠 4. PAISABAZAAR TERMINAL: EMI & Eligibility Split */}
            <Suspense fallback={<div className="min-h-[200px]" />}>
            <Surface variant="muted">
              <Section spacing="xl" className="relative z-10">
                {/* Gradient section divider */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300/30 dark:via-white/10 to-transparent" />
                {/* Subtle background glow to connect the sections */}
                <div className="absolute top-0 left-1/2 w-full max-w-4xl h-[400px] bg-primary/5 transform-gpu rounded-full pointer-events-none" style={{ transform: "translate3d(-50%, -30%, 0)", willChange: "transform" }} />

                <ScrollReveal direction="up" duration={1} stagger={0.15}>
                <Container size="wide" className="relative z-10">
                  <div className="text-center mb-4 md:mb-8 lg:mb-10">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-3 border border-primary/20">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      Financial Planning
                    </span>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-foreground mb-2 md:mb-3 tracking-tighter">
                      Calculate & Evaluate
                    </h2>
                    <p className="text-base md:text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-normal">
                      Run the math before you apply. Check your EMIs and assess your approval probability instantly.
                    </p>
                  </div>

                  {/* Full Width Stack: EMI & Prepayment (Side-by-Side) -> Rewards */}
                  <div className="flex flex-col gap-6 md:gap-14 lg:gap-16 items-start w-full">
                    
                    {/* Grid layout for Calculators side by side on large screens */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 md:gap-14 lg:gap-8 w-full items-start">
                      {/* EMI Calculator */}
                      <div className="w-full">
                        <EMICalculator loanAmount={500000} showTerminology={true} />
                      </div>
                      
                      {/* Prepayment Calculator */}
                      <div className="w-full">
                        <PrepaymentCalculator />
                      </div>
                    </div>
                    
                    {/* Rewards Calculator */}
                    <div className="w-full">
                      <OffersRewards />
                    </div>

                    {/* Trust Mini-Card */}
                    <div className="w-full max-w-3xl mx-auto bg-primary/5 dark:bg-[#103783]/5 border border-primary/20 dark:border-[#103783]/20 rounded-[2rem] p-5 md:p-6 lg:p-8 shadow-inner text-center">
                      <h4 className="text-primary dark:text-[#103783] font-bold text-base md:text-lg mb-2 md:mb-3 flex items-center justify-center gap-2.5">
                        <Building2 className="w-5 h-5 shrink-0" /> Calculator Analytics
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground dark:text-slate-400 font-medium leading-relaxed">
                        These metrics are calculated using standard banking formulas to give you an overview of your monthly obligations.
                      </p>
                    </div>
                    
                  </div>
                </Container>
                </ScrollReveal>
              </Section>
            </Surface>
            </Suspense>

            {/* 5. BOTTOM OF FUNNEL: Closing the deal (Process & Trust) */}
            <Suspense fallback={<div className="min-h-[200px]" />}>
            <Surface variant="inverse">
              <Section spacing="lg">
                <Container size="wide"><ProcessSection /></Container>
              </Section>
              <ScrollReveal direction="up" duration={1}>
                <Section spacing="lg">
                  <Container size="wide"><TrustMonologue /></Container>
                </Section>
              </ScrollReveal>
              <Section spacing="lg">
                <Container size="wide"><CustomerReviews /></Container>
              </Section>
              <Section spacing="lg">
                <Container size="wide"><TestimonialsSlider /></Container>
              </Section>
            </Surface>
            </Suspense>

            {/* 🧠 6. BLOG PREVIEW & FAQ */}
            <Surface variant="default">
              <Section spacing="xl">
                <Container size="wide">
                  <div className="flex flex-col items-center justify-center text-center mb-12">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-4 border border-primary/20">
                    <BookOpen className="w-4 h-4" />
                    Pryme Insights
                  </span>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground tracking-tight">Financial Intelligence</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {blogs.slice(0, 3).map((blog, i) => (
                    <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                      <Link to={`/blogs/${blog.slug}`} className="group block">
                        <div className="rounded-3xl overflow-hidden mb-6 aspect-video relative">
                          <img src={blog.img} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" decoding="async" />
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                          <Clock className="w-3.5 h-3.5" /> {blog.date}
                        </div>
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">{blog.title}</h3>
                      </Link>
                    </ScrollReveal>
                  ))}
                </div>
                <div className="flex justify-center mt-12">
                  <Button asChild variant="outline" className="text-primary border-primary/20 hover:bg-primary/5 gap-2 rounded-full px-6 text-sm">
                    <Link to="/blogs">View All Articles <ArrowRight className="w-3.5 h-3.5" /></Link>
                  </Button>
                </div>
                </Container>
              </Section>

              {/* Generic FAQ Accordion */}
              <Section spacing="lg">
                <Container size="content">
                  <div className="text-center mb-10">
                  <h2 className="text-2xl md:text-3xl font-semibold text-foreground">Frequently Asked Questions</h2>
                </div>
                <div className="space-y-4">
                  {[
                    { q: "What is PRYME?", a: "PRYME is a loan comparison and aggregation platform that helps you find the most competitive loan rates from 15+ trusted banks and NBFCs in minutes." },
                    { q: "Is PRYME a direct lender?", a: "No, PRYME acts as a technology facilitator and connector. We match your profile with our RBI-regulated lending partners." },
                    { q: "Is my data secure?", a: "Yes. In accordance with strict RBI guidelines and PII standards, your session data is encrypted, processed only for bank matching, and permanently deleted after use." }
                  ].map((faq, i) => (
                    <details key={i} className="group border border-border dark:border-white/10 bg-card rounded-2xl p-6 cursor-pointer">
                      <summary className="font-semibold text-foreground flex justify-between items-center list-none outline-none">
                        {faq.q}
                        <span className="transition group-open:rotate-180">
                          <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                        </span>
                      </summary>
                      <p className="text-slate-600 dark:text-slate-400 mt-4 leading-relaxed font-medium text-sm">
                        {faq.a}
                      </p>
                    </details>
                  ))}
                </div>
                </Container>
              </Section>
            </Surface>
          </main>"""

content = content[:main_start] + new_main + content[main_end:]

with open("src/pages/Index.tsx", "w") as f:
    f.write(content)
