import { Link } from "react-router-dom";
import { Shield, Lock, CheckCircle, Mail, Phone, MapPin, ArrowRight, Linkedin, Twitter, Facebook, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import prymeLogo from "@/assets/Pryme2.svg";

const CONTACT_PHONE = "1800-309-4001";
const CONTACT_PHONE_LINK = "tel:18003094001";
const CONTACT_EMAIL = "hello@gopryme.in";

const COMPANY_ADDRESS_NODE = (
  <span className="block leading-relaxed">
    <strong className="font-semibold text-white dark:text-foreground">Pryme Headquarters</strong><br />
    4th Floor, Above Mr. DIY Showroom,<br />
    Ranjeet Hanuman Main Road, Mhow Naka Square,<br />
    Indore, Madhya Pradesh, 452009, India
  </span>
);

const SOCIAL_LINKS = {
  linkedin: "https://www.linkedin.com/company/pryme-consultingindia/",
  twitter: "https://twitter.com/prymefinance",
  facebook: "https://facebook.com/prymefinance",
  instagram: "https://www.instagram.com/go.pryme/",
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const productLinks = [
    { label: "Home Loans", href: "/apply?type=home" },
    { label: "LAP", href: "/apply?type=lap" },
    { label: "Vehicle Loans", href: "/apply?type=vehicle" },
    { label: "Personal Loan", href: "/apply?type=personal" },
    { label: "Business Loan", href: "/apply?type=business" },
  ];

  const companyLinks = [
    { label: "About Us", href: "/about" },
    { label: "How It Works", href: "/#process" },
    { label: "Partner Banks", href: "/#partners" },
    { label: "Careers", href: "/careers" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "/services" },
    { label: "Terms of Service", href: "/services" },
    { label: "Grievance Redressal", href: "/services" },
    { label: "RBI Guidelines", href: "/services" },
  ];

  const toolLinks = [
    { label: "EMI Calculator", href: "/emi-calculator" },
    { label: "Eligibility Checker", href: "/apply" },
    { label: "Document Checklist", href: "/document-check" },
    { label: "Compare Loans", href: "/services" },
  ];

  return (
    <footer className="bg-slate-950 text-zinc-200 dark:bg-background dark:border-t border-border">
      {/* Trust Badges */}
      <div className="border-b border-white/10 dark:border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-5 h-5 text-success" />
              <span className="text-zinc-400 dark:text-muted-foreground">RBI Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Lock className="w-5 h-5 text-trust" />
              <span className="text-zinc-400 dark:text-muted-foreground">ISO 27001 Certified</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="text-zinc-400 dark:text-muted-foreground">256-bit SSL Encryption</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="text-zinc-400 dark:text-muted-foreground">GDPR Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="col-span-2 lg:col-span-2 space-y-6">
            <Link to="/" className="inline-block pointer-events-auto" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              <img src={prymeLogo} alt="PRYME" className="h-10" />
            </Link>
            <p className="text-sm text-zinc-400 dark:text-muted-foreground leading-relaxed max-w-xs">
              Your trusted partner for transparent, secure, and efficient loan processing. Compare rates from 15+ banks and get the best deal.
            </p>

            <nav aria-label="Social media links" role="navigation">
              <ul className="flex gap-3 list-none p-0 m-0">
                {Object.entries(SOCIAL_LINKS).map(([name, url]) => {
                  const Icon = { linkedin: Linkedin, twitter: Twitter, facebook: Facebook, instagram: Instagram }[name as keyof typeof SOCIAL_LINKS]!;
                  return (
                    <li key={name}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white/5 dark:bg-secondary border border-white/10 dark:border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                        aria-label={`Follow us on ${name.charAt(0).toUpperCase() + name.slice(1)}`}
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div >

          {/* Products */}
          < div >
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-white dark:text-foreground">Products</h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-zinc-400 dark:text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div >

          {/* Tools */}
          < div >
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-white dark:text-foreground">Tools</h4>
            <ul className="space-y-3">
              {toolLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-zinc-400 dark:text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div >

          {/* Company */}
          < div >
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-white dark:text-foreground">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-zinc-400 dark:text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div >

          {/* Contact */}
          < div >
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-white dark:text-foreground">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <a href={CONTACT_PHONE_LINK} className="text-sm text-zinc-400 dark:text-muted-foreground hover:text-primary transition-colors block">
                    {CONTACT_PHONE}
                  </a>
                  <span className="text-xs text-zinc-500 dark:text-muted-foreground/50">Toll-free, 9 AM - 9 PM</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm text-zinc-400 dark:text-muted-foreground hover:text-primary transition-colors">
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-1 shrink-0" />
                <span className="text-xs md:text-sm text-zinc-400 dark:text-muted-foreground transition-colors hover:text-white dark:hover:text-foreground">
                  {COMPANY_ADDRESS_NODE}
                </span>
              </li>
            </ul>
          </div >
        </div >
      </div >

      {/* Legal Footer */}
      < div className="border-t border-white/10 dark:border-border" >
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <p className="text-xs text-zinc-500 dark:text-muted-foreground">
                © 2026 PRYME Consulting Pvt. Ltd. All rights reserved. CIN: U74999MH2024PTC123456 GOPRYME FINTECH PVT LTD, and CIN: U70200MP2026PTC081776
              </p>
              <div className="flex flex-wrap gap-4">
                {legalLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="text-xs text-zinc-500 dark:text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* RBI Disclaimer */}
          <div className="mt-6 pt-6 border-t border-white/10 dark:border-border">
            <p className="text-xs text-zinc-500 dark:text-muted-foreground/80 leading-relaxed w-full">
              <strong className="text-zinc-400 dark:text-muted-foreground">Disclaimer:</strong> PRYME is a loan comparison and facilitation platform and not a lender.
              We partner with RBI-regulated banks and NBFCs to provide loan services. All loans are subject to
              credit approval and terms & conditions of the respective lending partners. Interest rates, processing
              fees, and other charges vary based on the loan type and borrower profile. The information provided
              on this website is for general informational purposes only and should not be considered as financial advice.
            </p>
          </div>
        </div>
      </div >
    </footer >
  );
};

export default Footer;
