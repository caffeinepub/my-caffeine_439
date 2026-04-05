import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Eye,
  ImageIcon,
  Loader2,
  LogOut,
  Newspaper,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Priority, Status } from "../backend";
import StatusBadge, { STATUS_LABELS } from "../components/StatusBadge";
import { useActor } from "../hooks/useActor";
import { useImageUpload } from "../hooks/useImageUpload";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllComplaints,
  useComplaintStats,
  useIsAdmin,
} from "../hooks/useQueries";
import { isPasswordAdmin } from "./AdminLoginPage";

const ADMIN_SESSION_KEY = "bgws_admin_session";

const PRIORITY_LABELS: Record<string, string> = {
  normal: "সাধারণ",
  urgent: "জরুরি",
  veryUrgent: "অতি জরুরি",
};

const PRIORITY_COLORS: Record<string, string> = {
  normal: "bg-gray-100 text-gray-600",
  urgent: "bg-yellow-100 text-yellow-700",
  veryUrgent: "bg-red-100 text-red-700",
};

const COMPLAINT_TYPE_LABELS: Record<string, string> = {
  salary: "বেতন",
  termination: "চাকরিচ্যুতি",
  leave: "ছুটি",
  safety: "নিরাপত্তা",
  harassment: "হয়রানি",
  overtime: "ওভারটাইম",
  contract: "চুক্তি",
  other: "অন্যান্য",
};

interface NoticeFormState {
  title: string;
  content: string;
  isImportant: boolean;
  imageId: string | null;
}

interface NewsFormState {
  title: string;
  content: string;
  isBreaking: boolean;
  imageId: string | null;
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { clear, identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminChecking } = useIsAdmin();
  const { data: complaints, isLoading } = useAllComplaints();
  const { data: stats } = useComplaintStats();
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterType, setFilterType] = useState("all");

  // Notice modal state
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeForm, setNoticeForm] = useState<NoticeFormState>({
    title: "",
    content: "",
    isImportant: false,
    imageId: null,
  });
  const [noticeImagePreview, setNoticeImagePreview] = useState<string | null>(
    null,
  );
  const noticeFileRef = useRef<HTMLInputElement>(null);

  // News modal state
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [newsForm, setNewsForm] = useState<NewsFormState>({
    title: "",
    content: "",
    isBreaking: false,
    imageId: null,
  });
  const [newsImagePreview, setNewsImagePreview] = useState<string | null>(null);
  const newsFileRef = useRef<HTMLInputElement>(null);

  const { upload: uploadImage, uploading: uploadingImage } = useImageUpload();

  // Check both password session and internet identity
  const hasPasswordSession = isPasswordAdmin();

  useEffect(() => {
    if (!hasPasswordSession && !identity) {
      navigate({ to: "/admin/login" });
    }
  }, [identity, navigate, hasPasswordSession]);

  useEffect(() => {
    if (!hasPasswordSession && !adminChecking && isAdmin === false) {
      navigate({ to: "/admin/login" });
    }
  }, [isAdmin, adminChecking, navigate, hasPasswordSession]);

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    clear();
    navigate({ to: "/admin/login" });
  };

  // Notice image upload handler
  const handleNoticeImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setNoticeImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    try {
      const blobId = await uploadImage(file);
      setNoticeForm((p) => ({ ...p, imageId: blobId }));
      toast.success("ছবি আপলোড হয়েছে");
    } catch {
      toast.error("ছবি আপলোড ব্যর্থ হয়েছে");
      setNoticeImagePreview(null);
    }
  };

  // News image upload handler
  const handleNewsImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setNewsImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    try {
      const blobId = await uploadImage(file);
      setNewsForm((p) => ({ ...p, imageId: blobId }));
      toast.success("ছবি আপলোড হয়েছে");
    } catch {
      toast.error("ছবি আপলোড ব্যর্থ হয়েছে");
      setNewsImagePreview(null);
    }
  };

  const resetNoticeModal = () => {
    setShowNoticeModal(false);
    setNoticeForm({
      title: "",
      content: "",
      isImportant: false,
      imageId: null,
    });
    setNoticeImagePreview(null);
    if (noticeFileRef.current) noticeFileRef.current.value = "";
  };

  const resetNewsModal = () => {
    setShowNewsModal(false);
    setNewsForm({ title: "", content: "", isBreaking: false, imageId: null });
    setNewsImagePreview(null);
    if (newsFileRef.current) newsFileRef.current.value = "";
  };

  const ADMIN_PASSWORD = "@dminBGWS2001";

  const addNoticeMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      const noticeInput = {
        title: noticeForm.title,
        content: noticeForm.content,
        isImportant: noticeForm.isImportant,
        imageId: noticeForm.imageId
          ? ([noticeForm.imageId] as [string])
          : ([] as []),
      };
      if (hasPasswordSession) {
        await actor.addNoticeWithPassword(ADMIN_PASSWORD, noticeInput);
      } else {
        await actor.addNotice(noticeInput);
      }
    },
    onSuccess: () => {
      toast.success("নোটিশ যোগ দেওয়া হয়েছে");
      resetNoticeModal();
      queryClient.invalidateQueries({ queryKey: ["notices"] });
    },
    onError: () => toast.error("নোটিশ যোগ দেওয়া সম্ভব হয়নি"),
  });

  const addNewsMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      const newsInput = {
        title: newsForm.title,
        content: newsForm.content,
        isBreaking: newsForm.isBreaking,
        imageId: newsForm.imageId
          ? ([newsForm.imageId] as [string])
          : ([] as []),
      };
      const actorAnyNews = actor as any;
      if (hasPasswordSession) {
        await actorAnyNews.addNewsWithPassword(ADMIN_PASSWORD, newsInput);
      } else {
        await actorAnyNews.addNews(newsInput);
      }
    },
    onSuccess: () => {
      toast.success("খবর প্রকাশিত হয়েছে");
      resetNewsModal();
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
    onError: () => toast.error("খবর প্রকাশ সম্ভব হয়নি"),
  });

  const filtered = useMemo(() => {
    if (!complaints) return [];
    return complaints.filter((c) => {
      const matchQuery =
        !searchQuery ||
        c.complainantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.complaintNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === "all" || c.status === filterStatus;
      const matchPriority =
        filterPriority === "all" || c.priority === filterPriority;
      const matchType = filterType === "all" || c.complaintType === filterType;
      return matchQuery && matchStatus && matchPriority && matchType;
    });
  }, [complaints, searchQuery, filterStatus, filterPriority, filterType]);

  if (!hasPasswordSession && (adminChecking || !identity)) {
    return (
      <div
        className="min-h-screen bg-page-bg flex items-center justify-center"
        data-ocid="admin_dashboard.loading_state"
      >
        <Loader2 size={40} className="animate-spin text-green-primary" />
      </div>
    );
  }

  if (!hasPasswordSession && !isAdmin) return null;

  const formatBigInt = (val?: bigint) =>
    val !== undefined ? Number(val).toLocaleString("bn-BD") : "০";

  return (
    <div className="min-h-screen bg-page-bg">
      {/* Admin Header */}
      <header className="bg-navy text-white px-4 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">অ্যাডমিন ড্যাশবোর্ড</h1>
            <p className="text-white/60 text-xs">বাংলাদেশ গার্মেন্ট শ্রমিক সংহতি</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowNoticeModal(true)}
              size="sm"
              className="bg-green-primary text-white hover:bg-green-primary/90 text-xs"
              data-ocid="admin_dashboard.add_notice.button"
            >
              <Plus size={14} className="mr-1" />
              নোটিশ
            </Button>
            <Button
              onClick={() => setShowNewsModal(true)}
              size="sm"
              className="bg-red-primary text-white hover:bg-red-primary/90 text-xs"
              data-ocid="admin_dashboard.add_news.button"
            >
              <Newspaper size={14} className="mr-1" />
              খবর প্রকাশ
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/10 text-xs"
              data-ocid="admin_dashboard.logout.button"
            >
              <LogOut size={14} className="mr-1" />
              লগআউট
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            {
              label: "মোট অভিযোগ",
              value: formatBigInt(stats?.total),
              color: "text-blue-700",
              bg: "bg-blue-50",
            },
            {
              label: "অপেক্ষমান",
              value: formatBigInt(stats?.pending),
              color: "text-yellow-700",
              bg: "bg-yellow-50",
            },
            {
              label: "পর্যালোচনাধীন",
              value: complaints
                ? complaints
                    .filter((c) => c.status === Status.underReview)
                    .length.toLocaleString("bn-BD")
                : "০",
              color: "text-purple-700",
              bg: "bg-purple-50",
            },
            {
              label: "নিষ্পত্তিকৃত",
              value: formatBigInt(stats?.resolved),
              color: "text-green-700",
              bg: "bg-green-50",
            },
            {
              label: "জরুরি",
              value: formatBigInt(stats?.urgent),
              color: "text-red-700",
              bg: "bg-red-50",
            },
          ].map((s) => (
            <Card key={s.label} className="shadow-card border-0">
              <CardContent className="p-4">
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="shadow-card border-0 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="নাম, কোম্পানি, নম্বর..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10"
                  data-ocid="admin_dashboard.search_input"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger
                  className="w-[150px] h-10"
                  data-ocid="admin_dashboard.status_filter.select"
                >
                  <SelectValue placeholder="স্ট্যাটাস" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger
                  className="w-[130px] h-10"
                  data-ocid="admin_dashboard.priority_filter.select"
                >
                  <SelectValue placeholder="অগ্রাধিকার" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব</SelectItem>
                  {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger
                  className="w-[140px] h-10"
                  data-ocid="admin_dashboard.type_filter.select"
                >
                  <SelectValue placeholder="ধরন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব ধরন</SelectItem>
                  {Object.entries(COMPLAINT_TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Complaints Table */}
        <Card className="shadow-card border-0">
          <CardContent className="p-0">
            {isLoading ? (
              <div
                className="p-6 space-y-3"
                data-ocid="admin_dashboard.loading_state"
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-14 rounded" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div
                className="py-16 text-center"
                data-ocid="admin_dashboard.empty_state"
              >
                <AlertCircle
                  size={40}
                  className="mx-auto mb-3 text-muted-foreground/30"
                />
                <p className="text-muted-foreground">কোনো অভিযোগ পাওয়া যায়নি</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table
                  className="w-full text-sm"
                  data-ocid="admin_dashboard.table"
                >
                  <thead>
                    <tr className="border-b border-border bg-gray-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                        নম্বর
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                        নাম
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                        ধরন
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">
                        অগ্রাধিকার
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                        স্ট্যাটাস
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                        তারিখ
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">
                        কার্যক্রম
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c, i) => (
                      <tr
                        key={c.complaintNumber}
                        className="border-b border-border hover:bg-gray-50 transition-colors"
                        data-ocid={`admin_dashboard.row.${i + 1}`}
                      >
                        <td className="px-4 py-3 font-mono text-xs text-navy font-semibold">
                          {c.complaintNumber}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-navy text-xs">
                            {c.complainantName}
                          </div>
                          <div className="text-muted-foreground text-xs truncate max-w-[120px]">
                            {c.companyName}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-xs text-muted-foreground">
                            {COMPLAINT_TYPE_LABELS[c.complaintType] ??
                              c.complaintType}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <Badge
                            variant="outline"
                            className={`text-xs ${PRIORITY_COLORS[c.priority] ?? ""}`}
                          >
                            {PRIORITY_LABELS[c.priority] ?? c.priority}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={c.status} size="sm" />
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                          {new Date(
                            Number(c.createdAt / 1000000n),
                          ).toLocaleDateString("bn-BD")}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            to="/admin/complaint/$complaintNumber"
                            params={{ complaintNumber: c.complaintNumber }}
                            data-ocid={`admin_dashboard.view_complaint.${i + 1}.button`}
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs"
                            >
                              <Eye size={13} className="mr-1" />
                              দেখুন
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Notice Modal */}
      <Dialog
        open={showNoticeModal}
        onOpenChange={(open) => {
          if (!open) resetNoticeModal();
          else setShowNoticeModal(true);
        }}
      >
        <DialogContent
          className="max-w-lg"
          data-ocid="admin_dashboard.notice.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-navy">নতুন নোটিশ যোগ দিন</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold mb-1.5 block">
                শিরোনাম *
              </Label>
              <Input
                value={noticeForm.title}
                onChange={(e) =>
                  setNoticeForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="নোটিশের শিরোনাম"
                data-ocid="admin_dashboard.notice_title.input"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold mb-1.5 block">
                বিষয় *
              </Label>
              <Textarea
                value={noticeForm.content}
                onChange={(e) =>
                  setNoticeForm((p) => ({ ...p, content: e.target.value }))
                }
                placeholder="নোটিশের বিস্তারিত বিষয়"
                rows={4}
                data-ocid="admin_dashboard.notice_content.textarea"
              />
            </div>
            {/* Image Upload - using button for accessibility */}
            <div>
              <Label className="text-sm font-semibold mb-1.5 block">
                ফটো (ঐচ্ছিক)
              </Label>
              <button
                type="button"
                className="w-full border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-green-primary/50 transition-colors text-left"
                onClick={() => noticeFileRef.current?.click()}
                data-ocid="admin_dashboard.notice_image.dropzone"
              >
                {noticeImagePreview ? (
                  <div className="relative">
                    <img
                      src={noticeImagePreview}
                      alt="preview"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNoticeImagePreview(null);
                        setNoticeForm((p) => ({ ...p, imageId: null }));
                        if (noticeFileRef.current)
                          noticeFileRef.current.value = "";
                      }}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                      aria-label="ছবি সরান"
                    >
                      <X size={14} />
                    </button>
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg">
                        <Loader2
                          size={24}
                          className="animate-spin text-green-primary"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground">
                    {uploadingImage ? (
                      <Loader2
                        size={24}
                        className="animate-spin text-green-primary"
                      />
                    ) : (
                      <ImageIcon size={24} className="text-gray-400" />
                    )}
                    <span className="text-xs">
                      {uploadingImage ? "আপলোড হচ্ছে..." : "ছবি বেছে নিন"}
                    </span>
                  </div>
                )}
              </button>
              <input
                ref={noticeFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleNoticeImageChange}
                aria-label="নোটিশ ছবি আপলোড"
                data-ocid="admin_dashboard.notice_image.upload_button"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="isImportant"
                checked={noticeForm.isImportant}
                onCheckedChange={(v) =>
                  setNoticeForm((p) => ({ ...p, isImportant: !!v }))
                }
                data-ocid="admin_dashboard.notice_important.checkbox"
              />
              <label htmlFor="isImportant" className="text-sm">
                গুরুত্বপূর্ণ নোটিশ হিসেবে চিহ্নিত করুন
              </label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={resetNoticeModal}
              data-ocid="admin_dashboard.notice.cancel_button"
            >
              বাতিল
            </Button>
            <Button
              onClick={() => addNoticeMutation.mutate()}
              disabled={
                addNoticeMutation.isPending ||
                uploadingImage ||
                !noticeForm.title ||
                !noticeForm.content
              }
              className="bg-green-primary text-white"
              data-ocid="admin_dashboard.notice.confirm_button"
            >
              {addNoticeMutation.isPending ? (
                <Loader2 size={16} className="animate-spin mr-1" />
              ) : null}
              যোগ দিন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add News Modal */}
      <Dialog
        open={showNewsModal}
        onOpenChange={(open) => {
          if (!open) resetNewsModal();
          else setShowNewsModal(true);
        }}
      >
        <DialogContent
          className="max-w-lg"
          data-ocid="admin_dashboard.news.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-navy flex items-center gap-2">
              <Newspaper size={18} />
              নতুন খবর প্রকাশ করুন
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold mb-1.5 block">
                শিরোনাম *
              </Label>
              <Input
                value={newsForm.title}
                onChange={(e) =>
                  setNewsForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="খবরের শিরোনাম"
                data-ocid="admin_dashboard.news_title.input"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold mb-1.5 block">
                বিষয়বস্তু *
              </Label>
              <Textarea
                value={newsForm.content}
                onChange={(e) =>
                  setNewsForm((p) => ({ ...p, content: e.target.value }))
                }
                placeholder="খবরের বিস্তারিত বিষয়"
                rows={5}
                data-ocid="admin_dashboard.news_content.textarea"
              />
            </div>
            {/* News Image Upload - using button for accessibility */}
            <div>
              <Label className="text-sm font-semibold mb-1.5 block">
                ফটো (ঐচ্ছিক)
              </Label>
              <button
                type="button"
                className="w-full border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-red-primary/50 transition-colors text-left"
                onClick={() => newsFileRef.current?.click()}
                data-ocid="admin_dashboard.news_image.dropzone"
              >
                {newsImagePreview ? (
                  <div className="relative">
                    <img
                      src={newsImagePreview}
                      alt="preview"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewsImagePreview(null);
                        setNewsForm((p) => ({ ...p, imageId: null }));
                        if (newsFileRef.current) newsFileRef.current.value = "";
                      }}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                      aria-label="ছবি সরান"
                    >
                      <X size={14} />
                    </button>
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg">
                        <Loader2
                          size={24}
                          className="animate-spin text-red-primary"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground">
                    {uploadingImage ? (
                      <Loader2
                        size={24}
                        className="animate-spin text-red-primary"
                      />
                    ) : (
                      <ImageIcon size={24} className="text-gray-400" />
                    )}
                    <span className="text-xs">
                      {uploadingImage ? "আপলোড হচ্ছে..." : "ছবি বেছে নিন"}
                    </span>
                  </div>
                )}
              </button>
              <input
                ref={newsFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleNewsImageChange}
                aria-label="খবর ছবি আপলোড"
                data-ocid="admin_dashboard.news_image.upload_button"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="isBreaking"
                checked={newsForm.isBreaking}
                onCheckedChange={(v) =>
                  setNewsForm((p) => ({ ...p, isBreaking: !!v }))
                }
                data-ocid="admin_dashboard.news_breaking.checkbox"
              />
              <label htmlFor="isBreaking" className="text-sm">
                ব্রেকিং নিউজ হিসেবে চিহ্নিত করুন
              </label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={resetNewsModal}
              data-ocid="admin_dashboard.news.cancel_button"
            >
              বাতিল
            </Button>
            <Button
              onClick={() => addNewsMutation.mutate()}
              disabled={
                addNewsMutation.isPending ||
                uploadingImage ||
                !newsForm.title ||
                !newsForm.content
              }
              className="bg-red-primary text-white"
              data-ocid="admin_dashboard.news.confirm_button"
            >
              {addNewsMutation.isPending ? (
                <Loader2 size={16} className="animate-spin mr-1" />
              ) : null}
              প্রকাশ করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
