import React, { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { BookOpen, Search, ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { blogs } from "@/data/blogs";

const Blogs = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBlogs = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return blogs;
    return blogs.filter(
      (blog) =>
        blog.title.toLowerCase().includes(query) ||
        blog.cat.toLowerCase().includes(query) ||
        blog.content.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#080d1e]">
      <Helmet>
        <title>Insights & News | PRYME Consulting</title>
        <meta name="description" content="Financial literacy, loan tips, and credit insights from PRYME." />
        <meta property="og:title" content="Insights & News | PRYME Consulting" />
        <meta property="og:description" content="Financial literacy, loan tips, and credit insights from PRYME." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.gopryme.tech/blogs" />
        <meta property="og:image" content="https://www.gopryme.tech/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://www.gopryme.tech/blogs" />
      </Helmet>
      
      <Header />
      
      <SmoothScroll>
        <main className="flex-1 pt-16 md:pt-24">
          <section className="container mx-auto px-4 pb-24">
            <ScrollReveal direction="up">
              <div className="max-w-4xl mx-auto text-center mb-8">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium uppercase tracking-widest mb-4 border border-primary/20">
                  <BookOpen className="w-3.5 h-3.5" />
                  Pryme Insights
                </span>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4 tracking-tight">
                  Financial <span className="text-primary italic">Intelligence</span>
                </h1>
                
                <div className="relative max-w-md mx-auto mt-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search guides, tips, and news..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 pl-11 pr-5 rounded-xl bg-white dark:bg-white/5 border border-border focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-md text-sm text-foreground"
                  />
                </div>
              </div>
            </ScrollReveal>

            {filteredBlogs.length === 0 ? (
              <ScrollReveal direction="up">
                <div className="text-center py-12 max-w-md mx-auto">
                  <p className="text-lg font-medium text-slate-500 dark:text-slate-400">
                    No articles found matching "{searchQuery}"
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-4 px-5 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-sm font-bold transition-all"
                  >
                    Clear search query
                  </button>
                </div>
              </ScrollReveal>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                {filteredBlogs.map((blog, i) => (
                  <ScrollReveal key={i} direction="up" delay={(i % 3) * 0.1}>
                    <Link to={`/blogs/${blog.slug}`} className="group flex flex-col h-full rounded-[2rem] bg-card text-card-foreground border border-border overflow-hidden shadow-xl hover:-translate-y-2 transition-all duration-300">
                      <div className="h-56 shrink-0 overflow-hidden relative">
                        <img src={blog.img} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-[#103783] border border-[#103783]/20">{blog.cat}</div>
                      </div>
                      <div className="p-6 md:p-8 flex flex-col flex-1">
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 uppercase tracking-widest font-medium">
                          <Clock className="w-3 h-3" /> {blog.date}
                        </div>
                        <h3 className="text-xl font-semibold text-[#0a1530] mb-6 group-hover:text-[#103783] transition-colors leading-tight line-clamp-3">
                          {blog.title}
                        </h3>
                        <div className="mt-auto">
                          <span className="flex items-center gap-2 text-sm font-bold text-[#103783] hover:text-[#0b265c] transition-colors">
                            Read Full Article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </section>
        </main>
        <Footer />
      </SmoothScroll>
    </div>
  );
};

export default Blogs;
