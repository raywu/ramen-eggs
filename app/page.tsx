import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ValueProps from "@/components/ValueProps";
import TheEgg from "@/components/TheEgg";
import HowItWorks from "@/components/HowItWorks";
import SignupForm from "@/components/SignupForm";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ValueProps />
        <TheEgg />
        <HowItWorks />
        <SignupForm />
      </main>
      <Footer />
    </>
  );
}
