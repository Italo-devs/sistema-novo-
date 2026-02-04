import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { ServicesSection } from "@/components/services-section";
import { BookingSection } from "@/components/booking-section";
import { BarbersSection } from "@/components/barbers-section";
import { AboutSection } from "@/components/about-section";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <BookingSection />
        <BarbersSection />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
}
