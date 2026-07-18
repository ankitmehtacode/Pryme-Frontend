import { useState, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import LeadCaptureGate, { isLeadCaptured } from "@/components/auth/LeadCaptureGate";
import { Helmet } from "react-helmet-async";
import { Shield, Clock, CheckCircle, CheckCircle2, TrendingUp, Info, LockKeyhole, Sparkles, ChevronRight, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import prymeLogo from "@/assets/pryme-typo-logo.svg";
import applyCustomBg from "@/assets/images/apply-bg-custom.png";

// Core Layout & Utilities
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { PrymeAPI } from "@/lib/api"; // 🧠 ARCHITECTURE FIX: Import explicit gateway engine

// Loan Components
import LoanApplicationForm from "@/components/loan/LoanApplicationForm";
import EMICalculator from "@/components/loan/EMICalculator";
import BankComparisonTable from "@/components/loan/BankComparisonTable";
import CibilTips from "@/components/loan/CibilTips";
import OffersRewards from "@/components/loan/OffersRewards";
import ProgressiveContinuationForm from "@/components/loan/ProgressiveContinuationForm";
import RequiredDocuments from "@/components/loan/RequiredDocuments";
import BankerContact from "@/components/loan/BankerContact";
import AnalysisLoader from "@/components/loan/AnalysisLoader";

const spring: any = { type: "spring", stiffness: 120, damping: 24, mass: 0.8 };

const Apply = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loanAmount, setLoanAmount] = useState(500000);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [pendingBankId, setPendingBankId] = useState<string | null>(null);
  const [tenure, setTenure] = useState(5);
  const [showComparison, setShowComparison] = useState(false);
  const [activeContinuationBankId, setActiveContinuationBankId] = useState<string | null>(null);
  const [activeApplicationId, setActiveApplicationId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormFocused, setIsFormFocused] = useState(false);

  // ─── Form focus handlers for glassmorphic effect ──────────────────
  const handleFormFocus = useCallback(() => setIsFormFocused(true), []);
  const handleFormBlur = useCallback((e: React.FocusEvent) => {
    const formContainer = e.currentTarget;
    if (!formContainer.contains(e.relatedTarget as Node)) {
      setIsFormFocused(false);
    }
  }, []);

  // 🧠 State Persistence Matrix
  const [applicationData, setApplicationData] = useState<{
    cibilScore: number;
    monthlyIncome: number;
    productType: string;
    employmentType?: string;
    phone?: string;
    name?: string;
    loanAmount?: number;
    propertyValue?: number;
    engineResults?: any[];
  } | null>(null);

  const bankOffers = useMemo(() => {
    const offers = [
      { id: "hdfc", bankName: "HDFC Bank", maxLoanAmount: 5000000, roi: 10.5, processingFee: "1% + GST", emi: 10724, approvalProbability: 85, processingTime: "24-48 hours", featured: true },
      { id: "sbi", bankName: "State Bank of India", maxLoanAmount: 3500000, roi: 10.25, processingFee: "0.5% + GST", emi: 10649, approvalProbability: 82, processingTime: "3-5 days" },
      { id: "icici", bankName: "ICICI Bank", maxLoanAmount: 4000000, roi: 10.75, processingFee: "1.5% + GST", emi: 10799, approvalProbability: 78, processingTime: "48-72 hours" },
      { id: "axis", bankName: "Axis Bank", maxLoanAmount: 4500000, roi: 11.0, processingFee: "1.25% + GST", emi: 10874, approvalProbability: 72, processingTime: "48 hours" },
      { id: "kotak", bankName: "Kotak Mahindra", maxLoanAmount: 4000000, roi: 10.85, processingFee: "1% + GST", emi: 10799, approvalProbability: 75, processingTime: "24-48 hours" },
    ];
    const sorted = [...offers].sort((a, b) => a.roi - b.roi);
    return sorted.map((offer, index) => ({ ...offer, recommended: index === 0 }));
  }, []);

  const handleFormSubmit = async (data: any) => {
    // 🧠 160 IQ FIX: Prioritize real-time form data over (potentially empty) localStorage
    const leadName = data.fullName || localStorage.getItem("pryme_lead_name") || "Guest";
    const leadPhone = data.phone || localStorage.getItem("pryme_lead_phone") || "";

    // Sync back to localStorage for persistence across the user session
    localStorage.setItem("pryme_lead_name", leadName);
    localStorage.setItem("pryme_lead_phone", leadPhone);
    localStorage.setItem("pryme_lead_pincode", data.pinCode || "");

    setApplicationData({
      cibilScore: data.cibilScore,
      monthlyIncome: data.monthlyIncome,
      productType: data.productType,
      employmentType: data.employmentType,
      phone: leadPhone,
      name: leadName,
      propertyValue: data.estimatedPropertyValue || data.propertyValue || 0
    });
    setLoanAmount(data.loanAmount);
    setTenure(data.loanTenure);

    // 1. Silent Local Cache (Picked up by Dashboard 25% stage)
    localStorage.setItem("pryme_pending_application", JSON.stringify({
      loanType: data.productType,
      employmentType: data.employmentType || "SALARIED",
      loanAmount: data.loanAmount
    }));

    // 2. 🧠 SILENT DATABASE INGESTION: Hit Java PublicLeadController BEFORE comparison
    try {
      const leadRes = await PrymeAPI.submitLead({
        fullName: leadName,
        phone: leadPhone,
        productType: data.productType,
        loanAmount: data.loanAmount,
        cibilScore: data.cibilScore,
        monthlyIncome: data.monthlyIncome,
        // 🧠 PIPELINE FIX: Forward ALL form fields so the metadata JSON blob
        // in the Lead table is fully populated. Without these, the Admin Dashboard
        // shows empty fields for Company Name, Designation, Gross Salary, etc.
        email: data.email,
        panCard: data.panCard,
        dob: data.dob,
        city: data.city,
        state: data.state,
        pinCode: data.pinCode,
        employmentType: data.employmentType,
        financialPath: data.financialPath,
        occupation: data.occupation,
        companyName: data.companyName,
        designation: data.designation,
        officialEmail: data.officialEmail,
        grossSalary: data.grossSalary,
        totalExperienceYears: data.totalExperienceYears,
        businessVintageYears: data.businessVintageYears,
        loanPurpose: data.loanPurpose,
        propertyType: data.propertyType,
        hasCoApplicant: data.hasCoApplicant,
        existingBank: data.existingBank,
        eligibleExistingEmi: data.eligibleExistingEmi,
        itrYearsAvailable: data.itrYearsAvailable,
      });

      // 3. CAPTURE THE UUID FOR THE GATEKEEPER ELEVATION
      if (leadRes?.lead?.id) {
        localStorage.setItem("pryme_pending_lead_id", leadRes.lead.id);
      }
    } catch (error) {
      console.warn("Silent lead capture sync failed.", error);
    }

    let engineData = [];
    try {
      // ── SILICON VALLEY GRADE INCOME NORMALIZATION (DETERMINISTIC) ──
      // Instead of heuristics, we rely on the explicitly typed annual fields 
      // (netProfit / annualGrossReceipts) passed from the UI. If those are present, 
      // we use them to securely anchor the annual income, and mathematically derive 
      // the monthly income. This fixes precision errors and prevents low-earning CAs 
      // from being incorrectly scaled.
      let baseAnnual = 0;
      let baseMonthly = Number(data.monthlyIncome) || 0;

      if (data.financialPath === "PROFESSIONAL" || data.financialPath === "SELF_EMPLOYED") {
        // Favor explicit annual fields over reconstructed monthly fields
        const explicitAnnual = Number(data.netProfit) || Number(data.annualGrossReceipts) || 0;
        if (explicitAnnual > 0) {
          baseAnnual = explicitAnnual;
          baseMonthly = Math.round(explicitAnnual / 12);
        } else {
          baseAnnual = baseMonthly * 12;
        }
      } else {
        // Salaried
        baseAnnual = baseMonthly * 12;
      }

      // ── CO-APPLICANT INCOME: kept separate from the primary applicant's own
      // figures below, not summed into them. A co-applicant's personal salary
      // and a business/professional surrogate's turnover-derived income are
      // measured by different formulas -- the backend resolves the primary
      // applicant's income via whichever program applies (NIP/GST/SEP/etc.)
      // and adds coApplicantMonthlyIncome to the result afterward
      // (EligibilityEngineService's effectiveIncome computation), the same
      // combined-income model PolicyBazaar/BankBazaar-style aggregators use.
      // Blending it in here would double it for NIP (which already re-derives
      // pat from monthlyIncome) and silently vanish for GST/SEP/Banking (which
      // never read monthlyIncome at all) -- see the investigation that led here.
      const applicantIncome = baseMonthly;
      // Co-applicant now goes through the exact same employment form/options as
      // the primary applicant (EmploymentDetailsFields), so their monthly income
      // is already correctly resolved in the store via the same GST-margin/ITR
      // formulas -- SALARIED keeps it in netMonthlySalary, PROFESSIONAL/
      // SELF_EMPLOYED derive it into netMonthlyIncome on every relevant field
      // change. No need to re-derive it here, just read the resolved figure.
      const coApplicantFin = data.coApplicantDetails?.financialDetails;
      const coApplicantIncome = data.hasCoApplicant && coApplicantFin
        ? (coApplicantFin.path === "SALARIED"
            ? Number(coApplicantFin.data?.netMonthlySalary || 0)
            : coApplicantFin.path === "PROFESSIONAL" || coApplicantFin.path === "SELF_EMPLOYED"
              ? Number(coApplicantFin.data?.netMonthlyIncome || 0)
              : 0)
        : 0;

      // ── CO-APPLICANT EMI: unlike income (which is resolved via different
      // surrogate formulas per employment path and so must be combined on the
      // backend, see above), existingEMI/maturingLoanEMI are the same flat
      // field across every path -- combine them client-side into a single
      // household total. Without this, the co-applicant's income raises
      // effectiveIncome (and the FOIR band it's selected against) but their
      // own debt burden never reduces it back down.
      const coApplicantExistingEmi = data.hasCoApplicant && coApplicantFin
        ? Number(coApplicantFin.data?.existingEMI || 0)
        : 0;
      const coApplicantMaturingLoanEmi = data.hasCoApplicant && coApplicantFin
        ? Number(coApplicantFin.data?.maturingLoanEMI || 0)
        : 0;

      // ── BUG-3 FIX: Compute age from DOB instead of hardcoding 35 ──
      let computedAge = 35;
      if (data.dob) {
        const birthDate = new Date(data.dob);
        if (!isNaN(birthDate.getTime())) {
          computedAge = Math.floor((Date.now() - birthDate.getTime()) / 3.156e+10);
        }
      }

      // ── UNIFIED INCOME PAYLOAD (multi-program cascade) ──
      // The backend no longer hurries to a single frontend-guessed program:
      // EligibilityEngineService.evaluateProductCascaded exhaustively tries
      // every program applicable to the applicant's employment type (see
      // CANDIDATE_PROGRAMS_BY_EMPLOYMENT: SALARIED→[NIP], SEP→[NIP,SEP,
      // CPM_SEP], SENP→[NIP,GST,BANKING]) and picks the genuine best offer.
      // That only works if this payload actually carries every program's
      // raw fields at once -- previously this switched to ONE program
      // (via an inaccurate client-side GST margin heuristic) and silently
      // dropped the applicant's other data, so the backend had nothing to
      // evaluate for the programs it now checks. programName here is
      // advisory: it only decides whether NIP passes pat/depreciation
      // through unchanged vs. re-deriving from monthlyIncome (see
      // buildRequestForProgram).
      let incomeInput: any = { programName: "NIP" };

      if (data.financialPath === "SALARIED") {
        // Salaried: No surrogate program needed.
        incomeInput = {
          programName: "NIP",
          pat: baseAnnual,   // Safely annualized, primary applicant only
          depreciation: null,
          interestExpense: null,
        };
      } else if (data.financialPath === "PROFESSIONAL") {
        // SEP needs grossReceipts+profession; CPM_SEP additionally needs
        // pat+depreciation (its formula is PAT + Depreciation x multiplier).
        // Send both so the backend can genuinely evaluate both candidates
        // instead of only ever trying the one program this form used to
        // hardcode. GST is also a candidate for select professions (e.g.
        // IndusInd allow-lists Doctor/MBBS/BDS/CA/Architect on its GST HL/LAP
        // rows) -- forward the turnover so the backend can attempt it too.
        // GST registration in India is turnover-based, not occupation-based,
        // so a CA/doctor/architect practice above the threshold registers
        // and files as a service provider; "Service" is the correct margin
        // bucket per the curated sheet's Margin-by-occupation column
        // (Service 10% / Retailer / Wholesale / Manufacturer / Trader), not
        // just a fallback to avoid a zero margin.
        incomeInput = {
          programName: "SEP",
          grossReceipts: data.annualGrossReceipts || baseAnnual,
          profession: data.professionalSubType || "CA",
          pat: data.netProfit || 0,
          depreciation: data.depreciation || 0,
          gstrTurnover12Months: data.last12MonthsGstTurnover || 0,
          businessType: "Service",
        };
      } else if (data.financialPath === "SELF_EMPLOYED") {
        // SENP candidates are NIP, GST, BANKING -- send whatever raw data
        // the applicant actually entered for each. Declare programName
        // "NIP" whenever real ITR net profit was reported, so the backend
        // passes pat/depreciation through unchanged (preserving the real
        // depreciation add-back) instead of re-deriving a depreciation-less
        // estimate from monthlyIncome; this doesn't suppress GST/BANKING --
        // those are still evaluated as separate candidates from the same
        // unified fields.
        const hasItrProfit = Number(data.netProfit) > 0;
        const hasGstTurnover = Number(data.last12MonthsGstTurnover) > 0;
        incomeInput = {
          programName: hasItrProfit ? "NIP" : (hasGstTurnover ? "GST" : "NIP"),
          pat: data.netProfit || 0,
          depreciation: data.depreciation || 0,
          // Caps PAT+Depreciation in SurrogateIncomeResolver.resolveNip() so a large
          // self-reported depreciation add-back can't inflate income past what the
          // business actually turns over. annualTurnover (the ITR-relevant figure)
          // takes priority; GST turnover / gross receipts are fallbacks for cases
          // where turnover itself wasn't entered.
          grossReceipts: data.annualTurnover || data.last12MonthsGstTurnover || data.annualGrossReceipts || 0,
          gstrTurnover12Months: data.last12MonthsGstTurnover || 0,
          businessType: data.businessIndustryType || "Service",
          averageBankBalance: data.averageBankBalance || 0,
        };
      } else {
        // Fallback: use NIP with safely annualized income
        incomeInput = {
          programName: "NIP",
          pat: baseAnnual,
          depreciation: null,
          interestExpense: null,
        };
      }

      const payload = {
        lenderId: null, // Aggregator Mode — evaluate across all lenders
        // BUG-1 FIX: Raw loanType enum from the store. No transformation.
        loanType: data.productType || "HOME_LOAN",
        cibilScore: data.cibilScore || 750,
        // BUG-3 FIX: Computed age, not hardcoded
        applicantAge: computedAge,
        employmentType: data.employmentType?.toUpperCase() || "SALARIED",
        // BUG-4 FIX: Real property type from form
        propertyType: data.propertyType || null,
        propertyCategory: data.propertyCategory || null,
        businessPropertyCategory: data.businessPropertyCategory || null,
        cityTier: "TIER_1",
        loanAmount: data.loanAmount || 0,
        propertyValue: data.estimatedPropertyValue || data.propertyValue || data.loanAmount * 1.5 || 0,
        requestedTenureMonths: (data.loanTenure || 5) * 12,
        monthlyIncome: applicantIncome,
        // Pre-tax salary (SALARIED only, see EmploymentDetailsFields.tsx).
        // Used as the minIncome-check fallback, and as the income base for
        // Bandhan Bank/HDFC HL's Salaried FOIR formula (Gross Salary x FOIR)
        // -- see EligibilityEngineService.isGrossSalaryFoirLender.
        grossMonthlyIncome: data.financialPath === "SALARIED" ? (data.grossSalary || null) : null,
        // Added to the primary applicant's surrogate-resolved income on the
        // backend (not blended in here) -- see EligibilityEngineService's
        // effectiveIncome computation.
        coApplicantMonthlyIncome: coApplicantIncome || null,
        // Household total -- primary applicant's own EMI + co-applicant's,
        // deducted from computedIncome * FOIR on the backend (i.e. after FOIR
        // is applied, not before -- see calculateMaxEligibleAmount).
        existingEmiTotal: (data.eligibleExistingEmi || 0) + coApplicantExistingEmi,
        maturingLoanEmi: (data.maturingLoanEmi || 0) + coApplicantMaturingLoanEmi,
        businessAgeYears: data.businessVintageYears || data.totalPracticeYears || 0,
        workExpYears: data.totalExperienceYears || data.totalPracticeYears || 0,
        idempotencyKey: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7),
        // GEO-FENCE: Pass pinCode to engine for Indore-only validation
        pinCode: data.pinCode || "",
        // BUG-2 FIX: Correct field names matching Java IncomeComputationInput record
        incomeComputationInput: incomeInput,
        itrYearsAvailable: data.itrYearsAvailable !== undefined && data.itrYearsAvailable !== null ? Number(data.itrYearsAvailable) : null
      };
      const engineRes = await PrymeAPI.evaluateEligibility(payload);
      if (engineRes && Array.isArray(engineRes)) {
        engineData = engineRes;
      }
    } catch (engineError) {
      console.error("Eligibility Engine evaluation failed:", engineError);
    }

    setApplicationData((prev: any) => ({
      ...prev,
      cibilScore: data.cibilScore,
      monthlyIncome: data.monthlyIncome,
      productType: data.productType,
      employmentType: data.employmentType,
      phone: leadPhone,
      name: leadName,
      loanAmount: data.loanAmount,
      engineResults: engineData
    }));

    setIsAnalyzing(true);
  };

  const handleAnalysisComplete = () => {
    setIsAnalyzing(false);
    navigate("/offers", {
      state: {
        cibilScore: applicationData?.cibilScore,
        productType: applicationData?.productType,
        employmentType: applicationData?.employmentType,
        monthlyIncome: applicationData?.monthlyIncome,
        loanAmount: loanAmount,
        loanTenure: tenure,
        propertyValue: applicationData?.propertyValue,
        fullName: applicationData?.name || localStorage.getItem("pryme_lead_name") || "Guest",
        engineResults: applicationData?.engineResults || [],
        // 🧠 RELAY FIX: Pass leadId so Offers.tsx can forward it to Auth.tsx
        leadId: localStorage.getItem("pryme_pending_lead_id") || undefined,
      },
    });
  };

  const handleApplyDirect = (bankId: string) => {
    navigate(`/apply-direct/${bankId}`);
  };

  // 🧠 THE CORE GATEWAY: Pushes intent -> Auth -> Inline Progressive Continuation
  const handleApplyWithPyrme = async (bankId: string) => {
    const bank = bankOffers.find(b => b.id === bankId);

    // Cache exact target to resolve later
    localStorage.setItem("pryme_target_bank", bank?.bankName || "Pryme Aggregator");

    if (!isLeadCaptured() && !user) {
      // High-intent action intercepted: Trigger the Auth Gate now
      setPendingBankId(bankId);
      setShowAuthGate(true);
      return;
    }

    // 🧠 160 IQ ELEVATION HANDSHAKE
    // Before showing the form, ensure we have a valid LoanApplication footprint in Java
    if (user?.id) {
      const pendingLeadId = localStorage.getItem("pryme_pending_lead_id");
      const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

      if (pendingLeadId && isUuid(pendingLeadId) && isUuid(user.id)) {
        try {
          const targetBank = localStorage.getItem("pryme_target_bank") || "Pryme Aggregator";
          const elevationRes = await PrymeAPI.elevateLead(pendingLeadId, user.id, targetBank);
          if (elevationRes?.applicationId) {
            setActiveApplicationId(elevationRes.applicationId);
            localStorage.removeItem("pryme_pending_lead_id");
          }
        } catch (error: any) {
          // 🧠 409 CONFLICT RECOVERY: Lead already elevated
          if (error.message?.includes("already been converted") || error.message?.includes("409")) {
            localStorage.removeItem("pryme_pending_lead_id");
          }
          console.error("Lead elevation failed:", error);
          try {
            const myApps = await PrymeAPI.getMyApplications();
            if (myApps && myApps.length > 0) {
              setActiveApplicationId(myApps[0].applicationId);
            }
          } catch (e) { /* ignore */ }
        }
      } else {
        // No lead? Check if they already have an application
        try {
          const myApps = await PrymeAPI.getMyApplications();
          if (myApps && myApps.length > 0) {
            setActiveApplicationId(myApps[0].applicationId);
          }
        } catch (e) { /* ignore */ }
      }
    }

    // Step 3: Trigger Progressive Continuation Form directly beneath instead of hard reload
    setActiveContinuationBankId(bankId);
  };

  const features = [
    { icon: Shield, label: "256-bit Encrypted", color: "text-blue-500" },
    { icon: CheckCircle, label: "Real-time Offers", color: "text-primary dark:text-[#103783]" },
  ];

  return (
    <>
      <Helmet>
        <title>Apply for Loans | PRYME Intelligent Aggregator</title>
        <meta name="description" content="Compare loan offers from top banks. Apply for personal, business, or home loans securely." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {showAuthGate && (
        <LeadCaptureGate
          onCaptured={() => {
            setShowAuthGate(false);
            if (pendingBankId) {
              handleApplyWithPyrme(pendingBankId);
            }
          }}
        />
      )}

      <AnalysisLoader
        isVisible={isAnalyzing}
        onComplete={handleAnalysisComplete}
        data={applicationData}
      />

      {/* 🧠 UI FIX: Changed hardcoded black `#080d1e` to semantic adaptive `bg-slate-50 dark:bg-[#080d1e]` */}
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#080d1e] selection:bg-primary/20 selection:text-primary relative overflow-x-hidden transition-colors duration-300">

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

        <Header />

        <main className="flex-1 w-full flex flex-col items-center min-h-[90vh] pt-24 md:pt-28 pb-12 relative z-10">
          <AnimatePresence mode="wait">
            {!showComparison ? (
              <motion.section
                key="application-form"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)", y: -20 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-4xl px-4 md:px-8 flex-1 flex flex-col justify-center my-auto"
              >
                {/* Minimalist Centered Header */}
                <div className="text-center mb-6 w-full max-w-2xl mx-auto">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 shadow-sm"
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-500" /> Bank-Grade 256-bit Encryption
                  </motion.div>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 text-foreground leading-tight">
                    Unlock Your Premium <span className="text-primary dark:text-blue-500">Offers</span>
                  </h1>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground flex items-center justify-center gap-2 leading-relaxed">
                    Check eligibility across 15+ premium banks instantly. Zero impact on your CIBIL score.
                  </p>
                </div>

                {/* Premium Fintech Card Container */}
                <div
                  className="w-full relative"
                  onFocus={handleFormFocus}
                  onBlur={handleFormBlur}
                  tabIndex={-1}
                  style={{ outline: "none" }}
                >
                  <motion.div
                    className="relative bg-white dark:bg-[#0a1224] border border-slate-200 dark:border-white/[0.08] shadow-2xl overflow-hidden z-10 transition-colors duration-500"
                    animate={{
                      boxShadow: isFormFocused
                        ? "0 25px 50px -12px rgba(16, 55, 131, 0.15), 0 0 0 1px rgba(16, 55, 131, 0.1)"
                        : "0 10px 30px -10px rgba(0,0,0,0.05)",
                      transform: isFormFocused ? "translateY(-2px)" : "translateY(0px)",
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{ borderRadius: "1.5rem" }}
                  >
                    {/* Sophisticated subtle inner glow, stripped of over-the-top Web3 stuff */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 dark:via-blue-500/30 to-transparent" />

                    <div className="p-5 md:p-8 relative z-10">
                      <LoanApplicationForm
                        onAmountChange={setLoanAmount}
                        onFormSubmit={handleFormSubmit}
                      />
                    </div>
                  </motion.div>
                </div>
              </motion.section>
            ) : (
              <motion.div


                id="comparison-dashboard"
                initial={{ opacity: 0, y: 60, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={spring}
                className="w-full relative z-20 pb-20"
              >
                <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 dark:via-[#103783]/30 to-transparent mb-16" />

                <div className="container mx-auto px-4 max-w-7xl space-y-8">
                  {/* ── SECTION A: Psychological Anchors (Top Fold) ────────────────── */}
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
                    {/* Main Approval Anchor */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-primary/10 to-transparent dark:from-[#103783]/10 border border-primary/20 dark:border-[#103783]/20 p-6 md:p-8 rounded-[2rem] shadow-lg relative overflow-hidden backdrop-blur-sm flex flex-col justify-center">
                      <div className="absolute top-0 right-0 p-6 opacity-20">
                        <CheckCircle className="w-24 h-24 text-primary dark:text-[#103783]" />
                      </div>
                      <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-primary/10 dark:bg-[#103783]/10 border border-primary/30 text-[10px] font-bold text-primary dark:text-[#103783] uppercase tracking-widest">
                          <Sparkles className="w-3.5 h-3.5" /> High Approval Odds
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-2">
                          78% Probability
                        </h2>
                        <p className="text-sm font-medium text-muted-foreground">
                          Based on your CIBIL and entered income.
                        </p>

                        <div className="mt-6 w-full h-2 rounded-full bg-secondary overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "78%" }}
                            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Secondary Anchors */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                      <div className="bg-card/60 dark:bg-slate-900/40 border border-border p-6 rounded-[2rem] shadow-sm backdrop-blur-sm flex flex-col justify-center">
                        <div className="w-10 h-10 rounded-[1rem] bg-amber-500/10 flex items-center justify-center mb-4">
                          <TrendingUp className="w-5 h-5 text-amber-500" />
                        </div>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Pre-approved Range</p>
                        <p className="text-xl font-bold text-foreground">₹{(loanAmount * 0.9).toLocaleString('en-IN')} – ₹{(loanAmount * 1.5).toLocaleString('en-IN')}</p>
                      </div>

                      <div className="bg-card/60 dark:bg-slate-900/40 border border-border p-6 rounded-[2rem] shadow-sm backdrop-blur-sm flex flex-col justify-center">
                        <div className="w-10 h-10 rounded-[1rem] bg-emerald-500/10 flex items-center justify-center mb-4">
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        </div>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Pryme Score</p>
                        <p className="text-xl font-bold text-foreground">82 / 100</p>
                      </div>

                      <div className="sm:col-span-2 bg-blue-500/5 border border-blue-500/10 p-5 rounded-2xl flex items-center gap-4">
                        <Clock className="w-6 h-6 text-blue-500 shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-blue-900 dark:text-blue-400">Estimated Disbursal: 24-48 hrs</p>
                          <p className="text-[11px] font-medium text-blue-700/70 dark:text-blue-300/60 mt-0.5">Physical document pickup available in your pin code.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── SECTION B: Smart Nudges ────────────────────────────── */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 py-2">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 border border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <TrendingUp className="w-3.5 h-3.5 text-primary" /> {bankOffers.length} Lenders Match Your Profile
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5" /> No impact on credit score
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider hidden md:flex">
                      <LockKeyhole className="w-3.5 h-3.5" /> 256-bit Encryption
                    </div>
                  </div>

                  {/* ── SECTION C: Loan Comparison Matrix OR Progressive Form ──────────────────── */}

                  <AnimatePresence mode="wait">
                    {activeContinuationBankId ? (
                      <motion.div
                        key="continuation-form"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={spring}
                      >
                        {(() => {
                          const bank = bankOffers.find(b => b.id === activeContinuationBankId);
                          if (!bank) return null;
                          return (
                            <ProgressiveContinuationForm
                              applicationId={activeApplicationId}
                              bankId={bank.id}
                              bankName={bank.bankName}
                              loanAmount={loanAmount}
                              emi={bank.emi}
                              roi={bank.roi}
                              productType={applicationData?.productType || "Personal Loan"}
                              employmentType={applicationData?.employmentType || "Salaried"}
                              onCancel={() => setActiveContinuationBankId(null)}
                              onComplete={() => {
                                toast({ title: "Pipeline Secured", description: "All documents verified. Redirecting to your portfolio tracking dashboard..." });
                                navigate("/dashboard");
                              }}
                            />
                          );
                        })()}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="comparison-table"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={spring}
                        className="bg-card text-card-foreground rounded-[2rem] border border-border shadow-2xl overflow-hidden"
                      >
                        <BankComparisonTable
                          offers={bankOffers}
                          loanAmount={loanAmount}
                          tenure={tenure}
                          onApplyDirect={handleApplyDirect}
                          onApplyWithPyrme={handleApplyWithPyrme}
                        />
                        <div className="p-4 bg-secondary/50 dark:bg-[#0a1530] border-t border-border flex items-start gap-3">
                          <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide leading-relaxed">
                            Offers are sorted by interest rate. The "Recommended" badge indicates the mathematically best rate available based on your entered parameters. Final rates are subject to physical document verification.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {applicationData && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-[2rem] p-6 shadow-xl h-full">
                        <RequiredDocuments productType={applicationData.productType} />
                      </div>
                      <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-[2rem] p-6 shadow-xl h-full flex flex-col justify-center">
                        <BankerContact />
                      </div>
                    </div>
                  )}

                  <div className="pt-8">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-foreground tracking-tight">Exclusive PRYME Rewards</h3>
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Apply through us to get these benefits.</p>
                    </div>
                    <OffersRewards />
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </main>
        <Footer />
      </div>
    </>
  );
};

export default Apply;