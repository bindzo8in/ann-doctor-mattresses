export const STANDARD_COLORS = [
  { value: "Red", label: "Red", hex: "#E53935", tailwindClass: "bg-red-600" },
  { value: "Blue", label: "Blue", hex: "#3B82F6", tailwindClass: "bg-blue-500" },
  { value: "Yellow", label: "Yellow", hex: "#CA8A04", tailwindClass: "bg-yellow-600" },
  { value: "Slate", label: "Slate", hex: "#1E293B", tailwindClass: "bg-slate-800" },
  { value: "Black", label: "Black", hex: "#000000", tailwindClass: "bg-black" },
  { value: "White", label: "White", hex: "#FFFFFF", tailwindClass: "bg-white border border-slate-200" },
  { value: "Brown", label: "Brown", hex: "#78350F", tailwindClass: "bg-amber-900" },
  { value: "Green", label: "Green", hex: "#16A34A", tailwindClass: "bg-green-600" },
  { value: "Purple", label: "Purple", hex: "#9333EA", tailwindClass: "bg-purple-600" },
];

export function getColorByValue(value: string) {
  return STANDARD_COLORS.find((c) => c.value === value) || STANDARD_COLORS[0];
}
