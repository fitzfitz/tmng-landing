import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const partners = [
  { name: "Marketly", icon: "📊" },
  { name: "Volume", icon: "🎵" },
  { name: "PinPoint", icon: "📍" },
  { name: "Natural", icon: "🌿" },
  { name: "Automation", icon: "⚡" },
  { name: "DataFlow", icon: "💫" },
];

export function Partners() {
  useEffect(() => {
    gsap.fromTo(
      ".partners-section",
      { opacity: 0 },
      {
        opacity: 1,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".partners-section",
          start: "top 75%",
        },
      },
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section className="partners-section py-20 bg-purple-600 relative overflow-hidden opacity-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl text-white font-bold mb-3">
            Trusted by Industry Leaders
          </h2>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
            Proud to partner with innovative companies pushing boundaries
          </p>
        </div>

        <div className="relative w-full overflow-hidden mask-linear-fade">
          <div className="flex items-center justify-center gap-12 lg:gap-16 animate-marquee whitespace-nowrap py-4">
            {[...partners, ...partners, ...partners].map((partner, i) => (
              <div
                key={i}
                className="flex items-center gap-3 group transition-all duration-300 cursor-default px-4"
              >
                <span className="text-4xl">{partner.icon}</span>
                <span className="text-xl font-semibold text-white/90 group-hover:text-white transition-colors">
                  {partner.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .mask-linear-fade {
          mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
        }

        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.33%);
          }
        }

        .animate-marquee {
          animation: marquee 30s linear infinite;
        }

        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
