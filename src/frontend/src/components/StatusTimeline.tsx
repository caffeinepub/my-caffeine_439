import { Check } from "lucide-react";
import { Status } from "../backend";

const TIMELINE_STEPS = [
  { label: "অভিযোগ গ্রহণ" },
  { label: "যাচাই জলছে" },
  { label: "তদন্তাধীন" },
  { label: "শুনানি নির্ধারিত" },
  { label: "সমাধান প্রক্রিয়াধীন" },
  { label: "নিষ্পত্তি হয়েছে" },
];

const STATUS_ORDER: Record<Status, number> = {
  [Status.pending]: 0,
  [Status.underReview]: 1,
  [Status.investigating]: 2,
  [Status.resolved]: 5,
  [Status.rejected]: 0,
};

interface StatusTimelineProps {
  status: Status;
}

export default function StatusTimeline({ status }: StatusTimelineProps) {
  const currentStep = status === Status.rejected ? -1 : STATUS_ORDER[status];

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-start min-w-[600px] py-2">
        {TIMELINE_STEPS.map((step, index) => {
          const isCompleted = currentStep > index;
          const isActive = currentStep === index;
          const isRejected = status === Status.rejected;

          return (
            <div key={step.label} className="flex-1 flex flex-col items-center">
              <div className="flex items-center w-full">
                {/* Line before */}
                {index > 0 && (
                  <div
                    className={`flex-1 h-0.5 ${
                      isCompleted || isActive
                        ? "bg-green-primary"
                        : "bg-gray-200"
                    }`}
                  />
                )}
                {/* Circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all ${
                    isRejected
                      ? "bg-gray-200 text-gray-400"
                      : isCompleted
                        ? "bg-green-primary text-white"
                        : isActive
                          ? "bg-navy text-white ring-4 ring-navy/20"
                          : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isCompleted ? <Check size={14} /> : index + 1}
                </div>
                {/* Line after */}
                {index < TIMELINE_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 ${
                      isCompleted ? "bg-green-primary" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
              {/* Label */}
              <div
                className={`text-center text-xs mt-2 px-1 leading-tight ${
                  isRejected
                    ? "text-gray-400"
                    : isActive
                      ? "font-bold text-navy"
                      : isCompleted
                        ? "text-green-primary font-medium"
                        : "text-gray-400"
                }`}
              >
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
      {status === Status.rejected && (
        <div className="text-center mt-2 text-sm text-red-600 font-medium">
          এই অভিযোগটি প্রত্যাখ্যাত হয়েছে
        </div>
      )}
    </div>
  );
}
