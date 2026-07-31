import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Clock, Loader2, Info, Headphones, Shield, Check, ChevronDown, Phone, ShieldCheck } from "lucide-react";
import { PrymeAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import applyCustomBg from "@/assets/images/apply-bg-custom.jpg";
import comingSoonWallet from "@/assets/images/coming-soon-wallet.png";
import comingSoonRm from "@/assets/images/coming-soon-rm.png";

const PRODUCT_OPTIONS = [
  { value: "PERSONAL_LOAN", label: "Personal Loan" },
  { value: "BUSINESS_LOAN", label: "Business Loan" },
  { value: "HOME_LOAN", label: "Home Loan" },
  { value: "LOAN_AGAINST_PROPERTY", label: "Loan Against Property" },
  { value: "AUTO_LOAN", label: "Auto Loan" },
  { value: "BALANCE_TRANSFER", label: "Balance Transfer / Top Up" },
];

export default function ComingSoonCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get("type");

  const defaultProduct = typeParam === "business" ? "BUSINESS_LOAN" :
                         typeParam === "home" ? "HOME_LOAN" :
                         typeParam === "lap" ? "LOAN_AGAINST_PROPERTY" :
                         typeParam === "auto" ? "AUTO_LOAN" :
                         typeParam === "transfer" ? "BALANCE_TRANSFER" :
                         "PERSONAL_LOAN";

  const [formData, setFormData] = useState({
    name: "",
    contactNo: "",
    product: defaultProduct,
    amount: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.contactNo.length !== 10) {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number.",
        variant: "destructive",
      });
      return;
    }
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) < 10000) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a loan amount of at least ₹10,000.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await PrymeAPI.submitLead({
        fullName: formData.name,
        phone: formData.contactNo,
        loanAmount: Number(formData.amount),
        loanType: formData.product,
      });
      
      setSubmitted(true);
      toast({
        title: "Request Received",
        description: "We have received your callback request. Our team will contact you shortly.",
      });
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#080d1e] flex flex-col relative overflow-hidden">
      <Helmet>
        <title>Coming Soon | Pryme</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Header />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 pt-12 pb-6 md:pt-20 md:pb-8 flex flex-col lg:flex-row items-start gap-8 lg:gap-12 relative z-10">
        
        {/* Left Column: Messages and Illustrations */}
        <div className="flex-1 w-full lg:max-w-2xl flex flex-col justify-center gap-6">
          
          {/* Top Block: Work Under Progress */}
          <div className="p-6 md:p-8 rounded-2xl flex flex-col sm:flex-row items-center gap-6">
            {/* Wallet illustration */}
            <img
              src={comingSoonWallet}
              alt="Work Under Progress"
              className="w-[280px] md:w-[320px] h-auto shrink-0 select-none object-contain"
            />
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2.5xl md:text-3.5xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-snug">
                Work Under Progress for the Selected Loan Product!
              </h2>
              <div className="h-1.5 w-24 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full mt-4 mx-auto sm:mx-0" />
            </div>
          </div>

          {/* Bottom Block: RM Support */}
          <div className="bg-[#edf5ff] dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 p-4 md:p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex-1 text-center sm:text-left">
              <p className="text-base md:text-lg font-bold text-slate-700 dark:text-slate-200 leading-relaxed">
                Meanwhile, you can connect with our RM and get your{" "}
                <span className="text-blue-600 dark:text-blue-400 font-extrabold">
                  personalized comparison report.
                </span>
              </p>
            </div>
            {/* RM Illustration */}
            <img
              src={comingSoonRm}
              alt="RM Support"
              className="w-[180px] md:w-[220px] h-auto shrink-0 select-none object-contain"
            />
          </div>
        </div>

        {/* Right Column: Callback Request Card */}
        <div className="w-full lg:max-w-md shrink-0 flex flex-col">
          <div className="bg-white dark:bg-[#0b1021] border border-slate-100 dark:border-white/5 rounded-2xl p-5 md:p-6 shadow-md flex flex-col justify-between">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 flex-1 flex flex-col justify-center"
              >
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-bold mb-2">Request Submitted</h2>
                <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
                  Thank you! Our expert Relationship Manager will get in touch with you shortly.
                </p>
                <Button onClick={() => navigate("/")} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white">
                  Return to Home
                </Button>
              </motion.div>
            ) : (
              <div className="flex flex-col gap-4 flex-1">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0 border border-blue-100/50 dark:border-blue-900/50">
                    <Headphones className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-bold text-slate-800 dark:text-white leading-none mb-1">Request a call back</h2>
                    <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 leading-normal">
                      Our Relationship Manager will connect with you soon.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
                  <div className="space-y-3">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <Label htmlFor="name" className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Full Name</Label>
                      <Input
                        id="name"
                        required
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-slate-50/50 dark:bg-[#080d1e] border-slate-200/80 dark:border-white/5 h-12 text-xs"
                      />
                    </div>

                    {/* Mobile Number */}
                    <div className="space-y-1">
                      <Label htmlFor="contactNo" className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Mobile Number</Label>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1 px-3 bg-slate-50/80 dark:bg-black/20 border border-slate-200/80 dark:border-white/5 rounded-lg text-xs font-semibold select-none h-12">
                          <span>+91</span>
                          <ChevronDown className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <Input
                          id="contactNo"
                          required
                          type="tel"
                          maxLength={10}
                          pattern="[0-9]{10}"
                          placeholder="Enter your mobile number"
                          value={formData.contactNo}
                          onChange={(e) => setFormData({ ...formData, contactNo: e.target.value.replace(/\D/g, '') })}
                          className="bg-slate-50/50 dark:bg-[#080d1e] border-slate-200/80 dark:border-white/5 h-12 flex-1 text-xs"
                        />
                      </div>
                    </div>

                    {/* Product */}
                    <div className="space-y-1">
                      <Label htmlFor="product" className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Product</Label>
                      <Select
                        value={formData.product}
                        onValueChange={(val) => setFormData({ ...formData, product: val })}
                      >
                        <SelectTrigger className="bg-slate-50/50 dark:bg-[#080d1e] border-slate-200/80 dark:border-white/5 h-12 text-xs">
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCT_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Loan Amount */}
                    <div className="space-y-1">
                      <Label htmlFor="amount" className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Loan Amount (₹)</Label>
                      <Input
                        id="amount"
                        required
                        type="text"
                        placeholder="e.g. 500000"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value.replace(/\D/g, '') })}
                        className="bg-slate-50/50 dark:bg-[#080d1e] border-slate-200/80 dark:border-white/5 h-12 text-xs"
                      />
                    </div>
                  </div>

                  {/* Request Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 text-[14px] font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 rounded-lg mt-3"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Requesting Callback...
                      </>
                    ) : (
                      <>
                        <Phone className="w-4 h-4 fill-white" />
                        Request Call Back
                      </>
                    )}
                  </Button>
                </form>

                {/* Privacy Badge */}
                <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-400 dark:text-slate-500 pt-1.5 border-t border-slate-100 dark:border-white/5">
                  <ShieldCheck className="w-3 h-3 text-slate-400" />
                  <span>We respect your privacy. Your information is safe with us.</span>
                </div>

                {/* Compact Trust Message */}
                <div className="mt-2 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/20 rounded-xl p-2.5 text-[9px] text-slate-500 dark:text-slate-400 leading-normal text-left">
                  <p className="font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1 mb-0.5">
                    <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    Your trust is important to us
                  </p>
                  <p>
                    We follow a <span className="text-blue-600 dark:text-blue-400 font-semibold underline cursor-pointer">no spam policy</span>. Your details will only be used to assist you with your loan journey.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Custom High-Fidelity Cover Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <img
          src={applyCustomBg}
          alt=""
          className="w-full h-full object-cover object-center"
          style={{
            imageRendering: "auto",
            backfaceVisibility: "hidden",
          }}
          loading="eager"
          // @ts-expect-error - fetchPriority missing from React.ImgHTMLAttributes
          fetchPriority="high"
          decoding="async"
          draggable={false}
        />
      </div>
    </div>
  );
}
