import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

export const HolographicStack = () => {
    const container = useRef<HTMLDivElement>(null);
    const wrapper = useRef<HTMLDivElement>(null);
    const layers = useRef<(HTMLDivElement | null)[]>([]);

    useGSAP(() => {
        if (!wrapper.current) return;

        // Continuous Float
        gsap.to(wrapper.current, {
            y: -10,
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

        // Hover Effect - Explosion
        const tl = gsap.timeline({ paused: true });

        // Layer 0: Infra (Bottom)
        tl.to(layers.current[0], { 
            z: -60, 
            y: 15,
            backgroundColor: "rgba(59, 130, 246, 0.15)", 
            borderColor: "rgba(96, 165, 250, 0.5)",
            duration: 0.8, 
            ease: "power3.out" 
        }, 0);

        // Layer 1: Data
        tl.to(layers.current[1], { 
            z: 0, 
            backgroundColor: "rgba(168, 85, 247, 0.15)", 
            borderColor: "rgba(192, 132, 252, 0.5)",
            duration: 0.8, 
            ease: "power3.out" 
        }, 0);

        // Layer 2: API
        tl.to(layers.current[2], { 
            z: 60, 
            backgroundColor: "rgba(232, 121, 249, 0.15)", 
            borderColor: "rgba(244, 114, 182, 0.5)",
            duration: 0.8, 
            ease: "power3.out" 
        }, 0);

        // Layer 3: UI (Top)
        tl.to(layers.current[3], { 
            z: 120, 
            y: -15,
            backgroundColor: "rgba(52, 211, 153, 0.15)", 
            borderColor: "rgba(52, 211, 153, 0.5)",
            duration: 0.8, 
            ease: "power3.out" 
        }, 0);
        
        // Enhance text visibility on hover
        tl.to(".stack-label", { opacity: 1, duration: 0.4 }, 0);


        // Mouse Move - 3D Tilt
        const handleMouseMove = (e: MouseEvent) => {
            if (!container.current || !wrapper.current) return;
            const rect = container.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -20; // Max 20deg
            const rotateY = ((x - centerX) / centerX) * 20;

            gsap.to(wrapper.current, {
                rotateX: 60 + rotateX, 
                rotateY: rotateY,
                duration: 1, // Slower duration for smoother "lag" feel
                ease: "power3.out",
                overwrite: "auto"
            });
        };

        const handleMouseLeave = () => {
            tl.reverse();
            gsap.to(wrapper.current, {
                rotateX: 60,
                rotateY: 0,
                duration: 1.2,
                ease: "elastic.out(1, 0.5)",
                overwrite: "auto"
            });
        };

        const handleMouseEnter = () => {
            tl.play();
        };

        const el = container.current;
        if(el) {
            el.addEventListener('mousemove', handleMouseMove);
            el.addEventListener('mouseleave', handleMouseLeave);
            el.addEventListener('mouseenter', handleMouseEnter);
        }

        return () => {
            if(el) {
                el.removeEventListener('mousemove', handleMouseMove);
                el.removeEventListener('mouseleave', handleMouseLeave);
                el.removeEventListener('mouseenter', handleMouseEnter);
            }
        };

    }, { scope: container });

    return (
        <div ref={container} className="relative w-full h-[300px] flex items-center justify-center perspective-[1000px] cursor-pointer">
            <div 
                ref={wrapper} 
                className="relative w-48 h-32 transform-style-3d will-change-transform"
                style={{ transform: 'rotateX(60deg)' }}
            >
                {/* Infra */}
                <div 
                    ref={(el) => { if (el) layers.current[0] = el; }}
                    className="absolute inset-0 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm"
                    style={{ transform: 'translateZ(-20px)' }}
                >
                    <span className="stack-label text-xs font-bold text-blue-300 font-mono tracking-widest opacity-60" style={{ transform: 'rotateX(-60deg)' }}>INFRA</span>
                </div>

                {/* Data */}
                <div 
                    ref={(el) => { if (el) layers.current[1] = el; }}
                    className="absolute inset-0 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm"
                    style={{ transform: 'translateZ(0px)' }}
                >
                     <span className="stack-label text-xs font-bold text-purple-300 font-mono tracking-widest opacity-60" style={{ transform: 'rotateX(-60deg)' }}>DATA</span>
                </div>

                {/* API */}
                <div 
                    ref={(el) => { if (el) layers.current[2] = el; }}
                    className="absolute inset-0 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm"
                    style={{ transform: 'translateZ(20px)' }}
                >
                     <span className="stack-label text-xs font-bold text-fuchsia-300 font-mono tracking-widest opacity-60" style={{ transform: 'rotateX(-60deg)' }}>API</span>
                </div>

                {/* UI */}
                <div 
                    ref={(el) => { if (el) layers.current[3] = el; }}
                    className="absolute inset-0 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm"
                    style={{ transform: 'translateZ(40px)' }}
                >
                    <span className="stack-label text-xs font-bold text-emerald-300 font-mono tracking-widest opacity-60" style={{ transform: 'rotateX(-60deg)' }}>UI/UX</span>
                </div>
            </div>
        </div>
    );
};
