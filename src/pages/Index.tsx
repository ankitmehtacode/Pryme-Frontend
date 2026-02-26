import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import SmoothScroll from "@/components/SmoothScroll";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import PartnerBankMarquee from "@/components/home/PartnerBankMarquee";
import ProductSelectorGrid from "@/components/home/ProductSelectorGrid";
import TrustMonologue from "@/components/home/TrustMonologue";
import ProcessSection from "@/components/home/ProcessSection";
import TestimonialsSlider from "@/components/home/TestimonialsSlider";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>PRYME - Compare & Apply for Loans | Best Rates from 15+ Banks</title>
        <meta
          name="description"
          content="Compare loan offers from 15+ banks. Personal loans, business loans, home loans with competitive rates. Quick approval, transparent process. Apply now!"
        />
        <meta name="keywords" content="personal loan, business loan, home loan, loan against property, compare loans, best interest rates, quick loan approval" />
        <meta property="og:title" content="PRYME - Compare & Apply for Loans | Best Rates from 15+ Banks" />
        <meta property="og:description" content="Compare loan offers from 15+ banks. Quick approval, transparent process." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://pryme.in" />
      </Helmet>

      <SmoothScroll>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <main className="flex-1">
            <HeroSection />
            <PartnerBankMarquee />
            <ProductSelectorGrid />
            <ProcessSection />
            <TrustMonologue />
            <TestimonialsSlider />
          </main>
          <Footer />
        </div>
      </SmoothScroll>
    </>
  );
};

export default Index;
