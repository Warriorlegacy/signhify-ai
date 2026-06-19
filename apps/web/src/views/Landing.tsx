import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import Agents from "../components/landing/Agents";
import Footer from "../components/landing/Footer";

export function Landing({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <>
      <Navbar onGetStarted={onGetStarted} />
      <Hero onGetStarted={onGetStarted} />
      <Features />
      <Agents />
      <Footer onGetStarted={onGetStarted} />
    </>
  );
}
