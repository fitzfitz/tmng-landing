import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Image } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    title: "Enterprise Marketplace",
    category: "E-Commerce",
    description:
      "Scalable multi-vendor platform with real-time inventory sync, secure payment processing, and advanced analytics dashboard.",
    image: "/images/projects/marketplace.png",
  },
  {
    title: "Healthcare Portal",
    category: "Healthcare",
    description:
      "HIPAA-compliant patient management system featuring secure messaging, appointment scheduling, and electronic health records.",
    image: "/images/projects/health.png",
  },
  {
    title: "Business Intelligence Platform",
    category: "Analytics",
    description:
      "Enterprise-grade analytics with real-time dashboards, predictive modeling, and automated reporting capabilities.",
    image: "/images/projects/analytics.png",
  },
];

export function FeaturedWork() {
  useEffect(() => {
    // Header animation
    gsap.fromTo(
      ".work-header",
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".work-header",
          start: "top 80%",
        },
      },
    );

    // Cards staggered animation
    gsap.fromTo(
      ".work-card",
      { y: 60, opacity: 0, rotateX: 8 },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 1.2,
        stagger: 0.18,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".work-card",
          start: "top 85%",
        },
      },
    );

    // CTA button animation
    gsap.fromTo(
      ".work-cta",
      { y: 25, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".work-cta",
          start: "top 90%",
        },
      },
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="work-header text-center mb-16 opacity-0">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Case Studies
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real-world solutions that drive results for businesses across
            industries
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {projects.map((project, index) => (
            <div
              key={index}
              className="work-card opacity-0 group rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="aspect-video bg-gradient-to-br from-purple-100 to-purple-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-purple-600/10 group-hover:bg-purple-600/20 transition-colors duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    className="w-16 h-16 text-purple-600/30"
                    strokeWidth={1.5}
                  />
                </div>
              </div>

              <div className="p-6">
                <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-purple-600 bg-purple-100 mb-3">
                  {project.category}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                  {project.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {project.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="work-cta text-center opacity-0">
          <a
            href="/work"
            className="inline-block px-8 py-3 bg-white text-purple-600 font-semibold rounded-lg border-2 border-purple-600 hover:bg-purple-50 transition-colors"
          >
            View All Projects
          </a>
        </div>
      </div>
    </section>
  );
}
