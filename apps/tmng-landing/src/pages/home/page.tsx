import {
  Hero,
  ServicesGrid,
  Testimonials,
  Partners,
  FeaturedWork,
} from "@/features/landing";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <ServicesGrid />
      <Testimonials />
      <Partners />
      <FeaturedWork />
    </div>
  );
}
