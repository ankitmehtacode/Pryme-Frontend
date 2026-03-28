import React from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import { Bell, CreditCard, MessageSquare, ShieldCheck, Clock } from "lucide-react";

const Notifications = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0a0a]">
      <Helmet>
        <title>Notifications | PRYME Consulting</title>
      </Helmet>
      
      <Header />
      
      <SmoothScroll>
        <main className="flex-1 pt-32 pb-24">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex items-center justify-between mb-10">
              <h1 className="text-3xl font-semibold text-foreground flex items-center gap-3 tracking-tight">
                <Bell className="w-8 h-8 text-primary" /> Notifications
              </h1>
              <button className="text-sm font-medium text-primary hover:underline italic">Mark all as read</button>
            </div>

            <div className="space-y-4">
              {[
                { icon: ShieldCheck, title: "Identity Verified", text: "Your PAN card and Aadhaar have been successfully cross-verified with NSDL.", time: "2 hours ago", color: "text-violet-500", bg: "bg-violet-500/10" },
                { icon: CreditCard, title: "New Offer Unlocked", text: "HDFC Bank has offered a special interest rate of 8.65% based on your profile.", time: "5 hours ago", color: "text-blue-500", bg: "bg-blue-500/10" },
                { icon: MessageSquare, title: "RM Message Received", text: "Your Relationship Manager has requested additional salary slips for PRY-9042.", time: "1 day ago", color: "text-amber-500", bg: "bg-amber-500/10" },
                { icon: Clock, title: "Session Security", text: "New login alert from Chrome on Windows 11 detected for your account.", time: "2 days ago", color: "text-slate-500", bg: "bg-slate-500/10" }
              ].map((note, i) => (
                <div key={i} className="p-6 rounded-[2rem] bg-card text-card-foreground border border-border flex gap-6 items-start transition-all hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer">
                  <div className={`w-14 h-14 rounded-2xl ${note.bg} flex items-center justify-center shrink-0 border border-white/5`}>
                    <note.icon className={`w-6 h-6 ${note.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground leading-tight uppercase tracking-tight text-sm">{note.title}</h3>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{note.time}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{note.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </SmoothScroll>
    </div>
  );
};

export default Notifications;
