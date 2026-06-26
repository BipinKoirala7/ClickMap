import HomeLayout from "~/components/Home/HomeLayout";
import type { Route } from "./+types/home";
import HeroSection from "~/components/Home/HeroSection";
import FeaturesSection from "~/components/Home/FeatureSection";
import HowItWorksSection from "~/components/Home/HowItWorksSection";
import CTASection from "~/components/Home/CTASection";
import { PricingSection } from "~/components/Home/PricingSection";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ClickMap — Short links. Real intelligence." },
    {
      name: "description",
      content:
        "ClickMap turns every URL into a measurable touch point — shorten, brand, and analyze every click.",
    },
  ];
}

export default function Home() {
  return (
    <HomeLayout>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <CTASection />
    </HomeLayout>
  );
}
