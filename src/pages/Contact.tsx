import React from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#080d1e]">
      <Helmet>
        <title>Contact Us | PRYME Consulting</title>
        <meta name="description" content="Get in touch with PRYME's financial experts." />
      </Helmet>
      
      <Header />
      
      <SmoothScroll>
        <main className="flex-1 pt-24 md:pt-32">
          <section className="container mx-auto px-4 pb-24">
            <ScrollReveal direction="up">
              <div className="max-w-4xl mx-auto text-center mb-16">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-6 border border-primary/20">
                  <Mail className="w-4 h-4" />
                  Support Desk
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-8 tracking-tight">
                  How Can We <span className="text-primary italic">Help?</span>
                </h1>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              <ScrollReveal direction="up">
                <div className="bg-card text-card-foreground rounded-[2.5rem] border border-border p-8 md:p-12 shadow-2xl">
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground ml-1">Full Name</label>
                        <input type="text" placeholder="Rahul Sharma" className="w-full px-5 py-4 rounded-2xl bg-secondary border border-border focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground ml-1">Email Address</label>
                        <input type="email" placeholder="you@example.com" className="w-full px-5 py-4 rounded-2xl bg-secondary border border-border focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground ml-1">Message</label>
                      <textarea rows={5} placeholder="How can our experts assist you?" className="w-full px-5 py-4 rounded-2xl bg-secondary border border-border focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"></textarea>
                    </div>
                    <Button className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-semibold text-lg gap-2">
                      Send Message <Send className="w-5 h-5" />
                    </Button>
                  </form>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up">
                <div className="flex flex-col gap-8 h-full">
                  {[
                    { icon: Phone, title: "Call Us", detail: "+91 92432 94291", sub: "Mon-Sat, 10AM - 7PM" },
                    { icon: Mail, title: "Email Support", detail: "hello@gopryme.in", sub: "24/7 Priority Response" },
                    { icon: MapPin, title: "Headquarters", detail: "Indore HQ", sub: "4th Floor, Above Mr. DIY Showroom,\nRanjeet Hanuman Main Road, Mhow Naka Square,\nIndore, Madhya Pradesh, 452009, India" }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 items-start p-6 rounded-3xl bg-secondary/50 border border-border backdrop-blur-sm">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-semibold text-foreground mb-1">{item.title}</h4>
                        <p className="text-xl text-primary font-medium">{item.detail}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed whitespace-pre-line break-words">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </section>
        </main>
        <Footer />
      </SmoothScroll>
    </div>
  );
};

export default Contact;
