import { MapPin } from "lucide-react";
import type { HomeBranchGroup } from "@/lib/home";
import Image from "next/image";

interface BranchesSectionProps {
  branchGroups: HomeBranchGroup[];
}

export function BranchesSection({ branchGroups }: BranchesSectionProps) {
  if (!branchGroups || branchGroups.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-white border-t border-b border-border/40">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          {/* Map Area (Placeholder for actual map) */}
          <div className="w-full lg:w-5/12 bg-sky-300/40 rounded-xl overflow-hidden min-h-[400px] lg:min-h-[600px] flex items-center justify-center relative border border-border">
            <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=South+India&zoom=6&size=800x800&sensor=false')] bg-cover bg-center opacity-20"></div>
            <div className="text-center z-10 p-6 bg-white/90 rounded-lg shadow-sm">
              <MapPin className="size-12 text-destructive mx-auto mb-3" />
              <h3 className="text-xl font-bold text-foreground">Our Locations</h3>
              <p className="text-muted-foreground mt-2 text-sm max-w-[200px] mx-auto">
                Find a store near you to experience our mattresses in person.
              </p>
            </div>
          </div>

          {/* Branches List Area */}
          <div className="w-full lg:w-7/12 flex flex-col justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {branchGroups.map((group, i) => (
                <div key={i} className="flex flex-col relative">
                  {/* Vertical Divider for desktop (except first column) */}
                  {i > 0 && i % 3 !== 0 && (
                    <div className="hidden lg:block absolute -left-4 top-0 bottom-0 w-px bg-border"></div>
                  )}

                  <h3 className="text-destructive font-bold text-base md:text-lg uppercase tracking-wider mb-8">
                    {group.state}
                  </h3>
                  
                  <div className="flex flex-col gap-8">
                    {group.branches.map((branch) => (
                      <div key={branch.id} className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <div className="bg-destructive text-white rounded-full p-1.5 shrink-0">
                            <MapPin className="size-4" fill="currentColor" strokeWidth={1} />
                          </div>
                          {branch.googleMapUrl ? (
                            <a 
                              href={branch.googleMapUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-bold text-foreground text-sm md:text-base tracking-wide uppercase hover:text-destructive hover:underline transition-colors"
                            >
                              {branch.city}
                            </a>
                          ) : (
                            <h4 className="font-bold text-foreground text-sm md:text-base tracking-wide uppercase">
                              {branch.city}
                            </h4>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed pl-10">
                          {branch.address}
                          {branch.phone && (
                            <span className="block mt-1 font-medium text-foreground">
                              Ph: {branch.phone}
                            </span>
                          )}
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
  );
}
