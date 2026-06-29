import { Helmet } from "react-helmet-async";
import { PageShell } from "@/components/layout/PageShell";
import { AuthLayout } from "@/features/auth/layouts/AuthLayout";
import { AuthHeroArtwork } from "@/features/auth/components/AuthHeroArtwork";
import { AuthForms } from "@/features/auth/components/AuthForms";

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
        {/* High-End Dotted Mesh SVG Grid with Edge Fading */}
        <div
          className="absolute inset-0 z-0 opacity-80"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.5' fill='%23103783' fill-opacity='0.15'/%3E%3C/svg%3E")`,
            backgroundSize: '24px 24px',
            WebkitMaskImage: 'radial-gradient(circle at center, black 0%, transparent 80%)',
            maskImage: 'radial-gradient(circle at center, black 0%, transparent 95%)'
          }}
        />

        <PageShell className="relative z-10 flex items-center justify-center w-full h-full min-h-[100dvh]">
          <AuthLayout>
            <AuthLayout.Media>
              <AuthHeroArtwork />
            </AuthLayout.Media>
            <AuthLayout.Content>
              <AuthForms />
            </AuthLayout.Content>
          </AuthLayout>
        </PageShell>
      </div>
    </>
  );
};

export default Auth;