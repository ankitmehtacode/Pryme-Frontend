import { useState, useEffect, useRef, memo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu, X, Phone, User, LogOut, Settings, ChevronDown,
  Calculator, Home, Briefcase, Building2, Wallet, Gift, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import prymeLogo from "@/assets/pryme-logo.svg";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CONTACT_PHONE = "1800-309-4001";
const CONTACT_PHONE_LINK = "tel:18003094001";

const productLinks = [
  { href: "/apply?type=personal", label: "Personal Loan", icon: Wallet, description: "Quick approval, minimal docs" },
  { href: "/apply?type=business", label: "Business Loan", icon: Briefcase, description: "Fuel your business growth" },
  { href: "/apply?type=home", label: "Home Loan", icon: Home, description: "Make your dream home real" },
  { href: "/apply?type=lap", label: "Loan Against Property", icon: Building2, description: "Borrow against your property" },
];

const toolLinks = [
  { href: "/emi-calculator", label: "EMI Calculator", icon: Calculator, description: "Calculate your monthly EMI with precision" },
  { href: "/rewards-calculator", label: "Rewards Calculator", icon: Gift, description: "Discover your exclusive reward tier" },
];

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Compare Loans" },
  { href: "/about", label: "About" },
  { href: "/blogs", label: "Insights" },
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
          <span className="font-medium text-lg">Menu</span>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-6 overflow-y-auto h-[calc(100%-64px)]">
          <div>
            <Link to="/" onClick={onClose} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm"><Home className="w-4 h-4 text-muted-foreground" /></div>
              <span className="text-sm font-semibold text-foreground">Home</span>
            </Link>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Products</p>
            <div className="space-y-1">
              {productLinks.map((item) => (
                <Link key={item.href} to={item.href} onClick={onClose} className="flex items-center gap-3 p-3 rounded-lg hover:bg-violet-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center"><item.icon className="w-4 h-4 text-[#7c3aed]" /></div>
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Tools</p>
            <div className="space-y-1">
              {toolLinks.map((item) => (
                <Link key={item.href} to={item.href} onClick={onClose} className="flex items-center gap-3 p-3 rounded-lg hover:bg-amber-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center"><item.icon className="w-4 h-4 text-[#ffd600]" /></div>
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
                <Button asChild className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white"><Link to="/apply" onClick={onClose}>Apply Now</Link></Button>
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

// --- Header Component ---
const Header = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === "/";

  useGSAP(() => {
    const scrollTrigger = ScrollTrigger.create({
      start: "top top",
      end: 100,
      onUpdate: (self) => {
        if (self.progress > 0.5) {
          gsap.to(navContainerRef.current, {
            width: "90%",
            maxWidth: "1200px",
            borderRadius: "24px",
            y: 12,
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(0,0,0,0.05)",
            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)",
            duration: 0.4,
            ease: "power2.out"
          });
        } else {
          gsap.to(navContainerRef.current, {
            width: "100%",
            maxWidth: "100%",
            borderRadius: "0px",
            y: 0,
            backgroundColor: "transparent",
            backdropFilter: "blur(0px)",
            border: "1px solid transparent",
            boxShadow: "none",
            duration: 0.4,
            ease: "power2.out"
          });
        }
      }
    });
    return () => scrollTrigger.kill();
  }, []);

  return (
    <>
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-0 transition-all duration-300 pointer-events-none">
        <div ref={navContainerRef} className="w-full h-20 px-6 flex items-center justify-between transition-all duration-300 pointer-events-auto bg-transparent">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img src={prymeLogo} alt="PRYME" className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/50 rounded-full px-2 py-1 border border-white/20 backdrop-blur-sm shadow-sm">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-black/5 text-slate-600 font-medium text-sm rounded-full h-9">Products</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[500px] p-4 bg-white rounded-2xl shadow-xl border border-slate-100">
                      <div className="grid grid-cols-2 gap-2">
                        {productLinks.map((item) => (
                          <Link key={item.href} to={item.href} className="flex items-start gap-3 p-3 rounded-xl hover:bg-violet-50 transition-colors group">
                            <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center shrink-0"><item.icon className="w-5 h-5 text-[#7c3aed]" /></div>
                            <div><p className="text-sm font-semibold text-slate-900 mb-1">{item.label}</p><p className="text-xs text-slate-500 line-clamp-1">{item.description}</p></div>
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
                        <Link key={item.href} to={item.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50 transition-colors group">
                          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0"><item.icon className="w-4 h-4 text-[#ffd600]" /></div>
                          <div><p className="text-sm font-semibold text-slate-900">{item.label}</p><p className="text-xs text-slate-500">{item.description}</p></div>
                        </Link>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            {navLinks.map(link => (
              <Link key={link.href} to={link.href} className={cn("px-4 py-2 text-sm font-medium rounded-full transition-all hover:bg-black/5", location.pathname === link.href ? "text-[#7c3aed]" : "text-slate-600")}>
                {link.label === "Home" ? (
                  <div className="flex items-center gap-1.5">
                    <Home className="w-4 h-4" /> {link.label}
                  </div>
                ) : (
                  link.label
                )}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <a href={CONTACT_PHONE_LINK} className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-[#7c3aed] transition-colors"><Phone className="w-4 h-4" /><span>{CONTACT_PHONE}</span></a>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full pl-2 pr-4 border border-slate-200 hover:bg-slate-50 h-10">
                    <div className="w-6 h-6 rounded-full bg-[#7c3aed]/10 flex items-center justify-center mr-2"><User className="w-3 h-3 text-[#7c3aed]" /></div>
                    <span className="text-sm font-medium">{user.name.split(' ')[0]}</span><ChevronDown className="w-3 h-3 ml-2 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}><Briefcase className="w-4 h-4 mr-2" /> Application Tracker</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/profile")}><User className="w-4 h-4 mr-2" /> My Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/notifications")}><Bell className="w-4 h-4 mr-2" /> Notifications</DropdownMenuItem>
                  {isAdmin && <DropdownMenuItem onClick={() => navigate("/admin")}><Settings className="w-4 h-4 mr-2" /> Admin Console</DropdownMenuItem>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={async () => { await signOut(); navigate("/"); }} className="text-red-500"><LogOut className="w-4 h-4 mr-2" /> Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-5">
                <Link to="/auth" className="text-sm font-semibold text-muted-foreground hover:text-[#7c3aed] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2">Log In</Link>
                <Link to="/apply" className="px-6 py-2.5 border border-[#7c3aed] text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white text-sm font-medium rounded-full transition-all hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2">Apply Now</Link>
              </div>
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