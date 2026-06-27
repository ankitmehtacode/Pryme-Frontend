import { Link } from "react-router-dom";
import { Shield, Lock, CheckCircle, Mail, Phone, MapPin, Linkedin, Twitter, Facebook, Instagram } from "lucide-react";
import prymeLogo from "@/assets/Pryme2.svg";

const CONTACT_PHONE = "+91 92432 94291";
const CONTACT_PHONE_LINK = "tel:+919243294291";
const CONTACT_EMAIL = "hello@gopryme.in";

const COMPANY_ADDRESS_NODE = (
  <span className="block leading-relaxed">
    <strong className="font-semibold text-white dark:text-foreground">Pryme Headquarters</strong><br />
    204, Ranjeet Hanuman Main Road,<br />
    Near BATA showroom, Mahu Naka,<br />
    Indore, Madhya Pradesh
  </span>
);

const SOCIAL_LINKS = {
  linkedin: "https://www.linkedin.com/company/pryme-consultingindia/",
  twitter: "https://twitter.com/prymefinance",
  facebook: "https://facebook.com/prymefinance",
  instagram: "https://www.instagram.com/pryme.india",
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // 200 IQ fix: Scroll to top on route change, but preserve native behavior for anchor hash links
  const handleLinkClick = (href: string) => {
    if (!href.includes('#')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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

  const trustItems = [
    { icon: Shield, label: "RBI Compliant" },
    { icon: Lock, label: "ISO 27001 Certified" },
    { icon: CheckCircle, label: "256-bit Encryption" },
    { icon: CheckCircle, label: "GDPR Ready" },
  ];

  return (
    <footer className="bg-[#060a18] text-zinc-200 dark:bg-background dark:border-t border-border overflow-x-hidden">

      {/* Brand gradient accent stripe */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-[#103783] to-transparent" />

      {/* Trust Badges */}
      <div className="border-b border-white/[0.06]">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {trustItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <item.icon className="w-4 h-4 text-[#9BAFD9]" />
                <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-6">

          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2 space-y-5">
            <Link to="/" className="inline-block" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              <img src={prymeLogo} alt="PRYME" className="h-9" />
            </Link>
            <p className="text-zinc-500 leading-relaxed max-w-xs text-sm">
              Your trusted partner for transparent, secure, and efficient loan processing. Compare rates from 15+ banks and get the best deal.
            </p>

            {/* Social links with brand gradient hover */}
            <nav aria-label="Social media links">
              <ul className="flex gap-2 list-none p-0 m-0">
                {Object.entries(SOCIAL_LINKS).map(([name, url]) => {
                  const Icon = { linkedin: Linkedin, twitter: Twitter, facebook: Facebook, instagram: Instagram }[name as keyof typeof SOCIAL_LINKS]!;
                  return (
                    <li key={name}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-zinc-500 hover:text-white hover:bg-[#103783]/20 hover:border-[#103783]/30 transition-all duration-300"
                        aria-label={`Follow us on ${name.charAt(0).toUpperCase() + name.slice(1)}`}
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Products */}
          <div>
            <h2 className="text-[11px] font-semibold mb-4 uppercase tracking-[0.15em] text-white/60">Products</h2>
            <ul className="space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    onClick={() => handleLinkClick(link.href)}
                    className="text-zinc-500 hover:text-[#9BAFD9] transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h2 className="text-[11px] font-semibold mb-4 uppercase tracking-[0.15em] text-white/60">Tools</h2>
            <ul className="space-y-2.5">
              {toolLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    onClick={() => handleLinkClick(link.href)}
                    className="text-zinc-500 hover:text-[#9BAFD9] transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h2 className="text-[11px] font-semibold mb-4 uppercase tracking-[0.15em] text-white/60">Company</h2>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    onClick={() => handleLinkClick(link.href)}
                    className="text-zinc-500 hover:text-[#9BAFD9] transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-[11px] font-semibold mb-4 uppercase tracking-[0.15em] text-white/60">Contact</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 text-[#9BAFD9] mt-0.5 shrink-0" />
                <div>
                  <a href={CONTACT_PHONE_LINK} className="text-sm text-zinc-400 hover:text-[#9BAFD9] transition-colors block">
                    {CONTACT_PHONE}
                  </a>
                  <span className="text-[10px] text-zinc-600">Support, 9 AM - 9 PM</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 text-[#9BAFD9] mt-0.5 shrink-0" />
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm text-zinc-400 hover:text-[#9BAFD9] transition-colors">
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#9BAFD9] mt-1 shrink-0" />
                <span className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors">
                  {COMPANY_ADDRESS_NODE}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Legal Footer */}
      <div className="border-t border-white/[0.06]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <p className="text-[11px] text-zinc-600">
                © {currentYear} GOPRYME FINTECH Pvt. Ltd. All rights reserved. CIN: U70200MP2026PTC081776
              </p>
              <div className="flex flex-wrap gap-4">
                {legalLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => handleLinkClick(link.href)}
                    className="text-[11px] text-zinc-600 hover:text-[#9BAFD9] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* RBI Disclaimer */}
          <div className="mt-6 pt-5 border-t border-white/[0.04]">
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              <strong className="text-zinc-500">Disclaimer:</strong> PRYME is a loan comparison and facilitation platform and not a lender.
              We partner with RBI-regulated banks and NBFCs to provide loan services. All loans are subject to
              credit approval and terms & conditions of the respective lending partners. Interest rates, processing
              fees, and other charges vary based on the loan type and borrower profile. The information provided
              on this website is for general informational purposes only and should not be considered as financial advice.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
