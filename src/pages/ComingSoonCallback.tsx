import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Clock, Loader2, Info } from "lucide-react";
import { PrymeAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <Helmet>
        <title>Coming Soon | Pryme</title>
      </Helmet>

      <Header />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 pt-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-5 md:p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-foreground mb-1">Work In Progress</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 justify-center">
                <Info className="w-3.5 h-3.5" />
                This product is launching soon. Drop your details and we'll reach out!
              </p>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2">Request Submitted</h2>
                <p className="text-muted-foreground mb-6">
                  Thank you! Our expert will get in touch with you shortly.
                </p>
                <Button onClick={() => navigate("/")} className="w-full">
                  Return to Home
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      required
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-background/50 h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="contactNo">Mobile Number</Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                        +91
                      </div>
                      <Input
                        id="contactNo"
                        required
                        type="tel"
                        maxLength={10}
                        pattern="[0-9]{10}"
                        placeholder="99999 99999"
                        value={formData.contactNo}
                        onChange={(e) => setFormData({ ...formData, contactNo: e.target.value.replace(/\D/g, '') })}
                        className="pl-12 bg-background/50 h-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="product">Product</Label>
                    <Select
                      value={formData.product}
                      onValueChange={(val) => setFormData({ ...formData, product: val })}
                    >
                      <SelectTrigger className="bg-background/50 h-10">
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

                  <div className="space-y-1.5">
                    <Label htmlFor="amount">Loan Amount (₹)</Label>
                    <Input
                      id="amount"
                      required
                      type="text"
                      placeholder="e.g. 500000"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value.replace(/\D/g, '') })}
                      className="bg-background/50 h-10"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-[15px] font-semibold mt-4"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Requesting Callback...
                    </>
                  ) : (
                    "Request a Callback"
                  )}
                </Button>
              </form>
            )}
          </div>
        </motion.div>
      </main>

      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.08] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDAuNWg0ME0wIDM5LjVoNDBNMC41IDB2NDBNMzkuNSAwdjQwIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDAuNWg0ME0wIDM5LjVoNDBNMC41IDB2NDBNMzkuNSAwdjQwIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')]" />
        
        {/* Abstract Fintech Graphic (Line Chart + Nodes) */}
        <svg className="absolute top-1/4 right-[-10%] w-3/4 max-w-3xl opacity-[0.15] text-primary mix-blend-multiply dark:mix-blend-screen" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 350L150 200L250 250L400 100L550 150L800 0" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="150" cy="200" r="16" fill="currentColor" />
          <circle cx="250" cy="250" r="16" fill="currentColor" />
          <circle cx="400" cy="100" r="16" fill="currentColor" />
          <circle cx="550" cy="150" r="16" fill="currentColor" />
          <path d="M0 400L150 250L250 300L400 150L550 200L800 50L800 400L0 400Z" fill="url(#gradient-chart)" />
          <defs>
            <linearGradient id="gradient-chart" x1="400" y1="0" x2="400" y2="400" gradientUnits="userSpaceOnUse">
              <stop stopColor="currentColor" stopOpacity="0.3" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Abstract Coin/Data Nodes */}
        <svg className="absolute bottom-[5%] left-[-5%] w-96 opacity-[0.2] text-primary mix-blend-multiply dark:mix-blend-screen" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="200" cy="200" r="190" stroke="currentColor" strokeWidth="2" strokeDasharray="10 10" />
          <circle cx="200" cy="200" r="140" stroke="currentColor" strokeWidth="4" />
          <circle cx="200" cy="200" r="90" stroke="currentColor" strokeWidth="2" strokeDasharray="5 15" />
          <circle cx="200" cy="60" r="24" fill="currentColor" />
          <circle cx="340" cy="200" r="16" fill="currentColor" />
          <circle cx="60" cy="200" r="12" fill="currentColor" />
          <circle cx="200" cy="340" r="20" fill="currentColor" />
        </svg>

        {/* Existing Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>
    </div>
  );
}
