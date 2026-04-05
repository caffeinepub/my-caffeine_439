import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Loader2, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Priority } from "../backend";
import { useActor } from "../hooks/useActor";

interface FormData {
  complainantName: string;
  workerId: string;
  mobile: string;
  companyName: string;
  workAddress: string;
  complaintType: string;
  subject: string;
  details: string;
  incidentDate: string;
  priority: Priority;
  consent: boolean;
}

const COMPLAINT_TYPES = [
  { value: "salary", label: "বেতন সমস্যা" },
  { value: "termination", label: "চাকরিচ্যুতি" },
  { value: "leave", label: "ছুটি/অবকাশ সমস্যা" },
  { value: "safety", label: "নিরাপত্তা সমস্যা" },
  { value: "harassment", label: "কর্মক্ষেত্রে হয়রানি" },
  { value: "overtime", label: "ওভারটাইম সমস্যা" },
  { value: "contract", label: "চুক্তি/নিয়োগ সমস্যা" },
  { value: "other", label: "অন্যান্য" },
];

export default function ComplaintFormPage() {
  const { actor, isFetching: actorLoading } = useActor();
  const queryClient = useQueryClient();
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [submittedNumber, setSubmittedNumber] = useState("");
  const [submittedDate, setSubmittedDate] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );

  const [form, setForm] = useState<FormData>({
    complainantName: "",
    workerId: "",
    mobile: "",
    companyName: "",
    workAddress: "",
    complaintType: "",
    subject: "",
    details: "",
    incidentDate: "",
    priority: Priority.normal,
    consent: false,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("সার্ভারের সাথে সংযোগ হচ্ছে না");
      const num = await actor.submitComplaint({
        complainantName: form.complainantName,
        workerId: form.workerId || undefined,
        mobile: form.mobile,
        companyName: form.companyName,
        workAddress: form.workAddress,
        complaintType: form.complaintType,
        subject: form.subject,
        details: form.details,
        incidentDate: form.incidentDate,
        priority: form.priority,
        attachmentIds: [],
      });
      return num;
    },
    onSuccess: (num) => {
      setSubmittedNumber(num);
      setSubmittedDate(new Date().toLocaleDateString("bn-BD"));
      queryClient.invalidateQueries({ queryKey: ["complaintStats"] });
      queryClient.invalidateQueries({ queryKey: ["allComplaints"] });
    },
  });

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!form.complainantName.trim()) newErrors.complainantName = "পূর্ণ নাম দিন";
    if (!form.mobile.trim()) newErrors.mobile = "মোবাইল নম্বর দিন";
    if (!form.companyName.trim()) newErrors.companyName = "কোম্পানির নাম দিন";
    if (!form.workAddress.trim()) newErrors.workAddress = "কর্মস্থলের ঠিকানা দিন";
    if (!form.complaintType)
      newErrors.complaintType = "অভিযোগের ধরন নির্বাচন করুন";
    if (!form.subject.trim()) newErrors.subject = "অভিযোগের বিষয় দিন";
    if (!form.details.trim() || form.details.trim().length < 50)
      newErrors.details = "অন্তত ৫০টি অক্ষর বিস্তারিত লিখুন";
    if (!form.incidentDate) newErrors.incidentDate = "ঘটনার তারিখ দিন";
    if (!form.consent) newErrors.consent = "সম্মতি প্রয়োজন";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) mutation.mutate();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (i: number) => {
    setAttachedFiles((prev) => prev.filter((_, idx) => idx !== i));
  };

  const update = (key: keyof FormData, val: string | boolean) =>
    setForm((p) => ({ ...p, [key]: val }));

  if (submittedNumber) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full"
        >
          <Card className="shadow-card border-0 text-center">
            <CardContent className="p-8">
              <CheckCircle2
                size={64}
                className="text-green-primary mx-auto mb-4"
              />
              <h2 className="text-2xl font-bold text-navy mb-3">
                অভিযোগ সফলভাবে গৃহীত হয়েছে
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                আপনার অভিযোগ সফলভাবে গ্রহণ করা হয়েছে। অভিযোগ নম্বর সংরক্ষণ করুন।
              </p>
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
                <div className="text-xs text-muted-foreground mb-1">
                  অভিযোগ নম্বর
                </div>
                <div
                  className="text-2xl font-bold text-green-primary tracking-widest"
                  data-ocid="complaint_form.success_state"
                >
                  {submittedNumber}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  জমাদানের তারিখ: {submittedDate}
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800 mb-6 text-left">
                <strong>পদক্ষেপ:</strong> হোমপেজে যান এবং ‘অবস্থা দেখুন’ তে আপনার
                অভিযোগ নম্বর দিয়ে অভিযোগের বর্তমান অবস্থা দেখুন।
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/complaint/track"
                  search={{ id: submittedNumber }}
                  className="flex-1 bg-green-primary text-white font-semibold py-3 rounded-lg text-center hover:opacity-90"
                  data-ocid="complaint_form.track.button"
                >
                  অভিযোগ ট্র্যাক করুন
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedNumber("");
                    setForm({
                      complainantName: "",
                      workerId: "",
                      mobile: "",
                      companyName: "",
                      workAddress: "",
                      complaintType: "",
                      subject: "",
                      details: "",
                      incidentDate: "",
                      priority: Priority.normal,
                      consent: false,
                    });
                  }}
                  className="flex-1 border border-navy text-navy font-semibold py-3 rounded-lg text-center hover:bg-navy/5"
                  data-ocid="complaint_form.new_complaint.button"
                >
                  নতুন অভিযোগ
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">অভিযোগ করুন</h1>
          <p className="text-muted-foreground">
            নিচের ফর্মটি পূরণ করুন। সব তারকা (*) চিহ্নিত ফিল্ড পূরণ করা আবশ্যক।
          </p>
        </div>

        {mutation.isError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 text-sm">
            <AlertCircle size={18} />
            {(mutation.error as Error)?.message === "সার্ভারের সাথে সংযোগ হচ্ছে না"
              ? "সার্ভারের সাথে সংযোগ হচ্ছে না — পেজ রিফ্রেশ করুন"
              : "অভিযোগ জমা দেওয়া সম্ভব হয়নি। আবার চেষ্টা করুন।"}
          </div>
        )}

        <Card className="shadow-card border-0">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <div>
                <h3 className="font-bold text-navy mb-4 pb-2 border-b border-border text-base">
                  ব্যক্তিগত তথ্য
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="name"
                      className="text-sm font-semibold mb-1.5 block"
                    >
                      পূর্ণ নাম *
                    </Label>
                    <Input
                      id="name"
                      value={form.complainantName}
                      onChange={(e) =>
                        update("complainantName", e.target.value)
                      }
                      placeholder="আপনার পূর্ণ নাম"
                      className="h-11"
                      data-ocid="complaint_form.name.input"
                    />
                    {errors.complainantName && (
                      <p
                        className="text-red-500 text-xs mt-1"
                        data-ocid="complaint_form.name.error_state"
                      >
                        {errors.complainantName}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="workerId"
                      className="text-sm font-semibold mb-1.5 block"
                    >
                      শ্রমিক আইডি (এচ্ছাধীন)
                    </Label>
                    <Input
                      id="workerId"
                      value={form.workerId}
                      onChange={(e) => update("workerId", e.target.value)}
                      placeholder="শ্রমিক আইডি"
                      className="h-11"
                      data-ocid="complaint_form.worker_id.input"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="mobile"
                      className="text-sm font-semibold mb-1.5 block"
                    >
                      মোবাইল নম্বর *
                    </Label>
                    <Input
                      id="mobile"
                      type="tel"
                      value={form.mobile}
                      onChange={(e) => update("mobile", e.target.value)}
                      placeholder="০১৬৫-XXXXXXXX"
                      className="h-11"
                      data-ocid="complaint_form.mobile.input"
                    />
                    {errors.mobile && (
                      <p
                        className="text-red-500 text-xs mt-1"
                        data-ocid="complaint_form.mobile.error_state"
                      >
                        {errors.mobile}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="company"
                      className="text-sm font-semibold mb-1.5 block"
                    >
                      কারখানা/কোম্পানির নাম *
                    </Label>
                    <Input
                      id="company"
                      value={form.companyName}
                      onChange={(e) => update("companyName", e.target.value)}
                      placeholder="কোম্পানির নাম"
                      className="h-11"
                      data-ocid="complaint_form.company.input"
                    />
                    {errors.companyName && (
                      <p
                        className="text-red-500 text-xs mt-1"
                        data-ocid="complaint_form.company.error_state"
                      >
                        {errors.companyName}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <Label
                    htmlFor="address"
                    className="text-sm font-semibold mb-1.5 block"
                  >
                    কর্মস্থলের ঠিকানা *
                  </Label>
                  <Textarea
                    id="address"
                    value={form.workAddress}
                    onChange={(e) => update("workAddress", e.target.value)}
                    placeholder="ঠিকানা লিখুন"
                    rows={2}
                    data-ocid="complaint_form.address.textarea"
                  />
                  {errors.workAddress && (
                    <p
                      className="text-red-500 text-xs mt-1"
                      data-ocid="complaint_form.address.error_state"
                    >
                      {errors.workAddress}
                    </p>
                  )}
                </div>
              </div>

              {/* Complaint Details */}
              <div>
                <h3 className="font-bold text-navy mb-4 pb-2 border-b border-border text-base">
                  অভিযোগের বিস্তার
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="text-sm font-semibold mb-1.5 block">
                      অভিযোগের ধরন *
                    </Label>
                    <Select
                      value={form.complaintType}
                      onValueChange={(v) => update("complaintType", v)}
                    >
                      <SelectTrigger
                        className="h-11"
                        data-ocid="complaint_form.type.select"
                      >
                        <SelectValue placeholder="ধরন নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPLAINT_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.complaintType && (
                      <p
                        className="text-red-500 text-xs mt-1"
                        data-ocid="complaint_form.type.error_state"
                      >
                        {errors.complaintType}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="incidentDate"
                      className="text-sm font-semibold mb-1.5 block"
                    >
                      ঘটনার তারিখ *
                    </Label>
                    <Input
                      id="incidentDate"
                      type="date"
                      value={form.incidentDate}
                      onChange={(e) => update("incidentDate", e.target.value)}
                      className="h-11"
                      data-ocid="complaint_form.incident_date.input"
                    />
                    {errors.incidentDate && (
                      <p
                        className="text-red-500 text-xs mt-1"
                        data-ocid="complaint_form.incident_date.error_state"
                      >
                        {errors.incidentDate}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <Label
                    htmlFor="subject"
                    className="text-sm font-semibold mb-1.5 block"
                  >
                    অভিযোগের বিষয় *
                  </Label>
                  <Input
                    id="subject"
                    value={form.subject}
                    onChange={(e) => update("subject", e.target.value)}
                    placeholder="সংক্ষিপ্ত বিষয়"
                    className="h-11"
                    data-ocid="complaint_form.subject.input"
                  />
                  {errors.subject && (
                    <p
                      className="text-red-500 text-xs mt-1"
                      data-ocid="complaint_form.subject.error_state"
                    >
                      {errors.subject}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="details"
                    className="text-sm font-semibold mb-1.5 block"
                  >
                    বিস্তারিত অভিযোগ * (ন্যূনতম ৫০ অক্ষর)
                  </Label>
                  <Textarea
                    id="details"
                    value={form.details}
                    onChange={(e) => update("details", e.target.value)}
                    placeholder="বিস্তারিত বিবরণ লিখুন..."
                    rows={5}
                    data-ocid="complaint_form.details.textarea"
                  />
                  <div className="flex justify-between mt-1">
                    {errors.details ? (
                      <p
                        className="text-red-500 text-xs"
                        data-ocid="complaint_form.details.error_state"
                      >
                        {errors.details}
                      </p>
                    ) : (
                      <span />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {form.details.length} অক্ষর
                    </span>
                  </div>
                </div>
              </div>

              {/* Priority */}
              <div>
                <h3 className="font-bold text-navy mb-4 pb-2 border-b border-border text-base">
                  অগ্রাধিকার
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  {[
                    {
                      value: Priority.normal,
                      label: "সাধারণ",
                      color: "bg-gray-100 border-gray-300 text-gray-700",
                      active: "bg-gray-200",
                    },
                    {
                      value: Priority.urgent,
                      label: "জরুরি",
                      color: "bg-yellow-50 border-yellow-300 text-yellow-800",
                      active: "bg-yellow-100",
                    },
                    {
                      value: Priority.veryUrgent,
                      label: "অতি জরুরি",
                      color: "bg-red-50 border-red-300 text-red-700",
                      active: "bg-red-100",
                    },
                  ].map((p) => (
                    <label
                      key={p.value}
                      className={`flex items-center gap-2 border-2 rounded-lg px-4 py-3 cursor-pointer flex-1 transition-all ${
                        form.priority === p.value
                          ? `${p.active} border-current font-bold`
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={p.value}
                        checked={form.priority === p.value}
                        onChange={() => update("priority", p.value)}
                        className="sr-only"
                        data-ocid={`complaint_form.priority_${p.value}.radio`}
                      />
                      <span className={p.color.split(" ")[2]}>{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* File Upload */}
              <div>
                <h3 className="font-bold text-navy mb-4 pb-2 border-b border-border text-base">
                  প্রমাণ আপলোড (এচ্ছাধীন)
                </h3>
                <label
                  htmlFor="fileUpload"
                  className="flex flex-col items-center gap-3 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-green-primary/50 transition-colors"
                  data-ocid="complaint_form.upload_button"
                >
                  <Upload size={28} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground text-center">
                    ছবি, PDF বা অডিও ফাইল আপলোড করুন
                  </span>
                  <input
                    id="fileUpload"
                    type="file"
                    multiple
                    accept="image/*,application/pdf,audio/*"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
                {attachedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachedFiles.map((f, i) => (
                      <div
                        key={`${f.name}-${i}`}
                        className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm"
                      >
                        <span className="truncate text-navy">{f.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="text-muted-foreground hover:text-red-500 ml-2"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Consent */}
              <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                <Checkbox
                  id="consent"
                  checked={form.consent}
                  onCheckedChange={(v) => update("consent", !!v)}
                  className="mt-0.5"
                  data-ocid="complaint_form.consent.checkbox"
                />
                <label
                  htmlFor="consent"
                  className="text-sm text-navy leading-relaxed cursor-pointer"
                >
                  আমি নিশ্চিত করছি যে উপরের তথ্য সত্য এবং সঠিক। সর্বতথ্য গোপনীয় রাখা
                  হবে।
                </label>
              </div>
              {errors.consent && (
                <p
                  className="text-red-500 text-xs -mt-3"
                  data-ocid="complaint_form.consent.error_state"
                >
                  {errors.consent}
                </p>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={mutation.isPending || actorLoading}
                className="w-full h-14 text-lg font-bold bg-red-primary hover:bg-red-primary/90 text-white rounded-xl"
                data-ocid="complaint_form.submit_button"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 size={22} className="mr-2 animate-spin" />
                    জমা দেওয়া হচ্ছে...
                  </>
                ) : actorLoading ? (
                  <>
                    <Loader2 size={22} className="mr-2 animate-spin" />
                    সংযোগ হচ্ছে...
                  </>
                ) : (
                  "অভিযোগ জমা দিন"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
