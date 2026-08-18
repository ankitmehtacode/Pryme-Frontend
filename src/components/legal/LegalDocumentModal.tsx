import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  ShieldCheck, 
  Lock, 
  Building2, 
  Headphones, 
  KeyRound, 
  DatabaseZap, 
  Server, 
  UserCheck, 
  Search, 
  Download, 
  ExternalLink, 
  Check, 
  Copy, 
  ChevronRight, 
  BookOpen, 
  FileCode2, 
  X, 
  Info,
  Scale,
  Calendar,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { 
  TERMS_DATA, 
  PRIVACY_DATA, 
  FAIR_LENDING_DISCLOSURES, 
  LegalDocument, 
  HighlightCard 
} from "@/data/legalDocuments";
import { toast } from "sonner";
import prymeLogo from "@/assets/Pryme2.svg";

export type LegalDocType = "terms" | "privacy" | "fair-lending";

interface LegalDocumentModalProps {
  openDoc: LegalDocType | null;
  onClose: () => void;
  onAccept?: () => void;
}

const HIGHLIGHT_ICONS: Record<string, React.ReactNode> = {
  Building2: <Building2 className="w-5 h-5 text-blue-500 dark:text-blue-400" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
  Lock: <Lock className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />,
  Headphones: <Headphones className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
  KeyRound: <KeyRound className="w-5 h-5 text-blue-500 dark:text-blue-400" />,
  DatabaseZap: <DatabaseZap className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
  Server: <Server className="w-5 h-5 text-purple-500 dark:text-purple-400" />,
  UserCheck: <UserCheck className="w-5 h-5 text-teal-500 dark:text-teal-400" />,
};

export const LegalDocumentModal: React.FC<LegalDocumentModalProps> = ({
  openDoc,
  onClose,
  onAccept,
}) => {
  const [activeTab, setActiveTab] = useState<LegalDocType>(openDoc || "terms");
  const [viewMode, setViewMode] = useState<"interactive" | "pdf">("interactive");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSectionId, setActiveSectionId] = useState<string>("");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync activeTab with openDoc when modal opens
  useEffect(() => {
    if (openDoc) {
      setActiveTab(openDoc);
      setSearchQuery("");
      setViewMode("interactive");
    }
  }, [openDoc]);

  // Current active legal document data
  const currentDoc: LegalDocument | null = useMemo(() => {
    if (activeTab === "terms") return TERMS_DATA;
    if (activeTab === "privacy") return PRIVACY_DATA;
    return null;
  }, [activeTab]);

  // Filter sections and clauses by search query
  const filteredSections = useMemo(() => {
    if (!currentDoc) return [];
    if (!searchQuery.trim()) return currentDoc.sections;

    const q = searchQuery.toLowerCase();
    return currentDoc.sections
      .map((section) => {
        const titleMatch = section.title.toLowerCase().includes(q);
        const matchingClauses = section.clauses.filter(
          (c) => c.title.toLowerCase().includes(q) || c.body.toLowerCase().includes(q)
        );

        if (titleMatch || matchingClauses.length > 0) {
          return {
            ...section,
            clauses: matchingClauses.length > 0 ? matchingClauses : section.clauses,
            isDirectMatch: titleMatch,
          };
        }
        return null;
      })
      .filter(Boolean) as typeof currentDoc.sections;
  }, [currentDoc, searchQuery]);

  // Count total matching occurrences
  const totalMatches = useMemo(() => {
    if (!searchQuery.trim()) return 0;
    return filteredSections.reduce((acc, s) => acc + (s.clauses ? s.clauses.length : 1), 0);
  }, [filteredSections, searchQuery]);

  // Scroll to section smoothly
  const scrollToSection = (sectionId: string) => {
    setActiveSectionId(sectionId);
    const element = document.getElementById(sectionId);
    if (element && contentContainerRef.current) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Copy direct link to section
  const handleCopyLink = (sectionId: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${sectionId}`;
    navigator.clipboard.writeText(url);
    setCopiedSection(sectionId);
    toast.success("Section link copied to clipboard");
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Highlight matching search text
  const renderHighlightedText = (text: string) => {
    if (!searchQuery.trim()) return text;
    const regex = new RegExp(`(${searchQuery.trim().replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === searchQuery.trim().toLowerCase() ? (
            <mark
              key={i}
              className="bg-amber-300 dark:bg-yellow-400 text-slate-950 px-1 py-0.5 rounded font-extrabold shadow-sm ring-1 ring-amber-400/60"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Auto-scroll to top of results when searching
  useEffect(() => {
    if (searchQuery.trim() && filteredSections.length > 0) {
      setActiveSectionId(filteredSections[0].id);
      if (contentContainerRef.current) {
        contentContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [searchQuery]);

  if (!openDoc) return null;

  return (
    <Dialog open={!!openDoc} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-5xl w-[96vw] h-[90vh] md:h-[86vh] p-0 flex flex-col gap-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl bg-white/95 dark:bg-[#090e1f]/95 backdrop-blur-2xl sm:rounded-2xl z-50 transition-all"
      >
        {/* Top Silicon Valley Grade Header */}
        <DialogHeader className="px-4 py-3 md:px-6 md:py-4 border-b border-slate-200/80 dark:border-white/10 shrink-0 bg-slate-50/80 dark:bg-[#0c142b]/90 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center p-2 shadow-sm border border-slate-200/80 dark:border-white/10 shrink-0">
              <img src={prymeLogo} alt="PRYME" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-base md:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  PRYME Legal Center
                </DialogTitle>
                <Badge variant="outline" className="text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/40 py-0.5">
                  DPDP 2023 & RBI Compliant
                </Badge>
              </div>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 truncate">
                GOPRYME FINTECH PRIVATE LIMITED • CIN: U70200MP2026PTC081776
              </DialogDescription>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            {/* View Mode Toggle: Interactive vs PDF */}
            <div className="flex items-center bg-slate-200/60 dark:bg-white/5 p-1 rounded-xl border border-slate-300/40 dark:border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("interactive")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
                  viewMode === "interactive"
                    ? "bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Interactive</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("pdf")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
                  viewMode === "pdf"
                    ? "bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Official PDF</span>
              </button>
            </div>

            {/* Download Official PDF */}
            {currentDoc && (
              <a
                href={currentDoc.pdfUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-colors"
                title="Download signed PDF document"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </a>
            )}
          </div>
        </DialogHeader>

        {/* Tab & Search Navigation Bar */}
        <div className="px-4 md:px-6 py-2.5 border-b border-slate-200/80 dark:border-white/5 bg-slate-100/60 dark:bg-[#0a1124]/60 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Document Tabs */}
          <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => { setActiveTab("terms"); setSearchQuery(""); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === "terms"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Terms of Service
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("privacy"); setSearchQuery(""); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === "privacy"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("fair-lending"); setSearchQuery(""); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === "fair-lending"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              RBI Fair Practice
            </button>
          </div>

          {/* Search Box (Interactive Mode) */}
          {viewMode === "interactive" && activeTab !== "fair-lending" && (
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search clauses (e.g. loan, bureau, fee)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-8 text-xs font-medium bg-white dark:bg-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-200 dark:border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#103783] dark:focus:ring-blue-500 shadow-xs transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Main Viewport */}
        <div className="flex-1 min-h-0 relative flex overflow-hidden">
          {viewMode === "pdf" ? (
            /* PDF Mode View */
            <div className="w-full h-full relative bg-slate-950 flex flex-col">
              <div className="px-4 py-2 bg-slate-900 text-[11px] text-slate-400 flex items-center justify-between border-b border-white/10">
                <span className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  Showing original legal filing copy ({activeTab === "privacy" ? "34 Pages" : "71 Pages"})
                </span>
                <a 
                  href={currentDoc ? currentDoc.pdfUrl : "/documents/terms-conditions.pdf"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  Open in Tab <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
              <iframe
                src={`${currentDoc ? currentDoc.pdfUrl : "/documents/terms-conditions.pdf"}#toolbar=0&navpanes=0&scrollbar=1`}
                className="w-full flex-1 border-0"
                title="Legal Document PDF Viewer"
              />
            </div>
          ) : activeTab === "fair-lending" ? (
            /* Fair Lending Disclosures View */
            <div className="w-full h-full overflow-y-auto p-6 md:p-8 space-y-6">
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="text-center space-y-2 pb-4 border-b border-slate-200 dark:border-white/10">
                  <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/20">
                    RBI Regulatory Framework
                  </Badge>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {FAIR_LENDING_DISCLOSURES.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Guidelines on Digital Lending Facilitation & Customer Protection Standards
                  </p>
                </div>

                <div className="grid gap-4">
                  {FAIR_LENDING_DISCLOSURES.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-2 hover:border-blue-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-8">
                        {item.content}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
                  <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block mb-0.5">Statutory Transparency Notice:</strong>
                    PRYME does not engage in recovery activities or collect repayments into private wallets. All monetary transfers happen directly between you and the sanctioned RBI-regulated lender.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Interactive Silicon Valley Reader View */
            <div className="w-full h-full flex flex-col md:flex-row overflow-hidden">
              {/* Left Sidebar: Sticky Table of Contents (Desktop) */}
              <div className="hidden md:flex w-72 shrink-0 border-r border-slate-200/80 dark:border-white/10 flex-col bg-slate-50/50 dark:bg-[#070b18]/60">
                <div className="p-3.5 border-b border-slate-200/80 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-blue-500" />
                    Table of Contents
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {filteredSections.length} Parts
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin">
                  {filteredSections.map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => scrollToSection(sec.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-start gap-2.5 group ${
                        activeSectionId === sec.id
                          ? "bg-[#103783]/10 dark:bg-[#9BAFD9]/15 text-[#103783] dark:text-[#9BAFD9] font-semibold shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <div className="mt-1.5 flex items-center justify-center shrink-0">
                        <div 
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                            activeSectionId === sec.id
                              ? "bg-[#103783] dark:bg-[#9BAFD9] ring-4 ring-[#103783]/20 dark:ring-[#9BAFD9]/20 scale-125"
                              : "bg-slate-300 dark:bg-zinc-700 group-hover:bg-[#103783]/70 dark:group-hover:bg-[#9BAFD9]"
                          }`} 
                        />
                      </div>
                      <span className="truncate leading-relaxed flex-1">
                        {sec.title}
                      </span>
                    </button>
                  ))}
                  {filteredSections.length === 0 && (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No sections matching "{searchQuery}"
                    </div>
                  )}
                </div>
              </div>

              {/* Main Content Area */}
              <div 
                ref={contentContainerRef}
                className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth"
              >
                {/* Search Match Banner */}
                {searchQuery && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-700 dark:text-blue-300 flex items-center justify-between">
                    <span>
                      Found <strong>{totalMatches}</strong> matching section{totalMatches !== 1 ? 's' : ''} for "<strong>{searchQuery}</strong>"
                    </span>
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-xs font-semibold hover:underline"
                    >
                      Clear Search
                    </button>
                  </div>
                )}

                {/* Plain English "At a Glance" Executive Summary */}
                {!searchQuery && currentDoc && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="text-[11px] font-bold text-[#103783] dark:text-[#9BAFD9] tracking-wider uppercase block mb-1">
                          Executive Summary
                        </span>
                        <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                          Key Commitments at a Glance
                        </h2>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Effective: {currentDoc.effectiveDate}</span>
                      </div>
                    </div>

                    {/* Summary Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {currentDoc.highlights.map((card, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-2xl bg-gradient-to-br from-slate-50/80 to-slate-100/60 dark:from-white/[0.04] dark:to-white/[0.01] border border-slate-200/80 dark:border-white/10 shadow-xs hover:border-blue-500/30 transition-all flex flex-col justify-between gap-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="p-2 rounded-xl bg-white dark:bg-white/10 shadow-xs border border-slate-100 dark:border-white/5">
                              {HIGHLIGHT_ICONS[card.icon] || <ShieldCheck className="w-5 h-5 text-blue-500" />}
                            </div>
                            <Badge variant="secondary" className="text-[10px] font-semibold bg-slate-200/60 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                              {card.badge}
                            </Badge>
                          </div>
                          <div>
                            <h3 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white mb-1">
                              {card.title}
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                              {card.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Legal Metadata Pill Banner */}
                    <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-xs text-slate-600 dark:text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-blue-600 text-white font-mono text-[10px]">
                          v{currentDoc.version}
                        </Badge>
                        <span>Entity: <strong>GOPRYME FINTECH PRIVATE LIMITED</strong></span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Jurisdiction: Indore, Madhya Pradesh, India
                      </span>
                    </div>

                    <div className="h-px bg-slate-200 dark:bg-white/10 my-6" />
                  </div>
                )}

                {/* Document Clauses Sections */}
                <div className="space-y-10">
                  {filteredSections.map((sec) => (
                    <section
                      key={sec.id}
                      id={sec.id}
                      className="space-y-4 scroll-mt-6 group"
                    >
                      {/* Section Header */}
                      <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-slate-200 dark:border-white/10">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#103783] dark:bg-[#9BAFD9]" />
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#103783] dark:text-[#9BAFD9]">
                              Part {sec.partNumber}
                            </span>
                            {sec.summaryTag && (
                              <Badge variant="outline" className="text-[10px] text-slate-500 border-slate-200 dark:border-white/10">
                                {sec.summaryTag}
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-base md:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {renderHighlightedText(sec.title)}
                          </h3>
                        </div>

                        {/* Copy Link to Section */}
                        <button
                          type="button"
                          onClick={() => handleCopyLink(sec.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Copy link to this section"
                        >
                          {copiedSection === sec.id ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Section Clauses */}
                      <div className="space-y-4 pl-1">
                        {sec.clauses.map((clause, cIdx) => (
                          <div
                            key={cIdx}
                            className="space-y-1.5 p-3.5 rounded-xl bg-slate-50/60 dark:bg-white/[0.015] border border-slate-200/60 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/15 transition-all"
                          >
                            {clause.title !== "General" && (
                              <h4 className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200">
                                {renderHighlightedText(clause.title)}
                              </h4>
                            )}
                            <div className="text-xs md:text-[13px] text-slate-600 dark:text-slate-300/90 leading-relaxed whitespace-pre-line font-normal space-y-2">
                              {clause.body.split('\n\n').map((paragraph, pIdx) => (
                                <p key={pIdx}>
                                  {renderHighlightedText(paragraph)}
                                </p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer / Accept Action Bar */}
        <div className="px-4 py-3 md:px-6 md:py-3.5 border-t border-slate-200/80 dark:border-white/10 shrink-0 bg-slate-50/90 dark:bg-[#0c142b]/95 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              By using PRYME, you agree to our policies in accordance with applicable Indian laws.
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs font-semibold rounded-xl border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5"
            >
              Close
            </Button>

            {onAccept && (
              <Button
                type="button"
                size="sm"
                onClick={onAccept}
                className="text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                I Understand & Agree
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LegalDocumentModal;
