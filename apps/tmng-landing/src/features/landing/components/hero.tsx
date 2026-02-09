import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Check } from "lucide-react";

const words = ["Impactful", "Beautiful", "Innovative", "Modern", "Stunning"];

export function Hero() {
  const [currentText, setCurrentText] = useState("");
  const typedWordRef = useRef<HTMLSpanElement>(null);
  const bgImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let currentWordIndex = 0;
    let isCleanedUp = false;

    function typeWord(word: string, onComplete: () => void) {
      if (isCleanedUp) return;
      const letters = word.split("");
      let currentTextLocal = "";

      letters.forEach((letter, index) => {
        gsap.to(
          {},
          {
            duration: 0.1,
            delay: index * 0.08,
            onComplete: () => {
              if (isCleanedUp) return;
              currentTextLocal += letter;
              setCurrentText(currentTextLocal);
              if (index === letters.length - 1) {
                gsap.delayedCall(2, onComplete);
              }
            },
          },
        );
      });
    }

    function deleteWord(onComplete: () => void) {
      if (isCleanedUp) return;
      setCurrentText((prevText) => {
        const letters = prevText.split("");

        letters.reverse().forEach((_, index) => {
          gsap.to(
            {},
            {
              duration: 0.05,
              delay: index * 0.05,
              onComplete: () => {
                if (isCleanedUp) return;
                setCurrentText((prev) => prev.slice(0, -(index + 1)));
                if (index === letters.length - 1) {
                  gsap.delayedCall(0.3, onComplete);
                }
              },
            },
          );
        });

        return prevText;
      });
    }

    function cycleWords() {
      if (isCleanedUp || !typedWordRef.current) return;

      typeWord(words[currentWordIndex], () => {
        if (isCleanedUp) return;
        deleteWord(() => {
          if (isCleanedUp) return;
          currentWordIndex = (currentWordIndex + 1) % words.length;
          cycleWords();
        });
      });
    }

    // Animate hero background
    if (bgImageRef.current) {
      gsap.to(bgImageRef.current, {
        scale: 1.1,
        rotation: 2,
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }

    // Hero entrance animation (runs once)
    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        gsap.delayedCall(0.5, cycleWords);
      },
    });

    tl.fromTo(
      ".hero-badge",
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power2.out" },
    )
      .fromTo(
        ".hero-text-line",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.2 },
        "-=0.6",
      )
      .fromTo(
        ".hero-highlight",
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: "power2.out" },
        "-=0.8",
      )
      .fromTo(
        ".hero-feature",
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, stagger: 0.12 },
        "-=0.5",
      )
      .fromTo(
        ".hero-cta",
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 1 },
        "-=0.5",
      );

    return () => {
      isCleanedUp = true;
      gsap.killTweensOf(bgImageRef.current);
      gsap.killTweensOf(".hero-badge");
      gsap.killTweensOf(".hero-text-line");
      gsap.killTweensOf(".hero-highlight");
      gsap.killTweensOf(".hero-feature");
      gsap.killTweensOf(".hero-cta");
    };
  }, []); // Empty dependency array - run once on mount

  const features = [
    "Design excellence that drives user engagement and business growth",
    "Full-stack development with cutting-edge technologies and best practices",
    "Strategic digital transformation that delivers measurable ROI",
  ];

  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 bg-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          ref={bgImageRef}
          src="/images/hero-bg.png"
          alt="Abstract Background"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/60"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="hero-badge mb-8 inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-sm font-medium">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>Award-Winning Design</span>
            <div className="w-1 h-1 rounded-full bg-purple-300"></div>
            <span>Enterprise Solutions</span>
            <div className="w-1 h-1 rounded-full bg-purple-300"></div>
            <span>Global Reach</span>
          </div>

          {/* Heading */}
          <h1 className="hero-text-line text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Creating An{" "}
            <span
              ref={typedWordRef}
              className="hero-highlight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
            >
              {currentText}
            </span>
            <span className="typing-cursor -top-3 relative animate-pulse">
              |
            </span>
            <br />
            Digital Solution
          </h1>

          {/* Feature List */}
          <ul className="max-w-2xl mx-auto space-y-3 mb-12">
            {features.map((feature, index) => (
              <li
                key={index}
                className="hero-feature flex items-center justify-center gap-3 text-gray-700 text-lg"
              >
                <Check className="w-5 h-5 text-purple-600 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA Buttons */}
          <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
            >
              Get Started
            </a>
            <a
              href="#services"
              className="px-8 py-3 bg-white text-purple-600 font-semibold rounded-lg border-2 border-purple-600 hover:bg-purple-50 transition-colors"
            >
              Our Services
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
