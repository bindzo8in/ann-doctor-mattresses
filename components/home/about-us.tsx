"use client";

import aboutBg from "@/public/about_us.png";
import badge1 from "@/public/about-badge/1.png";
import badge2 from "@/public/about-badge/2.png";
import badge3 from "@/public/about-badge/3.png";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function AboutUs() {
    const badges = [badge1, badge2, badge3];

    const sectionRef = useRef<HTMLElement>(null);
    const stripsContainerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const para1Ref = useRef<HTMLParagraphElement>(null);
    const para2Ref = useRef<HTMLParagraphElement>(null);
    const badgesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                    once: true,
                },
            });

            // Split overlay sliding in
            const strips = stripsContainerRef.current?.children;
            if (strips) {
                Array.from(strips).forEach((strip, index) => {
                    const fromX = index % 2 === 0 ? -100 : 100;
                    tl.fromTo(
                        strip,
                        { xPercent: fromX },
                        { xPercent: 0, duration: 0.8, ease: "power2.out" },
                        0
                    );
                });
            }

            // Heading slides up + fades in
            tl.fromTo(
                headingRef.current,
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
                0.1
            );

            // Paragraphs stagger in
            tl.fromTo(
                [para1Ref.current, para2Ref.current],
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: "power3.out" },
                0.3
            );

            // Badges pop in
            tl.fromTo(
                badgesRef.current!.children,
                { opacity: 0, scale: 0.75, y: 20 },
                { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "back.out(1.4)" },
                0.55
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            style={{ backgroundImage: `url(${aboutBg.src})` }}
            className="
                relative
                overflow-hidden
                bg-cover bg-center bg-no-repeat
                section-padding
                text-white
                font-montserrat-alternates
            "
        >
            {/* Split Overlays */}
            <div className="absolute inset-0 pointer-events-none flex flex-col">
                <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.2)" }} />
                <div ref={stripsContainerRef} className="absolute inset-0 flex flex-col">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex-1 w-full"
                            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                        />
                    ))}
                </div>
            </div>

            {/* Content */}
            <div
                ref={contentRef}
                className="page-container relative z-10"
            >
                {/* Heading */}
                <h2
                    ref={headingRef}
                    className="
                        mb-6 lg:mb-8
                        text-center font-bold
                        text-3xl sm:text-4xl lg:text-5xl xl:text-6xl
                        opacity-0
                    "
                >
                    About Us
                </h2>

                {/* Body text */}
                <div className="mx-auto max-w-5xl space-y-4 lg:space-y-6">
                    <p
                        ref={para1Ref}
                        className="text-center text-sm sm:text-base lg:text-lg leading-7 lg:leading-8 text-white/95 opacity-0"
                    >
                        Choosing Doctor Mattresses is a decision for unparalleled
                        comfort and health benefits. Expertly crafted with advanced
                        orthopedic design, these mattresses provide optimal spine
                        alignment and targeted support, reducing back pain and
                        improving posture. Their hypoallergenic materials ensure a
                        clean, healthy sleeping environment, while innovative cooling
                        technology regulates temperature for year-round comfort.
                    </p>

                    <p
                        ref={para2Ref}
                        className="text-center text-sm sm:text-base lg:text-lg leading-7 lg:leading-8 text-white/95 opacity-0"
                    >
                        Whether recovering from an injury or seeking better rest,
                        Doctor Mattresses cater to all sleeping positions, promoting
                        deeper sleep and long-term well-being. Durable and
                        customizable, they deliver the perfect balance of support and
                        luxury, making them the ideal choice for quality-conscious
                        sleepers.
                    </p>
                </div>

                {/* Badges */}
                <div
                    ref={badgesRef}
                    className="mt-10 sm:mt-12 lg:mt-16 flex flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8"
                >
                    {badges.map((badge, idx) => (
                        <Image
                            key={idx}
                            src={badge}
                            alt={`badge-${idx + 1}`}
                            width={144}
                            height={144}
                            className="w-20 h-20 sm:w-28 sm:h-28 lg:w-36 lg:h-36 object-contain opacity-0"
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}