import { ShieldCheck, Star, Truck, HeartHandshake, Wrench, Award } from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "10-Year Warranty",
    description:
      "Every mattress and sofa comes with a 10-year manufacturer warranty — zero questions asked.",
  },
  {
    icon: Truck,
    title: "Free Home Delivery",
    description:
      "We deliver right to your doorstep across Tamil Nadu, Karnataka, and Kerala — at no extra cost.",
  },
  {
    icon: Star,
    title: "Doctor Recommended",
    description:
      "Our orthopaedic range is tested and approved by leading spine and sleep specialists.",
  },
  {
    icon: HeartHandshake,
    title: "100-Night Trial",
    description:
      "Sleep on it for 100 nights. If you're not completely satisfied, we'll make it right.",
  },
  {
    icon: Wrench,
    title: "Expert Installation",
    description:
      "Our trained team delivers, unpacks, and sets up your furniture professionally.",
  },
  {
    icon: Award,
    title: "Premium Materials",
    description:
      "We use only high-density foam, natural latex, and eco-certified fabrics in every product.",
  },
];

export function WhyChooseUsSection() {
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-destructive mb-2">
            Why Ann Doctor
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground">
            Comfort You Can Trust
          </h2>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            Over two decades of sleep expertise, quality craftsmanship, and
            customer-first values.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group flex flex-col gap-4 p-7 rounded-2xl border bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className="flex items-center justify-center size-12 rounded-xl text-destructive"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(0 85% 97%) 0%, hsl(0 85% 92%) 100%)",
                }}
              >
                <Icon className="size-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground mb-1">
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
