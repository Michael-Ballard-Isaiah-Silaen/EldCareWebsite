import FeaturesSection from "./FeaturesSection";
import HeroSection from "./HeroSection";

const HomePage = () => {
  return (
    <div id="home" className="relative grow pt-2">
      <HeroSection />
      <FeaturesSection />
    </div>
  );
};

export default HomePage;
