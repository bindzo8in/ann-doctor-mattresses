import aboutBg from "@/public/about_us.png";
import badge1 from "@/public/about-badge/1.png";
import badge2 from "@/public/about-badge/2.png";
import badge3 from "@/public/about-badge/3.png";
import Image from "next/image";

export default function AboutUs() {
    const badges = [badge1, badge2, badge3];

    return (
        <section
            style={{ backgroundImage: `url(${aboutBg.src})` }}
            className="
                group
                relative
                overflow-hidden

                bg-cover
                bg-center
                bg-no-repeat

                py-12
                sm:py-16
                lg:py-24

                text-white
                font-montserrat-alternates

                before:absolute
                before:inset-0
                before:content-['']
                before:bg-black/20

                hover:before:bg-black/60

                before:transition-colors
                before:duration-700
                before:ease-[cubic-bezier(0.22,1,0.36,1)]
            "
        >
            <div
                className="
                    container
                    relative
                    z-10
                    mx-auto
                    px-4
                    sm:px-6
                    lg:px-8

                    opacity-0
                    translate-y-4
                    scale-[0.98]

                    group-hover:opacity-100
                    group-hover:translate-y-0
                    group-hover:scale-100

                    transition-all
                    duration-700
                    ease-[cubic-bezier(0.22,1,0.36,1)]

                    will-change-transform
                "
            >
                {/* Heading */}
                <h2
                    className="
                        mb-6
                        lg:mb-8

                        text-center
                        font-bold

                        text-3xl
                        sm:text-4xl
                        lg:text-5xl
                        xl:text-6xl
                    "
                >
                    About Us
                </h2>

                {/* Content */}
                <div className="mx-auto max-w-5xl space-y-4 lg:space-y-6">
                    <p
                        className="
                            text-center

                            text-sm
                            sm:text-base
                            lg:text-lg

                            leading-7
                            lg:leading-8

                            text-white/95
                        "
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
                        className="
                            text-center

                            text-sm
                            sm:text-base
                            lg:text-lg

                            leading-7
                            lg:leading-8

                            text-white/95
                        "
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
                    className="
                        mt-10
                        sm:mt-12
                        lg:mt-16

                        flex
                        flex-wrap
                        justify-center
                        items-center

                        gap-4
                        sm:gap-6
                        lg:gap-8
                    "
                >
                    {badges.map((badge, idx) => (
                        <Image
                            key={idx}
                            src={badge}
                            alt={`badge-${idx + 1}`}
                            width={144}
                            height={144}
                            className="
                                w-20 h-20
                                sm:w-28 sm:h-28
                                lg:w-36 lg:h-36

                                object-contain

                                transition-transform
                                duration-500
                                ease-[cubic-bezier(0.22,1,0.36,1)]

                                group-hover:scale-105
                            "
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}