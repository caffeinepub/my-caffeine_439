import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Edit,
  Loader2,
  MessageSquare,
  Save,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type ComplaintEditInput, Priority, Status } from "../backend";
import StatusBadge, { STATUS_LABELS } from "../components/StatusBadge";
import StatusTimeline from "../components/StatusTimeline";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useComplaintByNumber } from "../hooks/useQueries";
import { isPasswordAdmin } from "./AdminLoginPage";

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

export default function AdminComplaintDetailPage() {
  const params = useParams({ strict: false }) as { complaintNumber?: string };
  const complaintNumber = params.complaintNumber ?? "";
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const { data: complaint, isLoading } = useComplaintByNumber(complaintNumber);

  // Status update state
  const [newStatus, setNewStatus] = useState<Status | "">("");
  const [statusDescription, setStatusDescription] = useState("");

  // Officer / remarks state
  const [officer, setOfficer] = useState("");
  const [department, setDepartment] = useState("");
  const [remarks, setRemarks] = useState("");
  const [nextStep, setNextStep] = useState("");

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState<ComplaintEditInput>({
    complainantName: "",
    mobile: "",
    companyName: "",
    workAddress: "",
    complaintType: "",
    subject: "",
    details: "",
    incidentDate: "",
    priority: Priority.normal,
    status: Status.pending,
    statusDescription: "",
    officer: "",
    department: "",
    officerRemarks: "",
    nextStep: "",
  });

  // Delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const hasPasswordSession = isPasswordAdmin();

  useEffect(() => {
    if (!hasPasswordSession && !identity) {
      navigate({ to: "/admin/login" });
    }
  }, [identity, navigate, hasPasswordSession]);

  useEffect(() => {
    if (complaint) {
      setOfficer(complaint.officer ?? "");
      setDepartment(complaint.department ?? "");
      setRemarks(complaint.officerRemarks ?? "");
      setNextStep(complaint.nextStep ?? "");
      setStatusDescription(complaint.statusDescription ?? "");

      // Initialize edit form with current complaint data
      setEditForm({
        complainantName: complaint.complainantName,
        mobile: complaint.mobile,
        companyName: complaint.companyName,
        workAddress: complaint.workAddress,
        complaintType: complaint.complaintType,
        subject: complaint.subject,
        details: complaint.details,
        incidentDate: complaint.incidentDate,
        priority: complaint.priority,
        status: complaint.status,
        statusDescription: complaint.statusDescription ?? "",
        officer: complaint.officer ?? "",
        department: complaint.department ?? "",
        officerRemarks: complaint.officerRemarks ?? "",
        nextStep: complaint.nextStep ?? "",
      });
    }
  }, [complaint]);

  const ADMIN_PASSWORD = "@dminBGWS2001";

  const statusMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !newStatus) throw new Error("Missing data");
      if (hasPasswordSession) {
        await actor.updateComplaintStatusWithPassword(
          ADMIN_PASSWORD,
          complaintNumber,
          newStatus as Status,
          statusDescription,
        );
      } else {
        await actor.updateComplaintStatusWithDescription(
          complaintNumber,
          newStatus as Status,
          statusDescription,
        );
      }
    },
    onSuccess: () => {
      toast.success("স্ট্যাটাস আপডেট হয়েছে");
      queryClient.invalidateQueries({
        queryKey: ["complaint", complaintNumber],
      });
      queryClient.invalidateQueries({ queryKey: ["allComplaints"] });
      setNewStatus("");
      setStatusDescription("");
    },
    onError: () => toast.error("স্ট্যাটাস আপডেট সম্ভব হয়নি"),
  });

  const officerMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      if (hasPasswordSession) {
        await actor.assignOfficerWithPassword(
          ADMIN_PASSWORD,
          complaintNumber,
          officer,
          department,
        );
      } else {
        await actor.assignOfficer(complaintNumber, officer, department);
      }
    },
    onSuccess: () => {
      toast.success("কর্মকর্তা নিয়োগ হয়েছে");
      queryClient.invalidateQueries({
        queryKey: ["complaint", complaintNumber],
      });
    },
    onError: () => toast.error("কর্মকর্তা নিয়োগ সম্ভব হয়নি"),
  });

  const remarksMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      if (hasPasswordSession) {
        await actor.addOfficerRemarksWithPassword(
          ADMIN_PASSWORD,
          complaintNumber,
          remarks,
          nextStep,
        );
      } else {
        await actor.addOfficerRemarks(complaintNumber, remarks, nextStep);
      }
    },
    onSuccess: () => {
      toast.success("মন্তব্য সংরক্ষণ হয়েছে");
      queryClient.invalidateQueries({
        queryKey: ["complaint", complaintNumber],
      });
    },
    onError: () => toast.error("মন্তব্য সংরক্ষণ সম্ভব হয়নি"),
  });

  const editMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      const input: ComplaintEditInput = {
        complainantName: editForm.complainantName,
        mobile: editForm.mobile,
        companyName: editForm.companyName,
        workAddress: editForm.workAddress,
        complaintType: editForm.complaintType,
        subject: editForm.subject,
        details: editForm.details,
        incidentDate: editForm.incidentDate,
        priority: editForm.priority,
        status: editForm.status,
        statusDescription: editForm.statusDescription || undefined,
        officer: editForm.officer || undefined,
        department: editForm.department || undefined,
        officerRemarks: editForm.officerRemarks || undefined,
        nextStep: editForm.nextStep || undefined,
      };
      if (hasPasswordSession) {
        await actor.updateComplaintWithPassword(
          ADMIN_PASSWORD,
          complaintNumber,
          input,
        );
      } else {
        await actor.updateComplaint(complaintNumber, input);
      }
    },
    onSuccess: () => {
      toast.success("অভিযোগ সম্পাদনা হয়েছে");
      setIsEditMode(false);
      queryClient.invalidateQueries({
        queryKey: ["complaint", complaintNumber],
      });
      queryClient.invalidateQueries({ queryKey: ["allComplaints"] });
    },
    onError: () => toast.error("অভিযোগ সম্পাদনা সম্ভব হয়নি"),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      const actorAny = actor as any;
      if (hasPasswordSession) {
        await actorAny.deleteComplaintWithPassword(
          ADMIN_PASSWORD,
          complaintNumber,
        );
      } else {
        await actorAny.deleteComplaint(complaintNumber);
      }
    },
    onSuccess: () => {
      toast.success("অভিযোগ মুছে ফেলা হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["allComplaints"] });
      queryClient.invalidateQueries({ queryKey: ["complaintStats"] });
      navigate({ to: "/admin/dashboard" });
    },
    onError: () => toast.error("অভিযোগ মুছতে সমস্যা হয়েছে"),
  });

  const updateEditForm = (field: keyof ComplaintEditInput, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-page-bg flex items-center justify-center"
        data-ocid="complaint_detail.loading_state"
      >
        <Loader2 size={40} className="animate-spin text-green-primary" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">অভিযোগ পাওয়া যায়নি</p>
          <Link
            to="/admin/dashboard"
            className="text-navy font-semibold hover:underline"
          >
            ড্যাশবোর্ডে ফিরুন
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-bg">
      {/* Admin Header */}
      <header className="bg-navy text-white px-4 py-4 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link
            to="/admin/dashboard"
            className="text-white/80 hover:text-white"
            data-ocid="complaint_detail.back.button"
          >
            <ArrowLeft size={22} />
          </Link>
          <div>
            <h1 className="font-bold">অভিযোগ বিস্তারিত</h1>
            <p className="text-white/60 text-xs">{complaint.complaintNumber}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <StatusBadge status={complaint.status} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditMode(!isEditMode)}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 gap-2"
              data-ocid="complaint_detail.edit.button"
            >
              {isEditMode ? (
                <>
                  <X size={14} /> বাতিল
                </>
              ) : (
                <>
                  <Edit size={14} /> সম্পাদনা করুন
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="bg-red-600/80 border-red-400/50 text-white hover:bg-red-600 gap-1"
              data-ocid="complaint_detail.delete.button"
            >
              <Trash2 size={14} />
              মুছুন
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* ===== EDIT MODE FORM ===== */}
        {isEditMode && (
          <Card className="shadow-card border-0 border-t-4 border-t-blue-600">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <Edit size={18} />
                অভিযোগ সম্পাদনা করুন
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold mb-1.5 block text-gray-800">
                    অভিযোগকারীর নাম *
                  </Label>
                  <Input
                    value={editForm.complainantName}
                    onChange={(e) =>
                      updateEditForm("complainantName", e.target.value)
                    }
                    placeholder="অভিযোগকারীর নাম"
                    data-ocid="edit.complainant_name.input"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-1.5 block text-gray-800">
                    মোবাইল নম্বর *
                  </Label>
                  <Input
                    value={editForm.mobile}
                    onChange={(e) => updateEditForm("mobile", e.target.value)}
                    placeholder="মোবাইল নম্বর"
                    data-ocid="edit.mobile.input"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-1.5 block text-gray-800">
                    কোম্পানির নাম *
                  </Label>
                  <Input
                    value={editForm.companyName}
                    onChange={(e) =>
                      updateEditForm("companyName", e.target.value)
                    }
                    placeholder="কোম্পানির নাম"
                    data-ocid="edit.company_name.input"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-1.5 block text-gray-800">
                    ঘটনার তারিখ *
                  </Label>
                  <Input
                    value={editForm.incidentDate}
                    onChange={(e) =>
                      updateEditForm("incidentDate", e.target.value)
                    }
                    placeholder="YYYY-MM-DD"
                    type="date"
                    data-ocid="edit.incident_date.input"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-sm font-semibold mb-1.5 block text-gray-800">
                    কর্মস্থলের ঠিকানা *
                  </Label>
                  <Input
                    value={editForm.workAddress}
                    onChange={(e) =>
                      updateEditForm("workAddress", e.target.value)
                    }
                    placeholder="কর্মস্থলের ঠিকানা"
                    data-ocid="edit.work_address.input"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-1.5 block text-gray-800">
                    অভিযোগের ধরন *
                  </Label>
                  <Select
                    value={editForm.complaintType}
                    onValueChange={(v) => updateEditForm("complaintType", v)}
                  >
                    <SelectTrigger data-ocid="edit.complaint_type.select">
                      <SelectValue placeholder="ধরন বেছে নিন" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(COMPLAINT_TYPE_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-1.5 block text-gray-800">
                    অগ্রাধিকার *
                  </Label>
                  <Select
                    value={editForm.priority}
                    onValueChange={(v) =>
                      updateEditForm("priority", v as Priority)
                    }
                  >
                    <SelectTrigger data-ocid="edit.priority.select">
                      <SelectValue placeholder="অগ্রাধিকার বেছে নিন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Priority.normal}>সাধারণ</SelectItem>
                      <SelectItem value={Priority.urgent}>জরুরি</SelectItem>
                      <SelectItem value={Priority.veryUrgent}>
                        অতি জরুরি
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-1.5 block text-gray-800">
                    বর্তমান অবস্থা *
                  </Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(v) => updateEditForm("status", v as Status)}
                  >
                    <SelectTrigger data-ocid="edit.status.select">
                      <SelectValue placeholder="অবস্থা বেছে নিন" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <Label className="text-sm font-semibold mb-1.5 block text-gray-800">
                  বিষয় *
                </Label>
                <Input
                  value={editForm.subject}
                  onChange={(e) => updateEditForm("subject", e.target.value)}
                  placeholder="অভিযোগের বিষয়"
                  data-ocid="edit.subject.input"
                />
              </div>

              {/* Details */}
              <div>
                <Label className="text-sm font-semibold mb-1.5 block text-gray-800">
                  বিস্তারিত বিবরণ *
                </Label>
                <Textarea
                  value={editForm.details}
                  onChange={(e) => updateEditForm("details", e.target.value)}
                  placeholder="বিস্তারিত বিবরণ"
                  rows={4}
                  data-ocid="edit.details.textarea"
                />
              </div>

              {/* Status Description (public facing) */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <Label className="text-sm font-bold mb-1.5 block text-blue-900">
                  📋 অবস্থার বর্ণনা (অভিযোগকারীকে দেখানো হবে)
                </Label>
                <Textarea
                  value={editForm.statusDescription}
                  onChange={(e) =>
                    updateEditForm("statusDescription", e.target.value)
                  }
                  placeholder="অভিযোগকারীকে জানানোর জন্য অবস্থার বর্ণনা লিখুন"
                  rows={3}
                  data-ocid="edit.status_description.textarea"
                />
              </div>

              {/* Officer fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold mb-1.5 block text-gray-800">
                    দায়িত্বপ্রাপ্ত কর্মকর্তা
                  </Label>
                  <Input
                    value={editForm.officer}
                    onChange={(e) => updateEditForm("officer", e.target.value)}
                    placeholder="কর্মকর্তার নাম"
                    data-ocid="edit.officer.input"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-1.5 block text-gray-800">
                    বিভাগ
                  </Label>
                  <Input
                    value={editForm.department}
                    onChange={(e) =>
                      updateEditForm("department", e.target.value)
                    }
                    placeholder="বিভাগের নাম"
                    data-ocid="edit.department.input"
                  />
                </div>
              </div>

              {/* Officer Remarks */}
              <div>
                <Label className="text-sm font-semibold mb-1.5 block text-gray-800">
                  কর্মকর্তার মন্তব্য
                </Label>
                <Textarea
                  value={editForm.officerRemarks}
                  onChange={(e) =>
                    updateEditForm("officerRemarks", e.target.value)
                  }
                  placeholder="কর্মকর্তার মন্তব্য"
                  rows={3}
                  data-ocid="edit.officer_remarks.textarea"
                />
              </div>

              {/* Next Step */}
              <div>
                <Label className="text-sm font-semibold mb-1.5 block text-gray-800">
                  পরবর্তী পদক্ষেপ
                </Label>
                <Textarea
                  value={editForm.nextStep}
                  onChange={(e) => updateEditForm("nextStep", e.target.value)}
                  placeholder="পরবর্তী পদক্ষেপ বর্ণনা করুন"
                  rows={2}
                  data-ocid="edit.next_step.textarea"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => editMutation.mutate()}
                  disabled={editMutation.isPending}
                  className="bg-blue-700 hover:bg-blue-800 text-white"
                  data-ocid="edit.save.button"
                >
                  {editMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin mr-1" />
                  ) : (
                    <Save size={16} className="mr-1" />
                  )}
                  পরিবর্তন সংরক্ষণ করুন
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditMode(false)}
                  className="border-gray-300 text-gray-700"
                  data-ocid="edit.cancel.button"
                >
                  <X size={16} className="mr-1" />
                  বাতিল
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Complaint Info */}
        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <h2 className="font-bold text-navy mb-4 text-base">অভিযোগের তথ্য</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">অভিযোগকারীর নাম:</span>
                <div className="font-semibold text-navy">
                  {complaint.complainantName}
                </div>
              </div>
              {complaint.workerId && (
                <div>
                  <span className="text-muted-foreground">শ্রমিক আইডি:</span>
                  <div className="font-semibold text-navy">
                    {complaint.workerId}
                  </div>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">মোবাইল:</span>
                <div className="font-semibold text-navy">
                  {complaint.mobile}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">কোম্পানি:</span>
                <div className="font-semibold text-navy">
                  {complaint.companyName}
                </div>
              </div>
              <div className="sm:col-span-2">
                <span className="text-muted-foreground">কর্মস্থলের ঠিকানা:</span>
                <div className="font-semibold text-navy">
                  {complaint.workAddress}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">অভিযোগের ধরন:</span>
                <div className="font-semibold text-navy">
                  {COMPLAINT_TYPE_LABELS[complaint.complaintType] ??
                    complaint.complaintType}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">অগ্রাধিকার:</span>
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
                    {PRIORITY_LABELS[complaint.priority]}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">ঘটনার তারিখ:</span>
                <div className="font-semibold text-navy">
                  {complaint.incidentDate}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">জমাদানের তারিখ:</span>
                <div className="font-semibold text-navy">
                  {new Date(
                    Number(complaint.createdAt / 1000000n),
                  ).toLocaleDateString("bn-BD")}
                </div>
              </div>
              <div className="sm:col-span-2">
                <span className="text-muted-foreground">বিস্তারিত অভিযোগ:</span>
                <div className="bg-gray-50 rounded-lg p-3 mt-1 text-navy">
                  {complaint.details}
                </div>
              </div>
              {complaint.statusDescription && (
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground">
                    অবস্থার বর্ণনা (সর্বশেষ):
                  </span>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-1 text-blue-900 font-medium">
                    {complaint.statusDescription}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <h2 className="font-bold text-navy mb-5 text-base">
              অভিযোগের প্রগতি
            </h2>
            <StatusTimeline status={complaint.status} />
          </CardContent>
        </Card>

        {/* Status Update with Description */}
        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <h2 className="font-bold text-navy mb-4 flex items-center gap-2 text-base">
              <AlertTriangle size={18} className="text-yellow-600" />
              স্ট্যাটাস আপডেট
            </h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <Select
                  value={newStatus}
                  onValueChange={(v) => setNewStatus(v as Status)}
                >
                  <SelectTrigger
                    className="flex-1"
                    data-ocid="complaint_detail.status.select"
                  >
                    <SelectValue placeholder="নতুন স্ট্যাটাস নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold mb-1.5 block text-gray-800">
                  📋 অবস্থার বর্ণনা (অভিযোগকারীকে দেখানো হবে)
                </Label>
                <Textarea
                  value={statusDescription}
                  onChange={(e) => setStatusDescription(e.target.value)}
                  placeholder="অভিযোগকারীকে জানানোর জন্য অবস্থার বর্ণনা লিখুন (যেমন: আপনার অভিযোগটি তদন্তাধীন রয়েছে)"
                  rows={3}
                  data-ocid="complaint_detail.status_description.textarea"
                />
              </div>
              <Button
                onClick={() => statusMutation.mutate()}
                disabled={statusMutation.isPending || !newStatus}
                className="bg-navy text-white"
                data-ocid="complaint_detail.status_update.button"
              >
                {statusMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "স্ট্যাটাস আপডেট করুন"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Officer Assignment */}
        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <h2 className="font-bold text-navy mb-4 flex items-center gap-2 text-base">
              <UserCheck size={18} className="text-green-primary" />
              কর্মকর্তা নিয়োগ
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-sm font-semibold mb-1.5 block">
                  কর্মকর্তার নাম
                </Label>
                <Input
                  value={officer}
                  onChange={(e) => setOfficer(e.target.value)}
                  placeholder="দায়িত্বপ্রাপ্ত কর্মকর্তার নাম"
                  data-ocid="complaint_detail.officer.input"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-1.5 block">
                  বিভাগ
                </Label>
                <Input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="বিভাগের নাম"
                  data-ocid="complaint_detail.department.input"
                />
              </div>
            </div>
            <Button
              onClick={() => officerMutation.mutate()}
              disabled={officerMutation.isPending || !officer}
              className="bg-green-primary text-white"
              data-ocid="complaint_detail.assign_officer.button"
            >
              {officerMutation.isPending ? (
                <Loader2 size={16} className="animate-spin mr-1" />
              ) : (
                <UserCheck size={16} className="mr-1" />
              )}
              নিয়োগ দিন
            </Button>
          </CardContent>
        </Card>

        {/* Remarks */}
        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <h2 className="font-bold text-navy mb-4 flex items-center gap-2 text-base">
              <MessageSquare size={18} className="text-blue-600" />
              কর্মকর্তার মন্তব্য
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold mb-1.5 block">
                  মন্তব্য
                </Label>
                <Textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="কর্মকর্তার মন্তব্য"
                  rows={3}
                  data-ocid="complaint_detail.remarks.textarea"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-1.5 block">
                  পরবর্তী ধাপ
                </Label>
                <Input
                  value={nextStep}
                  onChange={(e) => setNextStep(e.target.value)}
                  placeholder="পরবর্তী পদক্ষেপ"
                  data-ocid="complaint_detail.next_step.input"
                />
              </div>
              <Button
                onClick={() => remarksMutation.mutate()}
                disabled={remarksMutation.isPending || !remarks}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                data-ocid="complaint_detail.save_remarks.button"
              >
                {remarksMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin mr-1" />
                ) : (
                  <Save size={16} className="mr-1" />
                )}
                মন্তব্য সংরক্ষণ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          if (!open) setShowDeleteDialog(false);
        }}
      >
        <DialogContent
          className="max-w-sm"
          data-ocid="complaint_detail.delete.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-red-700 flex items-center gap-2">
              <Trash2 size={18} />
              অভিযোগ মুছে ফেলুন
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-gray-700">
              অভিযোগ নম্বর{" "}
              <span className="font-bold font-mono text-navy">
                {complaintNumber}
              </span>{" "}
              স্থায়ীভাবে মুছে ফেলা হবে। এই কাজ পূর্বাবস্থায় ফেরানো যাবে না।
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              data-ocid="complaint_detail.delete.cancel_button"
            >
              বাতিল
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              data-ocid="complaint_detail.delete.confirm_button"
            >
              {deleteMutation.isPending ? (
                <Loader2 size={16} className="animate-spin mr-1" />
              ) : (
                <Trash2 size={16} className="mr-1" />
              )}
              মুছে ফেলুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
