import { Phone, Mail, Clock, Building2, User, MessageSquare, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BankerInfo {
  name: string;
  designation: string;
  bank: string;
  phone: string;
  email: string;
  availability: string;
  photo?: string;
}

interface BankerContactProps {
  banker?: BankerInfo;
}

const defaultBanker: BankerInfo = {
  name: "Aadesh Kothari",
  designation: "Senior Relationship Manager",
  bank: "PRYME Concierge",
  phone: "+91 98765 43210",
  email: "aadesh@pryme.in",
  availability: "Mon-Sat, 9 AM - 6 PM",
};

const BankerContact = ({ banker = defaultBanker }: BankerContactProps) => {
  return (
    <div className="bg-white/5 dark:bg-[#0a0a0a]/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden h-full flex flex-col">
      
      {/* 🧠 Ambient VIP Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[60px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8 relative z-10 pt-2">
        <div className="w-12 h-12 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-inner flex items-center justify-center">
          <Phone className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">Your RM Contact</h3>
          <p className="text-sm font-medium text-slate-500">VIP priority assistance</p>
        </div>
      </div>

      {/* Glowing Avatar & Identity */}
      <div className="flex flex-col items-center text-center mb-8 relative z-10">
        <div className="relative mb-5 group cursor-pointer">
          {/* Holographic ring */}
          <div className="absolute inset-0 bg-primary rounded-full blur-[20px] opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
          
          {/* Main Avatar */}
          <div className="w-24 h-24 rounded-full border-2 border-primary bg-white dark:bg-[#111] shadow-2xl flex items-center justify-center relative z-10 overflow-hidden transition-transform duration-500 group-hover:scale-105">
            {banker.photo ? (
              <img src={banker.photo} alt={banker.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-semibold text-slate-900 dark:text-white">{banker.name.charAt(0)}</span>
            )}
          </div>
          
          {/* Live 'Online' pulsing dot */}
          <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-[3px] border-white dark:border-[#0a0a0a] rounded-full z-20 shadow-sm flex items-center justify-center">
             <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
          </div>
        </div>
        
        <h4 className="font-semibold text-2xl text-slate-900 dark:text-white tracking-tight">{banker.name}</h4>
        <p className="text-xs font-medium text-primary uppercase tracking-widest mt-1.5 mb-3">{banker.designation}</p>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-medium text-slate-600 dark:text-slate-400 shadow-sm">
          <ShieldCheck className="w-3 h-3 text-emerald-500" /> Secure Line Active
        </div>
      </div>

      {/* Data Rows */}
      <div className="space-y-3 mb-8 relative z-10 flex-1">
        <div className="flex items-center gap-4 p-4 bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:border-primary/40 dark:hover:border-primary/40 transition-colors group cursor-pointer shadow-sm">
          <Phone className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{banker.phone}</span>
        </div>
        <div className="flex items-center gap-4 p-4 bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:border-primary/40 dark:hover:border-primary/40 transition-colors group cursor-pointer shadow-sm">
          <Mail className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{banker.email}</span>
        </div>
        <div className="flex items-center gap-4 p-4 bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:border-primary/40 dark:hover:border-primary/40 transition-colors group cursor-default shadow-sm">
          <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors" />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide">{banker.availability}</span>
        </div>
      </div>

      {/* 🧠 CTA Action Grid */}
      <div className="grid grid-cols-2 gap-4 relative z-10 mt-auto">
        <Button className="w-full py-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all duration-300 hover:scale-[1.02]">
          <Phone className="w-4 h-4 mr-2" /> Call Now
        </Button>
        <Button variant="outline" className="w-full py-6 rounded-xl bg-white/50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-medium backdrop-blur-md transition-all duration-300 hover:scale-[1.02] shadow-sm">
          <MessageSquare className="w-4 h-4 mr-2 text-emerald-500" /> WhatsApp
        </Button>
      </div>
    </div>
  );
};

export default BankerContact;