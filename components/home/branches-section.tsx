"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";
import type { HomeBranchGroup } from "@/lib/home";
import { BranchMapModal } from "./branch-map-modal";
import { BranchMap } from "./branch-map";

interface BranchesSectionProps {
  branchGroups: HomeBranchGroup[];
}

export function BranchesSection({
  branchGroups,
}: BranchesSectionProps) {
  const [selectedBranch, setSelectedBranch] = useState<any>(null);

  if (!branchGroups?.length) return null;

  const allBranches = branchGroups.flatMap(group => group.branches);

  return (
    <>
      <section className="bg-[#005814] section-padding">
        <div className="page-container">
          <h2 className="mb-8 text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
            Branches:
          </h2>

          <div className="overflow-hidden bg-[#efefef]">
            <div className="grid lg:grid-cols-[320px_1fr]">
              {/* Map */}
              <div className="relative min-h-[420px] w-full h-full z-0">
                <BranchMap branches={allBranches} />
              </div>

              {/* Branches */}
              <div className="grid md:grid-cols-3">
                {branchGroups.map((group, index) => (
                  <div
                    key={group.state}
                    className={`p-6 ${index !== branchGroups.length - 1
                      ? "border-r border-neutral-400"
                      : ""
                      }`}
                  >
                    <h3 className="mb-8 text-[11px] font-bold uppercase tracking-wide text-red-600">
                      {group.state}
                    </h3>

                    <div className="space-y-8">
                      {group.branches.map((branch) => (
                        <div key={branch.id} onClick={() =>
                          setSelectedBranch(branch)

                        }
                          className="cursor-pointer"
                        >
                          <div className="mb-2 flex items-start gap-2">
                            <MapPin
                              className="mt-0.5 h-4 w-4 shrink-0 text-red-600"
                              fill="currentColor"
                            />

                            <button
                              type="button"

                              className="cursor-pointer text-left text-xs font-bold uppercase text-black transition-colors hover:text-red-600"
                            >
                              {branch.name}
                            </button>
                          </div>

                          <p className="pl-6 cursor-pointer text-[11px] leading-relaxed text-neutral-600">
                            {branch.address}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <BranchMapModal
        open={!!selectedBranch}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedBranch(null);
          }
        }}
        title={selectedBranch?.name}
        address={selectedBranch?.address}
        mapUrl={selectedBranch?.mapUrl}
        googleMapUrl={selectedBranch?.googleMapUrl}
      />
    </>
  );
}