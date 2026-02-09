import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    title: "UI/UX Design",
    description:
      "Research-driven interface design that balances aesthetics with usability, delivering experiences users love and remember.",
    icon: "🎨",
    color: "purple" as const,
  },
  {
    title: "Digital Transformation",
    description:
      "Modernize legacy systems with cloud-native architectures, microservices, and API-first approaches that scale with your business.",
    icon: "📱",
    color: "blue" as const,
  },
  {
    title: "Custom Development",
    description:
      "End-to-end application development using agile methodologies, from initial concept through deployment and ongoing support.",
    icon: "⚙️",
    color: "green" as const,
  },
  {
    title: "User Research & Testing",
    description:
      "Evidence-based UX research including user interviews, usability testing, and analytics to inform design decisions.",
    icon: "🔍",
    color: "orange" as const,
  },
  {
    title: "Performance Engineering",
    description:
      "Technical optimization strategies to improve load times, reduce latency, and enhance overall application performance.",
    icon: "🚀",
    color: "pink" as const,
  },
  {
    title: "Technology Consulting",
    description:
      "Strategic guidance on technology selection, architecture decisions, and digital roadmaps aligned with business objectives.",
    icon: "💼",
    color: "cyan" as const,
  },
];

const iconColors: Record<string, string> = {
  purple: "bg-purple-100 text-purple-600",
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  orange: "bg-orange-100 text-orange-600",
  pink: "bg-pink-100 text-pink-600",
  cyan: "bg-cyan-100 text-cyan-600",
};

export function ServicesGrid() {
  useEffect(() => {
    // Services header animation
    gsap.fromTo(
      ".services-header",
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".services-header",
          start: "top 80%",
        },
      },
    );

    // Service cards staggered animation
    gsap.fromTo(
      ".service-card",
      { y: 50, opacity: 0, scale: 0.96 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".service-card",
          start: "top 85%",
        },
      },
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section id="services" className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="services-header text-center mb-16 opacity-0">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            End-to-end digital solutions tailored to your unique challenges and
            business goals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="service-card opacity-0 group p-8 rounded-2xl bg-white border border-gray-100 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            >
              <div
                className={`w-16 h-16 rounded-2xl ${iconColors[service.color]} flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                {service.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
