import SEO from "../components/SEO";
import { PartnerJoinProvider } from "../context/PartnerJoinContext";
//import ProjectPartnerSection from "../components/NewProjectPartner/ExplainProjectPartner";
import Reveal from "../components/common/Reveal";
import FaqSection from "../components/partnerPage/FaqSection";
import HeroSection from "../components/partnerPage/HeroSection";
import PricingSection from "../components/partnerPage/PricingSection";
import TestimonialsSection from "../components/partnerPage/TestimonialsSection";
import TrustedSection from "../components/partnerPage/TrustedCompanySection";
import ProjectPartnerSection from "../components/partnerPageUpdated/ExploreSection";
import JoinStepsSection from "../components/partnerPageUpdated/JoinSteps";
import MobileAppSection from "../components/partnerPageUpdated/MobileApplication";
import ServicesSection from "../components/partnerPageUpdated/OurServices";
import StatsAndBenefits from "../components/partnerPageUpdated/StateSection";

const PartnerPage = () => {
  return (
    <PartnerJoinProvider>
      <SEO
        title="Reparv Project Partner Program | Verified Leads & Real Estate Growth Platform"
        description="Join Reparv’s Project Partner Program to get verified buyer leads, premium projects, and a smart partner dashboard. Grow your real estate business across India."
        keywords="reparv project partner program, real estate partner platform india, real estate growth ecosystem, verified real estate leads india, property sales partner program, real estate channel partner, real estate business scaling platform, reparv partner ecosystem"
      />
      <div className="w-full mt-0 bg-white">
        <HeroSection />

        <Reveal className="[animation-duration:1.2s]">
          <ProjectPartnerSection />
        </Reveal>
        <StatsAndBenefits />

        <Reveal className="[animation-duration:1.2s]">
          <ServicesSection />
        </Reveal>

        <Reveal className="[animation-duration:1.2s]">
          <JoinStepsSection />
        </Reveal>

        <Reveal className="[animation-duration:1.2s]">
          <MobileAppSection />
        </Reveal>

        <Reveal className="[animation-duration:1.2s]">
          <PricingSection />
        </Reveal>

        <Reveal className="[animation-duration:1.2s]">
          <TrustedSection />
        </Reveal>

        <Reveal className="[animation-duration:1.2s]">
          <TestimonialsSection />
        </Reveal>

        <Reveal className="[animation-duration:1.2s]">
          <FaqSection />
        </Reveal>
      </div>
    </PartnerJoinProvider>
  );
};

export default PartnerPage;
