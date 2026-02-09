import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    content:
      "Working with this team has been transformative for our business. They delivered a stunning website that exceeded all our expectations.",
    author: "Finn Davis",
    role: "Product Manager",
    avatar: "F",
  },
  {
    content:
      "Exceptional quality and attention to detail. The team was responsive, professional, and delivered on time. Highly recommended!",
    author: "Erin Brown",
    role: "Marketing Director",
    avatar: "E",
  },
  {
    content:
      "Their expertise in modern web development is outstanding. They transformed our vision into a beautiful, functional reality.",
    author: "Jane Smith",
    role: "Founder & CEO",
    avatar: "J",
  },
];

export function Testimonials() {
  useEffect(() => {
    // Header animation
    gsap.fromTo(
      ".testimonials-header",
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".testimonials-header",
          start: "top 80%",
        },
      },
    );

    // Testimonial cards staggered
    gsap.fromTo(
      ".testimonial-card",
      { y: 50, opacity: 0, scale: 0.95 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1.1,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".testimonial-card",
          start: "top 85%",
        },
      },
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="testimonials-header text-center mb-16 opacity-0">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it - hear from our satisfied clients
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="testimonial-card opacity-0 group p-8 rounded-2xl bg-white border border-gray-100 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex mb-5">
                {[...Array(5)].map((_, starIndex) => (
                  <Star
                    key={starIndex}
                    className="w-5 h-5 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                "{t.content}"
              </p>
              <div className="flex items-center gap-4 border-t border-gray-200 pt-6">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{t.author}</div>
                  <div className="text-sm text-gray-600">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
