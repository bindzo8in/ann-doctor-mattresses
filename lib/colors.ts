export const STANDARD_COLORS = [
  { value: "White", label: "White", hex: "#FFFFFF", tailwindClass: "bg-white border border-slate-300" },
  { value: "Navy", label: "Navy Blue", hex: "#1E3A8A", tailwindClass: "bg-blue-900" },
  { value: "Slate", label: "Slate Grey", hex: "#475569", tailwindClass: "bg-slate-600" },
  { value: "IceBlue", label: "Ice Blue", hex: "#BAE6FD", tailwindClass: "bg-sky-200 border border-sky-300" },
  { value: "Burgundy", label: "Burgundy", hex: "#800020", tailwindClass: "bg-[#800020]" },
  { value: "Maroon", label: "Maroon", hex: "#65000B", tailwindClass: "bg-[#65000B]" },
  { value: "DeepPlum", label: "Deep Plum", hex: "#4A0E4E", tailwindClass: "bg-[#4A0E4E]" },
  { value: "SageGreen", label: "Sage Green", hex: "#8A9A86", tailwindClass: "bg-[#8A9A86]" },
  { value: "Olive", label: "Olive Green", hex: "#556B2F", tailwindClass: "bg-[#556B2F]" },
  { value: "WarmBeige", label: "Warm Beige", hex: "#E5D3B3", tailwindClass: "bg-[#E5D3B3] border border-amber-200" },
  { value: "Sand", label: "Sand", hex: "#C2B280", tailwindClass: "bg-[#C2B280]" },
  { value: "Brown", label: "Brown", hex: "#78350F", tailwindClass: "bg-amber-900" },
  { value: "Black", label: "Black", hex: "#000000", tailwindClass: "bg-black" },
];

export function getColorByValue(value: string) {
  if (!value) return STANDARD_COLORS[0];
  const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, "");
  
  const found = STANDARD_COLORS.find(
    (c) => c.value.toLowerCase() === normalized || c.label.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized
  );
  if (found) return found;

  // Legacy mappings for existing products in database
  if (normalized === "red") return STANDARD_COLORS.find(c => c.value === "Burgundy") || STANDARD_COLORS[0];
  if (normalized === "blue") return STANDARD_COLORS.find(c => c.value === "Navy") || STANDARD_COLORS[0];
  if (normalized === "yellow" || normalized === "gold" || normalized === "mustard") return STANDARD_COLORS.find(c => c.value === "WarmBeige") || STANDARD_COLORS[0];
  if (normalized === "green") return STANDARD_COLORS.find(c => c.value === "SageGreen") || STANDARD_COLORS[0];
  if (normalized === "purple") return STANDARD_COLORS.find(c => c.value === "DeepPlum") || STANDARD_COLORS[0];

  return STANDARD_COLORS[0];
}
