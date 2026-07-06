import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { PageShell } from "@/components/layout/PageShell";
import { AuthForms } from "@/features/auth/components/AuthForms";
import prymeLogo from "@/assets/pryme-typo-logo.svg";
import authCustomBg from "@/assets/images/auth-bg-custom.png";

const Auth = () => {
  return (
    <>
      <Helmet>
        <title>Auth | Pryme</title>
        <meta name="description" content="Log in or sign up for Pryme." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* 0.01% TIER GLASSMORPHIC PREMIUM FINTECH BACKGROUND */}
      <div className="min-h-[100dvh] w-full relative flex items-center justify-center bg-[#F4F7FA] font-sans text-[#0a1530] overflow-hidden">
        {/* Custom High-Fidelity Cover Background */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
          <img
            src={authCustomBg}
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

        {/* Top Left Logo */}
        <div className="absolute top-6 left-6 md:top-8 md:left-10 z-20">
          <Link to="/" className="cursor-pointer block group">
            <img
              src={prymeLogo}
              alt="PRYME"
              className="h-6 md:h-7 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </Link>
        </div>

        <PageShell className="relative z-10 flex items-start justify-center w-full h-full min-h-[100dvh] px-[8px] md:pl-[453px] md:pr-4">
          <div className="w-full max-w-[480px] bg-white/85 dark:bg-[#0a0f1d]/85 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden flex flex-col items-center">
            {/* Soft ambient glow card background */}
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#103783]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            <AuthForms />
          </div>
        </PageShell>
      </div>
    </>
  );
};

export default Auth;