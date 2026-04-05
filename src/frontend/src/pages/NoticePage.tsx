import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Loader2, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Notice } from "../backend";
import { useNotices } from "../hooks/useQueries";

export default function NoticePage() {
  const { data: notices, isLoading } = useNotices();
  const [selected, setSelected] = useState<Notice | null>(null);

  return (
    <div className="py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2 flex items-center gap-3">
            <Bell className="text-green-primary" size={28} />
            নোটিশ বোর্ড
          </h1>
          <p className="text-muted-foreground">
            গুরুত্বপূর্ণ বিজ্ঞপ্তি এবং সাম্প্রতিক আপডেট
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4" data-ocid="notices.loading_state">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : !notices || notices.length === 0 ? (
          <Card
            className="shadow-card border-0"
            data-ocid="notices.empty_state"
          >
            <CardContent className="py-16 text-center">
              <Bell
                size={48}
                className="mx-auto mb-4 text-muted-foreground/30"
              />
              <p className="text-muted-foreground">এই মুহূর্তে কোনো নোটিশ নেই</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notices.map((notice, i) => (
              <motion.div
                key={`notice-${notice.title}-${i}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                data-ocid={`notices.item.${i + 1}`}
              >
                <Card
                  className="shadow-card border-0 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelected(notice)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {notice.isImportant && (
                            <Badge className="bg-red-primary text-white text-xs">
                              গুরুত্বপূর্ণ
                            </Badge>
                          )}
                          <h3 className="font-bold text-navy text-sm">
                            {notice.title}
                          </h3>
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {notice.content}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(
                          Number(notice.createdAt / 1000000n),
                        ).toLocaleDateString("bn-BD")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Notice Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg" data-ocid="notices.dialog">
          <DialogHeader>
            <DialogTitle className="text-navy text-lg">
              {selected?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selected?.isImportant && (
              <Badge className="bg-red-primary text-white">গুরুত্বপূর্ণ</Badge>
            )}
            <p className="text-sm leading-relaxed text-foreground">
              {selected?.content}
            </p>
            {selected && (
              <p className="text-xs text-muted-foreground">
                প্রকাশিত:{" "}
                {new Date(
                  Number(selected.createdAt / 1000000n),
                ).toLocaleDateString("bn-BD")}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            data-ocid="notices.close_button"
          >
            <X size={18} />
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
