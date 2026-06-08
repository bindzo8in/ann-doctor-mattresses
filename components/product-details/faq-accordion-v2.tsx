"use client";

import { ProductFaq } from "@/app/generated/prisma/browser";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Props {
  faqs: ProductFaq[];
}

export function FaqAccordionV2({ faqs }: Props) {
  if (!faqs?.length) return null;

  return (
    <Accordion type="single" collapsible className="w-full space-y-4">
      {faqs.map((faq) => (
        <AccordionItem key={faq.id} value={faq.id} className="border-0 bg-transparent">
          <AccordionTrigger className="text-left font-semibold bg-[#E53935] text-white px-6 py-4 rounded-full hover:no-underline hover:bg-red-700 transition-colors data-[state=open]:rounded-b-none data-[state=open]:rounded-t-2xl">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-slate-700 leading-relaxed bg-white border border-t-0 border-slate-200 px-6 py-4 rounded-b-2xl shadow-sm">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
