import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSearch } from "@tanstack/react-router";
import { AlertCircle, Download, Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Priority } from "../backend";
import StatusBadge from "../components/StatusBadge";
import StatusTimeline from "../components/StatusTimeline";
import { useComplaintByNumber } from "../hooks/useQueries";

const PRIORITY_LABELS: Record<string, string> = {
  normal: "সাধারণ",
  urgent: "জরুরি",
  veryUrgent: "অতি জরুরি",
};

const COMPLAINT_TYPE_LABELS: Record<string, string> = {
  salary: "বেতন সমস্যা",
  termination: "চাকরিচ্যুতি",
  leave: "ছুটি/অবকাশ",
  safety: "নিরাপত্তা সমস্যা",
  harassment: "কর্মক্ষেত্রে হয়রানি",
  overtime: "ওভারটাইম সমস্যা",
  contract: "চুক্তি/নিয়োগ সমস্যা",
  other: "অন্যান্য",
};

export default function TrackingPage() {
  const searchParams = useSearch({ strict: false }) as { id?: string };
  const [inputId, setInputId] = useState(searchParams.id ?? "");
  const [searchedId, setSearchedId] = useState(searchParams.id ?? "");

  const {
    data: complaint,
    isLoading,
    isFetching,
  } = useComplaintByNumber(searchedId);

  useEffect(() => {
    if (searchParams.id) {
      setInputId(searchParams.id);
      setSearchedId(searchParams.id);
    }
  }, [searchParams.id]);

  const handleSearch = () => {
    if (inputId.trim()) setSearchedId(inputId.trim());
  };

  const handleDownload = () => {
    if (!complaint) return;
    const content = `
স্বীকৃতিপত্র
============================
বাংলাদেশ শ্রমিক কল্যাণ সংস্থা

অভিযোগ নম্বর: ${complaint.complaintNumber}
অভিযোগকারীর নাম: ${complaint.complainantName}
অভিযোগের বিষয়: ${complaint.subject}
অভিযোগের ধরন: ${COMPLAINT_TYPE_LABELS[complaint.complaintType] ?? complaint.complaintType}
জমাদানের তারিখ: ${new Date(Number(complaint.createdAt / 1000000n)).toLocaleDateString("bn-BD")}
বর্তমান স্ট্যাটাস: ${complaint.status}
============================
এই স্বীকৃতিপত্র সংরক্ষণ করুন।
    `.trim();
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${complaint.complaintNumber}-acknowledgement.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">
            অভিযোগের অবস্থা দেখুন
          </h1>
          <p className="text-gray-600">অভিযোগ নম্বর দিয়ে বর্তমান অবস্থা দেখুন</p>
        </div>

        {/* Search box */}
        <Card className="shadow-card border-0 mb-8">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <Input
                placeholder="অভিযোগ নম্বর (e.g. BC-2026-0001)"
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="h-12 flex-1"
                data-ocid="tracking.search_input"
              />
              <Button
                onClick={handleSearch}
                disabled={isLoading || isFetching}
                className="bg-navy text-white h-12 px-6 font-semibold hover:bg-navy/90"
                data-ocid="tracking.search.button"
              >
                {isLoading || isFetching ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Search size={18} className="mr-2" />
                    খুঁজুন
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        {(isLoading || isFetching) && searchedId && (
          <div className="text-center py-12" data-ocid="tracking.loading_state">
            <Loader2
              size={40}
              className="animate-spin text-green-primary mx-auto mb-3"
            />
            <p className="text-gray-600">অভিযোগ খুঁজছে...</p>
          </div>
        )}

        {/* Not found */}
        {!isLoading && !isFetching && searchedId && complaint === null && (
          <Card
            className="shadow-card border-0"
            data-ocid="tracking.error_state"
          >
            <CardContent className="py-12 text-center">
              <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-navy mb-2">
                অভিযোগ পাওয়া যায়নি
              </h3>
              <p className="text-gray-600 text-sm">
                <strong>{searchedId}</strong> নম্বরের কোনো অভিযোগ পাওয়া যায়নি।{" "}
                নম্বরটি ঠিকমতো লিখুন।
              </p>
            </CardContent>
          </Card>
        )}

        {/* Complaint Result */}
        {!isLoading && !isFetching && complaint && (
          <div className="space-y-4" data-ocid="tracking.success_state">
            {/* Header card */}
            <Card className="shadow-card border-0">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      অভিযোগ নম্বর
                    </div>
                    <div className="text-2xl font-bold text-navy tracking-wider mb-2">
                      {complaint.complaintNumber}
                    </div>
                    <StatusBadge status={complaint.status} />
                  </div>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="flex items-center gap-2 border-navy text-navy"
                    data-ocid="tracking.download.button"
                  >
                    <Download size={16} />
                    স্বীকৃতিপত্র ডাউনলোড
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Details */}
            <Card className="shadow-card border-0">
              <CardContent className="p-6">
                <h3 className="font-bold text-navy mb-4 text-base">
                  অভিযোগের তথ্য
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">অভিযোগকারীর নাম:</span>
                    <div className="font-semibold text-navy">
                      {complaint.complainantName}
                    </div>
                  </div>
                  {complaint.workerId && (
                    <div>
                      <span className="text-gray-500">শ্রমিক আইডি:</span>
                      <div className="font-semibold text-navy">
                        {complaint.workerId}
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">অভিযোগের বিষয়:</span>
                    <div className="font-semibold text-navy">
                      {complaint.subject}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">অভিযোগের ধরন:</span>
                    <div className="font-semibold text-navy">
                      {COMPLAINT_TYPE_LABELS[complaint.complaintType] ??
                        complaint.complaintType}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">কোম্পানি:</span>
                    <div className="font-semibold text-navy">
                      {complaint.companyName}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">ঘটনার তারিখ:</span>
                    <div className="font-semibold text-navy">
                      {complaint.incidentDate}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">জমাদানের তারিখ:</span>
                    <div className="font-semibold text-navy">
                      {new Date(
                        Number(complaint.createdAt / 1000000n),
                      ).toLocaleDateString("bn-BD")}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">অগ্রাধিকার:</span>
                    <div>
                      <Badge
                        variant="outline"
                        className={
                          complaint.priority === Priority.veryUrgent
                            ? "border-red-300 text-red-700"
                            : complaint.priority === Priority.urgent
                              ? "border-yellow-300 text-yellow-700"
                              : "border-gray-300 text-gray-600"
                        }
                      >
                        {PRIORITY_LABELS[complaint.priority] ??
                          complaint.priority}
                      </Badge>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-500">সর্বশেষ আপডেট:</span>
                    <div className="font-semibold text-navy">
                      {new Date(
                        Number(complaint.updatedAt / 1000000n),
                      ).toLocaleDateString("bn-BD")}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="shadow-card border-0">
              <CardContent className="p-6">
                <h3 className="font-bold text-navy mb-6 text-base">
                  অভিযোগের প্রগতি
                </h3>
                <StatusTimeline status={complaint.status} />
              </CardContent>
            </Card>

            {/* Status Description (admin's public message) */}
            {complaint.statusDescription && (
              <Card className="shadow-card border-0">
                <CardContent className="p-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2 text-base">
                      📋 অবস্থার বিবরণ:
                    </h3>
                    <p className="text-gray-800 leading-relaxed">
                      {complaint.statusDescription}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Officer info */}
            {(complaint.officer ||
              complaint.department ||
              complaint.officerRemarks ||
              complaint.nextStep) && (
              <Card className="shadow-card border-0">
                <CardContent className="p-6">
                  <h3 className="font-bold text-navy mb-4 text-base">
                    দায়িত্বপ্রাপ্ত কর্মকর্তা
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {complaint.officer && (
                      <div>
                        <span className="text-gray-500">কর্মকর্তা:</span>
                        <div className="font-semibold text-navy">
                          {complaint.officer}
                        </div>
                      </div>
                    )}
                    {complaint.department && (
                      <div>
                        <span className="text-gray-500">বিভাগ:</span>
                        <div className="font-semibold text-navy">
                          {complaint.department}
                        </div>
                      </div>
                    )}
                    {complaint.officerRemarks && (
                      <div className="sm:col-span-2">
                        <span className="text-gray-500">কর্মকর্তার মন্তব্য:</span>
                        <div className="font-medium text-navy bg-gray-50 rounded-lg p-3 mt-1">
                          {complaint.officerRemarks}
                        </div>
                      </div>
                    )}
                    {complaint.nextStep && (
                      <div className="sm:col-span-2">
                        <span className="text-gray-500">পরবর্তী ধাপ:</span>
                        <div className="font-medium text-navy bg-blue-50 rounded-lg p-3 mt-1">
                          {complaint.nextStep}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
