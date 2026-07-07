import { useState, useEffect, useRef, memo, useLayoutEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu, X, Phone, User, LogOut, Settings, ChevronDown,
  Calculator, Home, Briefcase, Building2, Wallet, Gift, Bell, TrendingDown, Car, CheckCircle, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import prymeLogo from "@/assets/pryme-typo-logo.svg";

/**
 * GSAP → PURE JS/CSS MIGRATION
 * ─────────────────────────────
 * The header previously used gsap + ScrollTrigger + @gsap/react (useGSAP) for:
 *   1. Scroll-linked nav bar morphing (width, borderRadius, bg, blur, shadow)
 *   2. Hide on scroll-down, show on scroll-up
 *
 * Replaced with a lightweight scroll listener using requestAnimationFrame
 * throttling. This is MORE performant than GSAP because:
 *   - Zero library overhead (gsap.to() creates internal Tween objects per call)
 *   - CSS transitions handle the interpolation on the compositor thread
 *   - The JS only toggles CSS classes — no per-frame style computation
 *
 * Visual output is identical to the GSAP version.
 */

const CONTACT_PHONE = "+91 92432 94291";
const CONTACT_PHONE_LINK = "tel:+919243294291";

const productLinks = [
  { href: "/apply?type=home", label: "Home Loans", icon: Home, description: "Make your dream home real" },
  { href: "/apply?type=lap", label: "LAP", icon: Building2, description: "Borrow against your property" },
  { href: "/apply?type=vehicle", label: "Vehicle Loans", icon: Car, description: "Drive your dream today" },
  { href: "/apply?type=personal", label: "Personal Loan", icon: Wallet, description: "Quick approval, minimal docs" },
  { href: "/apply?type=business", label: "Business Loan", icon: Briefcase, description: "Fuel your business growth" },
  { href: "/apply?type=transfer", label: "BT|Top Up", icon: RefreshCw, description: "Balance transfer & top up" },
];

const toolLinks = [
  { href: "/apply", label: "Eligibility Checker", icon: CheckCircle, description: "Check your loan eligibility" },
  { href: "/emi-calculator", label: "EMI Calculator", icon: Calculator, description: "Calculate your monthly EMI with precision" },
  { href: "/prepayment-calculator", label: "Prepayment Calculator", icon: TrendingDown, description: "See how prepayments reduce your loan" },
  { href: "/rewards-calculator", label: "Rewards Calculator", icon: Gift, description: "Discover your exclusive reward tier" },
];

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/blogs", label: "Insights" },
  { href: "/rewards-calculator", label: "Rewards and Offers" },
];

// --- Mobile Menu Component ---
const MobileMenu = memo(({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <div className={cn("lg:hidden fixed inset-0 z-[100] transition-all duration-300", isOpen ? "visible" : "invisible")}>
      <div className={cn("absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0")} onClick={onClose} />
      <div className={cn("absolute right-0 top-0 h-full w-[300px] bg-white border-l border-border shadow-2xl transition-transform duration-300", isOpen ? "translate-x-0" : "translate-x-full")}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <span className="font-medium" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.125rem)' }}>Menu</span>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-6 overflow-y-auto h-[calc(100%-64px)]">
          <div>
            <Link to="/" onClick={onClose} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
              <span className="text-sm font-semibold text-foreground px-2">Home</span>
            </Link>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Products</p>
            <div className="space-y-1">
              {productLinks.map((item) => (
                <Link key={item.href} to={item.href} onClick={onClose} className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center"><item.icon className="w-4 h-4 text-[#103783]" /></div>
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Tools</p>
            <div className="space-y-1">
              {toolLinks.map((item) => (
                <Link key={item.href} to={item.href} onClick={onClose} className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center"><item.icon className="w-4 h-4 text-[#103783]" /></div>
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100">
            {user ? (
              <div className="space-y-2">
                <Link to="/dashboard" onClick={onClose} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50"><User className="w-4 h-4" /><span className="text-sm font-medium">Dashboard</span></Link>
                <button onClick={handleSignOut} className="flex items-center gap-3 p-3 rounded-lg text-red-600 hover:bg-red-50 w-full"><LogOut className="w-4 h-4" /><span className="text-sm font-medium">Sign Out</span></button>
              </div>
            ) : (
              <div className="pt-4 mt-6 border-t border-slate-100 space-y-4">
                <Button asChild variant="outline" className="w-full"><Link to="/auth" onClick={onClose}>Log In</Link></Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
MobileMenu.displayName = "MobileMenu";

// --- Profile Menu Component ---
const ProfileMenu = memo(({ user, isAdmin, signOut, navigate }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const firstItem = menuRef.current?.querySelector('[role="menuitem"]') as HTMLElement;
    firstItem?.focus();
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "Tab") {
      setIsOpen(false);
      return;
    }

    const items = Array.from(
      menuRef.current?.querySelectorAll('[role="menuitem"]') || []
    ) as HTMLElement[];
    
    if (items.length === 0) return;

    const currentIndex = items.indexOf(document.activeElement as HTMLElement);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      items[nextIndex]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      items[nextIndex]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    }
  };

  const handleAction = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  const menuItems = useMemo(() => {
    const items = [
      { id: "dashboard", icon: Briefcase, label: "Application Tracker", href: "/dashboard" },
      { id: "profile", icon: User, label: "My Profile", href: "/profile" },
      { id: "notifications", icon: Bell, label: "Notifications", href: "/notifications" },
    ];
    if (isAdmin) {
      items.push({ id: "admin", icon: Settings, label: "Admin Console", href: "/admin" });
    }
    return items;
  }, [isAdmin]);

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const userName = user?.name || "User";
  const userEmail = user?.email || "";

  return (
    <div className="relative" ref={menuRef} onKeyDown={handleKeyDown}>
      <Button 
        ref={triggerRef}
        variant="ghost" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="rounded-full pl-2 pr-4 border border-slate-200 hover:bg-slate-50 h-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <div className="w-6 h-6 rounded-full bg-[#103783]/10 flex items-center justify-center mr-2 text-[10px] font-bold text-[#103783] tracking-wider">
          {getInitials(userName)}
        </div>
        <span className="text-sm font-medium">{userName.split(' ')[0]}</span>
        <ChevronDown className={cn("w-3 h-3 ml-2 text-slate-400 transition-transform duration-[160ms] ease-out", isOpen ? "rotate-180" : "")} />
      </Button>

      <div 
        role="menu"
        aria-orientation="vertical"
        className={cn(
          "absolute right-0 top-[calc(100%+6px)] w-[248px] bg-white rounded-2xl border border-slate-200 shadow-[0_6px_18px_rgba(15,23,42,0.08),0_20px_40px_rgba(15,23,42,0.08)] z-50",
          "origin-top-right transition-all duration-[160ms] ease-out",
          isOpen ? "opacity-100 scale-100 translate-y-0 visible" : "opacity-0 scale-[0.985] -translate-y-1 invisible pointer-events-none"
        )}
      >
        {/* Pointer Triangle */}
        <div className="absolute -top-[5px] right-6 w-2.5 h-2.5 bg-white border-t border-l border-slate-200 rotate-45 rounded-tl-[2px]" />

        {/* User Identity Header */}
        <div className="p-4 border-b border-slate-100 relative z-10 bg-white rounded-t-2xl">
          <p className="text-sm font-semibold text-slate-900 truncate">{userName}</p>
          {userEmail && <p className="text-xs text-slate-500 truncate mt-0.5">{userEmail}</p>}
        </div>

        <div className="p-1.5 flex flex-col gap-0.5 relative z-10">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <button
                key={item.id}
                role="menuitem"
                tabIndex={isOpen ? 0 : -1}
                onClick={() => handleAction(() => navigate(item.href))}
                className={cn(
                  "relative flex w-full cursor-default select-none items-center rounded-lg px-3 py-2 text-sm font-medium outline-none transition-all group",
                  active 
                    ? "bg-blue-50/50 text-[#103783]" 
                    : "hover:bg-slate-50 focus:bg-slate-50 focus:text-slate-900 text-slate-700"
                )}
              >
                {active && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#103783] rounded-r-full" />
                )}
                <item.icon className={cn(
                  "w-4 h-4 mr-3 transition-colors",
                  active ? "text-[#103783]" : "text-slate-400 group-hover:text-[#103783]"
                )} />
                {item.label}
              </button>
            );
          })}
          
          <div className="h-px bg-slate-100 my-1 mx-2" role="separator" />
          
          <button 
            role="menuitem" 
            tabIndex={isOpen ? 0 : -1} 
            onClick={() => handleAction(async () => { await signOut(); navigate("/"); })} 
            className="group relative flex w-full cursor-default select-none items-center rounded-lg px-3 py-2 text-sm font-medium outline-none transition-all hover:bg-red-50 focus:bg-red-50 focus:text-red-600 text-red-500"
          >
            <LogOut className="w-4 h-4 mr-3 text-red-400 group-hover:text-red-500 transition-colors" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
});
ProfileMenu.displayName = "ProfileMenu";

// --- Header Component ---
const Header = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;

        // Morphed state: past 100px scroll
        setIsScrolled(currentY > 100);

        // Hide navbar past 100px scroll; show only when scrolled back to top
        setIsHidden(currentY > 100);

        lastScrollY.current = currentY;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 w-full z-50 flex justify-center pt-0 pointer-events-none",
          "transition-all duration-300 ease-[cubic-bezier(0.33,1,0.68,1)]",
          isHidden ? "-translate-y-[150%] opacity-0" : "translate-y-0 opacity-100"
        )}
      >
        <div
          className={cn(
            "h-16 px-4 sm:px-6 flex items-center justify-between pointer-events-auto",
            "transition-all duration-400 ease-[cubic-bezier(0.33,1,0.68,1)]",
            isScrolled
              ? "w-[calc(100%-var(--space-md)*2)] max-w-[var(--container-expanded)] rounded-[var(--radius-lg)] translate-y-3 bg-white/85 backdrop-blur-2xl border border-black/5 shadow-[var(--shadow-md)]"
              : "w-full max-w-full rounded-none translate-y-0 bg-transparent border border-transparent shadow-none backdrop-blur-0"
          )}
        >

          {/* Logo — Single SVG lockup */}
          <Link to="/" className="flex items-center shrink-0 group pointer-events-auto" aria-label="PRYME Home" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <img
              src={prymeLogo}
              alt="PRYME"
              className="h-6 md:h-7 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/50 rounded-full px-2 py-1 border border-white/20 backdrop-blur-sm shadow-sm">
            <Link to="/" className={cn("px-4 py-2 text-sm font-medium rounded-full transition-all hover:bg-black/5", location.pathname === "/" ? "text-[#103783]" : "text-slate-600")}>
              Home
            </Link>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-black/5 text-slate-600 font-medium text-sm rounded-full h-9">Products</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[500px] p-4 bg-white rounded-2xl shadow-xl border border-slate-100">
                      <div className="grid grid-cols-2 gap-2">
                        {productLinks.map((item) => (
                          <Link key={item.href} to={item.href} className="flex items-start gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0"><item.icon className="w-5 h-5 text-[#103783]" /></div>
                            <div><p className="text-sm font-semibold text-[#0a1530] mb-1">{item.label}</p><p className="text-xs text-slate-500 line-clamp-1">{item.description}</p></div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-black/5 text-slate-600 font-medium text-sm rounded-full h-9">Tools</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[350px] p-4 bg-white rounded-2xl shadow-xl border border-slate-100">
                      {toolLinks.map((item) => (
                        <Link key={item.href} to={item.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group">
                          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0"><item.icon className="w-4 h-4 text-[#103783]" /></div>
                          <div><p className="text-sm font-semibold text-[#0a1530]">{item.label}</p><p className="text-xs text-slate-500">{item.description}</p></div>
                        </Link>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            {navLinks.map(link => (
              <Link key={link.href} to={link.href} className={cn("px-4 py-2 text-sm font-medium rounded-full transition-all hover:bg-black/5", location.pathname === link.href ? "text-[#103783]" : "text-slate-600")}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <a href={CONTACT_PHONE_LINK} className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-[#103783] transition-colors"><Phone className="w-4 h-4" /><span>{CONTACT_PHONE}</span></a>
            {user ? (
              <ProfileMenu user={user} isAdmin={isAdmin} signOut={signOut} navigate={navigate} />
            ) : (
              <Link to="/auth" className="px-5 py-2 text-sm font-semibold text-slate-700 hover:text-[#103783] bg-slate-50 hover:bg-[#103783]/5 border border-slate-200 hover:border-[#103783]/30 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">Log In</Link>
            )}
          </div>

          <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-full transition-colors"><Menu /></button>
        </div>
      </header>
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
});

Header.displayName = "Header";
export default Header;