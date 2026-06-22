"use client";

import { motion } from "motion/react";
import { useState } from "react";
import Image from "next/image";

export interface Variant {
    id: string;
    name: string;
    colorHex: string;
    link: string;
    imageUrl?: string;
}

interface VariantStackProps {
    variants: Variant[];
}

interface CardPosition {
    x: number;
    y: number;
    z: number;
    width: number;
    height: number;
}

const POSITION_COLORS = [
    "#f0d5d5",
    "#f4aeb1",
    "#f2797e",
    "#db484e",
] as const;

const CARD_POSITIONS: readonly CardPosition[] = [
    { x: 0, y: 0, z: 40, width: 650, height: 120 },
    { x: 50, y: 90, z: 30, width: 620, height: 110 },
    { x: 100, y: 170, z: 20, width: 590, height: 100 },
    { x: 150, y: 240, z: 10, width: 560, height: 90 },
] as const;

export function VariantStack({
    variants,
}: VariantStackProps) {
    const [items, setItems] = useState<Variant[]>(variants);

    const rotateToFront = (index: number) => {
        if (index === 0) return;

        setItems((prev) => [
            ...prev.slice(index),
            ...prev.slice(0, index),
        ]);
    };

    return (
        <div className="relative h-[420px] w-[720px]">
            {items.slice(0, CARD_POSITIONS.length).map((item, index) => {
                const position = CARD_POSITIONS[index];

                return (
                    <motion.div
                        key={item.id}
                        layout
                        layoutId={item.id}
                        // animate={{
                        //     x: position.x,
                        //     y: position.y,
                        //     width: position.width,
                        //     height: position.height,
                        // }}
                        // transition={{
                        //     type: "spring",
                        //     stiffness: 120,
                        //     damping: 20,
                        // }}
                        transition={{
                            type: "spring",
                            stiffness: 120,
                            damping: 20,
                            layout: {
                                duration: 0.45,
                            },
                        }}
                        onClick={() => rotateToFront(index)}
                        className="absolute left-0 top-0 cursor-pointer overflow-hidden rounded-bl-[60px] shadow-lg   select-none
    touch-manipulation"
                        // style={{
                        //     zIndex: position.z,
                        //     backgroundColor: POSITION_COLORS[index],
                        // }}
                        //                         style={{
                        //   zIndex: position.z,
                        //   backgroundColor: POSITION_COLORS[index],
                        //   width: position.width,
                        //   height: position.height,
                        //   transform: `translate(${position.x}px, ${position.y}px)`,
                        // }}
                        style={{
                            left: position.x,
                            top: position.y,
                            width: position.width,
                            height: position.height,
                            zIndex: position.z,
                            backgroundColor: POSITION_COLORS[index],
                        }}
                    >
                        {index === 0 ? (
                            <div className="flex h-full items-center gap-6 px-6">
                                {item.imageUrl && (
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.name}
                                        width={180}
                                        height={90}
                                        className="h-[90px] w-[180px] object-cover pointer-events-none select-none rounded-bl-4xl"
                                        priority
                                        loading="eager"
                                    />
                                )}

                                <h3 className="text-2xl font-medium pointer-events-none select-none">
                                    {item.name}
                                </h3>
                            </div>
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                <h3 className="text-lg font-medium pointer-events-none">
                                    {item.name}
                                </h3>
                            </div>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
}