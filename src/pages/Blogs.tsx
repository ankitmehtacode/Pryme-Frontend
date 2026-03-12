import React from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { BookOpen, Search, ArrowRight, Clock } from "lucide-react";

const Blogs = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0a0a]">
      <Helmet>
        <title>Insights & News | PRYME Consulting</title>
        <meta name="description" content="Financial literacy, loan tips, and credit insights from PRYME." />
      </Helmet>
      
      <Header />
      
      <SmoothScroll>
        <main className="flex-1 pt-24 md:pt-32">
          <section className="container mx-auto px-4 pb-24">
            <ScrollReveal direction="up">
              <div className="max-w-4xl mx-auto text-center mb-16">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-6 border border-primary/20">
                  <BookOpen className="w-4 h-4" />
                  Pryme Insights
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-slate-900 dark:text-white mb-8 tracking-tight">
                  Financial <span className="text-primary italic">Intelligence</span>
                </h1>
                
                <div className="relative max-w-2xl mx-auto mt-12">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input type="text" placeholder="Search guides, tips, and news..." className="w-full h-14 pl-14 pr-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-lg" />
                </div>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
              {[
                { title: "Building a 800+ CIBIL Score", cat: "Credit Tips", date: "Mar 10, 2024", img: "https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=800&auto=format&fit=crop" },
                { title: "Home Loans: Resale vs New Construction", cat: "Guides", date: "Mar 08, 2024", img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800&auto=format&fit=crop" },
                { title: "MSME Loans for Digital Businesses", cat: "Business", date: "Mar 05, 2024", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop" }
              ].map((blog, i) => (
                <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                  <div className="group rounded-[2rem] bg-white dark:bg-[#050505] border border-slate-200 dark:border-white/10 overflow-hidden shadow-xl hover:-translate-y-2 transition-all duration-300">
                    <div className="h-56 overflow-hidden relative">
                      <img src={blog.img} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/20">{blog.cat}</div>
                    </div>
                    <div className="p-8">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 uppercase tracking-widest font-medium">
                        <Clock className="w-3 h-3" /> {blog.date}
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 group-hover:text-primary transition-colors leading-tight">{blog.title}</h3>
                      <button className="flex items-center gap-2 text-sm font-bold text-primary italic">
                        Read Analytics <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>
        </main>
        <Footer />
      </SmoothScroll>
    </div>
  );
};

export default Blogs;
