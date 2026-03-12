import React from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import { User, Shield, CreditCard, Bell, LogOut, ChevronRight, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0a0a]">
      <Helmet>
        <title>My Profile | PRYME Consulting</title>
      </Helmet>
      
      <Header />
      
      <SmoothScroll>
        <main className="flex-1 pt-32 pb-24">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Sidebar Nav */}
              <div className="w-full md:w-64 space-y-2">
                {[
                  { icon: User, label: "Personal Info", active: true },
                  { icon: Shield, label: "KYC Status", active: false },
                  { icon: CreditCard, label: "Bank Accounts", active: false },
                  { icon: Bell, label: "Preferences", active: false },
                ].map((item, i) => (
                  <button key={i} className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${item.active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-white/5'}`}>
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
                <button onClick={signOut} className="w-full flex items-center gap-3 p-4 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 mt-8 transition-all">
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>

              {/* Main Content */}
              <div className="flex-1 space-y-8">
                <div className="bg-white dark:bg-[#050505] rounded-[2.5rem] border border-slate-200 dark:border-white/10 p-8 shadow-xl">
                  <div className="flex items-center gap-6 mb-10">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-3xl bg-slate-200 dark:bg-white/10 flex items-center justify-center border-2 border-primary overflow-hidden">
                        <User className="w-12 h-12 text-slate-400" />
                      </div>
                      <button className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-slate-900 dark:text-white uppercase tracking-tight">{user?.name || "Member"}</h2>
                      <p className="text-slate-500 dark:text-slate-400">Verified User Session</p>
                      <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20">
                         <Shield className="w-3 h-3" /> VERIFIED ACCOUNT
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Identity Details</p>
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <p className="text-xs text-slate-500 mb-1">Phone Number</p>
                        <p className="font-medium text-slate-900 dark:text-white">+91 98XXX XXX01</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <p className="text-xs text-slate-500 mb-1">PAN Card</p>
                        <p className="font-medium text-slate-900 dark:text-white">ABCDEXXXXF</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Professional Status</p>
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <p className="text-xs text-slate-500 mb-1">Employment</p>
                        <p className="font-medium text-slate-900 dark:text-white uppercase tracking-widest text-xs">Salaried Information</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <p className="text-xs text-slate-500 mb-1">Monthly Income</p>
                        <p className="font-medium text-slate-900 dark:text-white">₹85,000</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10">
                    <Button className="rounded-xl h-12 px-8 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20">Update Profile</Button>
                  </div>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/20 flex gap-6 items-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Shield className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-amber-900 dark:text-amber-400">KYC Verification Incomplete</h4>
                    <p className="text-sm text-amber-900/70 dark:text-amber-400/60 mt-1">Upload your Aadhaar and Photograph to unlock instant pre-approved offers from 5 top banks.</p>
                  </div>
                  <Button variant="outline" className="text-amber-600 border-amber-500/30 hover:bg-amber-500/10">
                    Finish KYC <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </SmoothScroll>
    </div>
  );
};

export default Profile;
