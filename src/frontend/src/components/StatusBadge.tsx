import { Badge } from "@/components/ui/badge";
import { Status } from "../backend";

interface StatusBadgeProps {
  status: Status;
  size?: "sm" | "md";
}

export const STATUS_LABELS: Record<Status, string> = {
  [Status.pending]: "অপেক্ষমান",
  [Status.underReview]: "পর্যালোচনাধীন",
  [Status.investigating]: "তদন্তাধীন",
  [Status.resolved]: "নিষ্পত্তি হয়েছে",
  [Status.rejected]: "প্রত্যাখ্যাত",
};

export const STATUS_COLORS: Record<Status, string> = {
  [Status.pending]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [Status.underReview]: "bg-blue-100 text-blue-800 border-blue-200",
  [Status.investigating]: "bg-orange-100 text-orange-800 border-orange-200",
  [Status.resolved]: "bg-green-100 text-green-800 border-green-200",
  [Status.rejected]: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const label = STATUS_LABELS[status] ?? status;
  const colorClass = STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600";
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <Badge
      variant="outline"
      className={`font-semibold border ${colorClass} ${sizeClass}`}
    >
      {label}
    </Badge>
  );
}
