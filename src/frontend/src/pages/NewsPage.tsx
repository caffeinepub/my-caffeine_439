import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Newspaper, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useBlobUrl } from "../hooks/useImageUpload";
import { useNews } from "../hooks/useQueries";
import type { News } from "../types/extended";

function NewsImage({
  imageId,
  className,
}: {
  imageId: [] | [string] | undefined;
  className?: string;
}) {
  const id = imageId && imageId.length > 0 ? imageId[0] : null;
  const url = useBlobUrl(id);
  if (!url) return null;
  return (
    <img
      src={url}
      alt="news"
      className={className ?? "w-full h-48 object-cover rounded-xl"}
      loading="lazy"
    />
  );
}

export default function NewsPage() {
  const { data: newsList, isLoading } = useNews();
  const [selected, setSelected] = useState<News | null>(null);

  return (
    <div className="py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2 flex items-center gap-3">
            <Newspaper className="text-red-primary" size={28} />
            খবর ও আপডেট
          </h1>
          <p className="text-muted-foreground">
            সাম্প্রতিক খবর, ঘোষণা এবং গুরুত্বপূর্ণ আপডেট
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4" data-ocid="news.loading_state">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
        ) : !newsList || newsList.length === 0 ? (
          <Card className="shadow-card border-0" data-ocid="news.empty_state">
            <CardContent className="py-16 text-center">
              <Newspaper
                size={48}
                className="mx-auto mb-4 text-muted-foreground/30"
              />
              <p className="text-muted-foreground">এই মুহূর্তে কোনো খবর নেই</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {newsList.map((news, i) => (
              <motion.div
                key={`news-${news.title}-${i}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                data-ocid={`news.item.${i + 1}`}
              >
                <Card
                  className="shadow-card border-0 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-red-primary"
                  onClick={() => setSelected(news)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {news.isBreaking && (
                            <Badge className="bg-red-600 text-white text-xs font-bold animate-pulse">
                              🔴 ব্রেকিং
                            </Badge>
                          )}
                          <h3 className="font-bold text-navy text-sm leading-tight">
                            {news.title}
                          </h3>
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                          {news.content}
                        </p>
                        {news.imageId && news.imageId.length > 0 && (
                          <NewsImage
                            imageId={news.imageId}
                            className="w-full h-48 object-cover rounded-xl mt-2"
                          />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                        {new Date(
                          Number(news.createdAt / 1000000n),
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

      {/* News Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent
          className="max-w-lg max-h-[85vh] overflow-y-auto"
          data-ocid="news.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-navy text-lg pr-8">
              {selected?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selected?.isBreaking && (
              <Badge className="bg-red-600 text-white font-bold animate-pulse">
                🔴 ব্রেকিং নিউজ
              </Badge>
            )}
            {selected?.imageId && selected.imageId.length > 0 && (
              <NewsImage
                imageId={selected.imageId}
                className="w-full h-56 object-cover rounded-xl"
              />
            )}
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
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
            data-ocid="news.close_button"
          >
            <X size={18} />
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
