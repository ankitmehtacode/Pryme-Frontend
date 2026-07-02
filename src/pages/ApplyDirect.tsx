import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  User, 
  ArrowLeft,
  CheckCircle2,
  Lock,
  ChevronDown,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { PrymeAPI } from "@/lib/api";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Import bank logos
import hdfcLogo from "@/assets/hdfc.svg";
import iciciLogo from "@/assets/icici.svg";
import axisLogo from "@/assets/axis-bank-logo-1.svg";
import kotakLogo from "@/assets/kotak-mahindra-bank-logo-vector_logoshape.com.svg";
import sbiLogo from "@/assets/sbi.svg";
import bobLogo from "@/assets/bob.svg";
import yesLogo from "@/assets/yes-bank-new-logo-download_logoshape.com.svg";
import bajajLogo from "@/assets/bajaj-finserv.svg";
import ltLogo from "@/assets/lt-finance.svg";
import bandhanLogo from "@/assets/bandhan-bank.svg";
import abflLogo from "@/assets/abfl.svg";
import rblLogo from "@/assets/rbl-bank.svg";
import scLogo from "@/assets/sc.svg";
import indusindLogo from "@/assets/indusind.svg";
import jioLogo from "@/assets/jio.svg";
import idfcLogo from "@/assets/idfc.svg";
import idbiLogo from "@/assets/idbi-bank-logo-1.svg";
import tataLogo from "@/assets/tata-capital-logo-svg_logoshape.com.svg";

interface BankDetails {
  id: string;
  name: string;
  logo: string;
}

const BANKS_MAP: Record<string, BankDetails> = {
  hdfc: { id: "hdfc", name: "HDFC BANK", logo: hdfcLogo },
  sbi: { id: "sbi", name: "STATE BANK OF INDIA", logo: sbiLogo },
  icici: { id: "icici", name: "ICICI BANK", logo: iciciLogo },
  axis: { id: "axis", name: "AXIS BANK", logo: axisLogo },
  kotak: { id: "kotak", name: "KOTAK MAHINDRA BANK", logo: kotakLogo },
  bob: { id: "bob", name: "BANK OF BARODA", logo: bobLogo },
  bandhan: { id: "bandhan", name: "BANDHAN BANK", logo: bandhanLogo },
  abfl: { id: "abfl", name: "ADITYA BIRLA FINANCE", logo: abflLogo },
  bajaj: { id: "bajaj", name: "BAJAJ FINSERV", logo: bajajLogo },
  yes: { id: "yes", name: "YES BANK", logo: yesLogo },
  jio: { id: "jio", name: "JIO FINANCE", logo: jioLogo },
  idbi: { id: "idbi", name: "IDBI BANK", logo: idbiLogo },
  tata: { id: "tata", name: "TATA CAPITAL", logo: tataLogo },
  idfc: { id: "idfc", name: "IDFC FIRST BANK", logo: idfcLogo }
};

export default function ApplyDirect() {
  const { bankId } = useParams<{ bankId: string }>();
  const navigate = useNavigate();

  // Resolve bank based on URL (e.g. "bob-hl" -> "bob")
  const getSelectedBank = (): BankDetails => {
    if (!bankId) return BANKS_MAP.hdfc;
    const cleanId = bankId.toLowerCase().split("-")[0];
    return BANKS_MAP[cleanId] || BANKS_MAP.hdfc;
  };

  const selectedBank = getSelectedBank();

  // Retrieve user's pincode from sessionStorage or localStorage
  // Retrieve user's pincode from sessionStorage or localStorage
  const getUserPinCode = (): string => {
    try {
      const loanSessionStr = sessionStorage.getItem("pryme-loan-session");
      if (loanSessionStr) {
        const sessionObj = JSON.parse(loanSessionStr);
        if (sessionObj?.state?.basicKYC?.pinCode) {
          return sessionObj.state.basicKYC.pinCode;
        }
      }
    } catch (e) {
      console.error("Error reading pincode from loan session:", e);
    }
    try {
      const storedState = sessionStorage.getItem("pryme_application_state");
      if (storedState) {
        const state = JSON.parse(storedState);
        if (state?.basicKYC?.pinCode) {
          return state.basicKYC.pinCode;
        }
      }
    } catch (e) {
      console.error("Error reading pincode from application state:", e);
    }
    return localStorage.getItem("pryme_lead_pincode") || "452001";
  };

  const pincode = getUserPinCode();

  // Calculate nearest branch address in Indore based on pincode
  const getBranchAddress = (bankKey: string, pin: string): string => {
    const cleanPin = parseInt(pin.trim(), 10) || 452001;
    const bankName = selectedBank.name;

    // Zone 1: Rau / Outskirts (453331 or prefix 453)
    if (cleanPin === 453331 || pin.trim().startsWith("453")) {
      return `${bankName}, Rau Branch, Rau Main Road, Near Railway Crossing, Indore, MP - 453331`;
    }
    // Zone 2: Vijay Nagar Area (452010, 452012, 452018)
    if (cleanPin === 452010 || cleanPin === 452012 || cleanPin === 452018) {
      return `${bankName}, Vijay Nagar Branch, Scheme No 54, Near Vijay Nagar Square, Indore, MP - 452010`;
    }
    // Zone 3: Palasia / YN Road / Saket (452016, 452003)
    if (cleanPin === 452016 || cleanPin === 452003) {
      return `${bankName}, Palasia Square Branch, YN Road Cross, Indore, MP - 452016`;
    }
    // Zone 4: Annapurna / Sudama Nagar (452009, 452007, 452005)
    if (cleanPin === 452009 || cleanPin === 452007 || cleanPin === 452005) {
      return `${bankName}, Annapurna Road Branch, Near Sudama Nagar, Indore, MP - 452009`;
    }
    // Zone 5: Central Indore / MG Road / GPO (Default / 452001, 452002)
    return `${bankName}, MG Road Branch, Near GPO Square, Indore, MP - 452001`;
  };

  const branchAddress = getBranchAddress(selectedBank.id, pincode);

  const [formData, setFormData] = useState({
    fullName: localStorage.getItem("pryme_lead_name") || "",
    phone: localStorage.getItem("pryme_lead_phone") || "",
    preferredTime: "Morning (9 AM - 12 PM)",
    loanType: "Personal Loan",
    message: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [bankId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = "Enter a valid 10-digit mobile number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await PrymeAPI.submitLead({
        fullName: formData.fullName,
        phone: formData.phone,
        productType: formData.loanType.toUpperCase().replace(/\s/g, "_"),
        loanAmount: 1000000,
        cibilScore: 750,
        monthlyIncome: 50000,
        offerId: selectedBank.id,
        loanPurpose: `Direct Apply Callback Request: time=${formData.preferredTime}, pincode=${pincode}, branch=${branchAddress}, msg=${formData.message}`
      });

      localStorage.setItem("pryme_lead_name", formData.fullName);
      localStorage.setItem("pryme_lead_phone", formData.phone);

      setSuccess(true);
      toast({
        title: "Callback Scheduled",
        description: `Aadesh Kothari will connect with you shortly.`
      });
    } catch (err: any) {
      toast({
        title: "Submission Error",
        description: err.message || "Failed to request callback",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Relationship Manager | PRYME</title>
        <meta name="description" content="View your dedicated loan relationship manager details and request a direct callback." />
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-[#070b13] flex flex-col font-sans transition-colors duration-300">
        <Header />

        <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 md:px-6 pt-24 pb-12 w-full max-w-7xl mx-auto">
          
          {/* Header section with back navigation */}
          <div className="w-full flex items-center justify-between mb-4">
            <Link 
              to="/offers" 
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-bold uppercase tracking-wider transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Offers
            </Link>
          </div>

          {/* Top Status Indicators */}
          <div className="text-center mb-6 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Application Received!
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight leading-none">
              Your Relationship Manager Details
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Our representative will connect with you shortly to assist with your loan process.
            </p>
          </div>

          {/* 2-Column Core Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mb-8 items-stretch">
            
            {/* Left Column: Relationship Manager Details Card */}
            <div className="bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-white/[0.05] rounded-3xl p-5 md:p-6 flex flex-col justify-between shadow-sm relative overflow-hidden h-full">
              <div>
                <div className="flex items-start gap-3.5 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground leading-tight">Relationship Manager Details</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Your dedicated relationship manager will guide you through the next steps.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Bank Name */}
                  <div className="flex items-center justify-between border-b border-dashed border-slate-100 dark:border-white/[0.04] pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Bank Name</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-foreground">{selectedBank.name}</span>
                      {selectedBank.logo && (
                        <img src={selectedBank.logo} alt={selectedBank.name} className="h-5 object-contain shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* RM Name */}
                  <div className="flex items-center justify-between border-b border-dashed border-slate-100 dark:border-white/[0.04] pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Name of Relationship Manager</span>
                    </div>
                    <span className="text-xs font-bold text-foreground uppercase tracking-wide">AADESH KOTHARI</span>
                  </div>

                  {/* Contact Number */}
                  <div className="flex items-center justify-between border-b border-dashed border-slate-100 dark:border-white/[0.04] pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Contact Number</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground font-mono">+91 92432 94291</span>
                      <a href="tel:+919243294291" className="p-1 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:scale-105 transition-all">
                        <Phone className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Branch */}
                  <div className="flex items-start justify-between border-b border-dashed border-slate-100 dark:border-white/[0.04] pb-2.5">
                    <div className="flex items-start gap-2.5 mt-0.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Branch</span>
                        <span className="text-[9px] text-muted-foreground font-semibold">Near Pincode: {pincode}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-foreground text-right max-w-[220px] leading-relaxed uppercase">{branchAddress}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Security Banner */}
              <div className="mt-5 bg-blue-50/50 dark:bg-[#0c1a35]/40 border border-blue-100 dark:border-blue-950/30 p-3 rounded-2xl flex gap-3 items-center">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                  <h5 className="text-[10px] font-extrabold text-blue-950 dark:text-blue-400 uppercase tracking-wider">100% Secure & Confidential</h5>
                  <p className="text-[9px] text-blue-800/80 dark:text-blue-300/60 leading-relaxed font-semibold mt-0.5">
                    Your information is safe with us and will only be shared with authorized bank representatives.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Callback Request Form Card */}
            <div className="bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-white/[0.05] rounded-3xl p-5 md:p-6 flex flex-col justify-between shadow-sm h-full">
              <AnimatePresence mode="wait">
                {!success ? (
                  <motion.form 
                    key="callback-form"
                    onSubmit={handleSubmit} 
                    className="space-y-4"
                    exit={{ opacity: 0 }}
                  >
                    <div className="flex items-start gap-3.5 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-foreground leading-tight">Request a Call Back</h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Fill in your details and our representative will call you back.</p>
                      </div>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className="w-full bg-slate-50/50 dark:bg-[#080f1d] border border-slate-200 dark:border-white/[0.08] text-xs font-semibold text-foreground px-3 py-2 rounded-xl outline-none focus:border-primary shadow-sm"
                      />
                      {errors.fullName && <p className="text-[10px] font-bold text-destructive">{errors.fullName}</p>}
                    </div>

                    {/* Mobile Number */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Mobile Number</label>
                      <input
                        type="tel"
                        name="phone"
                        maxLength={10}
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your 10 digit mobile number"
                        className="w-full bg-slate-50/50 dark:bg-[#080f1d] border border-slate-200 dark:border-white/[0.08] text-xs font-semibold text-foreground px-3 py-2 rounded-xl outline-none focus:border-primary shadow-sm"
                      />
                      {errors.phone && <p className="text-[10px] font-bold text-destructive">{errors.phone}</p>}
                    </div>

                    {/* Preferred Call Time */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Preferred Time to Call</label>
                      <div className="relative">
                        <select
                          name="preferredTime"
                          value={formData.preferredTime}
                          onChange={handleInputChange}
                          className="w-full bg-slate-50/50 dark:bg-[#080f1d] border border-slate-200 dark:border-white/[0.08] text-xs font-semibold text-foreground px-3 py-2 pr-10 rounded-xl outline-none focus:border-primary appearance-none shadow-sm"
                        >
                          <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                          <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                          <option value="Evening (4 PM - 7 PM)">Evening (4 PM - 7 PM)</option>
                          <option value="Anytime">Anytime</option>
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                      </div>
                    </div>

                    {/* Loan Type */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Loan Type</label>
                      <div className="relative">
                        <select
                          name="loanType"
                          value={formData.loanType}
                          onChange={handleInputChange}
                          className="w-full bg-slate-50/50 dark:bg-[#080f1d] border border-slate-200 dark:border-white/[0.08] text-xs font-semibold text-foreground px-3 py-2 pr-10 rounded-xl outline-none focus:border-primary appearance-none shadow-sm"
                        >
                          <option value="Personal Loan">Personal Loan</option>
                          <option value="Home Loan">Home Loan</option>
                          <option value="Loan Against Property">Loan Against Property</option>
                          <option value="Business Loan">Business Loan</option>
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                      </div>
                    </div>

                    {/* Additional Message */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Additional Message (Optional)</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Write your message (optional)"
                        className="w-full bg-slate-50/50 dark:bg-[#080f1d] border border-slate-200 dark:border-white/[0.08] text-xs font-semibold text-foreground px-3 py-2 rounded-xl outline-none focus:border-primary h-16 shadow-sm resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-xl h-10 text-xs font-bold mt-1 text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all flex items-center justify-center gap-1"
                    >
                      {isSubmitting ? "Submitting Callback Request..." : "Request Call Back →"}
                    </Button>

                    {/* Privacy notice */}
                    <div className="text-[10px] text-center text-muted-foreground/70 font-semibold flex items-center justify-center gap-1.5 pt-1">
                      <Lock className="w-3.5 h-3.5" /> We respect your privacy. Your details are safe with us.
                    </div>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="callback-success"
                    className="text-center py-16 space-y-6"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-inner">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-xl font-bold text-foreground">Callback Request Received!</h2>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                        Your direct request has been logged. Aadesh Kothari from {selectedBank.name} branch will call you during your preferred time window.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-8 max-w-sm mx-auto">
                      <Button 
                        onClick={() => navigate("/offers")} 
                        className="rounded-xl h-11 bg-slate-100 border border-slate-200 dark:bg-[#0c162b] dark:border-white/[0.05] text-foreground hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-bold transition-all flex-1"
                      >
                        Return to Offers
                      </Button>
                      <Button 
                        onClick={() => navigate("/")} 
                        className="rounded-xl h-11 text-xs font-bold transition-all flex-1 text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700"
                      >
                        Home Page
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Bottom Trust Row Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-4 bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-white/[0.05] rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider leading-none mb-1">Quick Response</h4>
                <p className="text-[10px] text-muted-foreground leading-tight">We typically respond within 2 hours</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider leading-none mb-1">Expert Assistance</h4>
                <p className="text-[10px] text-muted-foreground leading-tight">Get help from loan experts</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider leading-none mb-1">Hassle Free Process</h4>
                <p className="text-[10px] text-muted-foreground leading-tight">Smooth and transparent experience</p>
              </div>
            </div>
          </div>

        </main>
        
        <Footer />
      </div>
    </>
  );
}
