import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Newspaper,
  Search,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useBlobUrl } from "../hooks/useImageUpload";
import { useComplaintStats, useNews, useNotices } from "../hooks/useQueries";
import type { News } from "../types/extended";

const COMPLAINT_TYPES = [
  {
    icon: "💰",
    label: "বেতন সমস্যা",
    bg: "bg-emerald-50",
    value: "salary",
    textColor: "text-emerald-800",
  },
  {
    icon: "❌",
    label: "চাকরিচ্যুতি",
    bg: "bg-rose-50",
    value: "termination",
    textColor: "text-rose-800",
  },
  {
    icon: "📅",
    label: "ছুটি/অবকাশ",
    bg: "bg-sky-50",
    value: "leave",
    textColor: "text-sky-800",
  },
  {
    icon: "⚠️",
    label: "নিরাপত্তা সমস্যা",
    bg: "bg-amber-50",
    value: "safety",
    textColor: "text-amber-800",
  },
  {
    icon: "🚫",
    label: "কর্মক্ষেত্রে হয়রানি",
    bg: "bg-pink-50",
    value: "harassment",
    textColor: "text-pink-800",
  },
  {
    icon: "⏰",
    label: "ওভারটাইম সমস্যা",
    bg: "bg-orange-50",
    value: "overtime",
    textColor: "text-orange-800",
  },
  {
    icon: "📄",
    label: "চুক্তি/নিয়োগ সমস্যা",
    bg: "bg-indigo-50",
    value: "contract",
    textColor: "text-indigo-800",
  },
  {
    icon: "📋",
    label: "অন্যান্য",
    bg: "bg-teal-50",
    value: "other",
    textColor: "text-teal-800",
  },
];

const HOW_IT_WORKS = [
  { step: 1, icon: "📝", title: "অভিযোগ জমা দিন", desc: "অনলাইন ফর্ম পূরণ করুন" },
  {
    step: 2,
    icon: "🔢",
    title: "অভিযোগ নম্বর সংগ্রহ",
    desc: "অনন্য নম্বর সংরক্ষণ করুন",
  },
  { step: 3, icon: "🔍", title: "অভিযোগ ট্র্যাক করুন", desc: "রেলটাইম অবস্থা দেখুন" },
  { step: 4, icon: "✅", title: "আপডেট ও সমাধান", desc: "সমাধানের বিজ্ঞপ্তি পান" },
];

function NewsCardImage({ imageId }: { imageId: [] | [string] | undefined }) {
  const id = imageId && imageId.length > 0 ? imageId[0] : null;
  const url = useBlobUrl(id);
  if (!url) return null;
  return (
    <img
      src={url}
      alt="news"
      className="w-full h-36 object-cover rounded-lg mb-2"
      loading="lazy"
    />
  );
}

export default function HomePage() {
  const [searchId, setSearchId] = useState("");
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useComplaintStats();
  const { data: notices, isLoading: noticesLoading } = useNotices();
  const { data: newsList, isLoading: newsLoading } = useNews();

  const handleSearch = () => {
    if (searchId.trim()) {
      navigate({ to: "/complaint/track", search: { id: searchId.trim() } });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const formatBigInt = (val?: bigint) =>
    val !== undefined ? Number(val).toLocaleString("bn-BD") : "০";

  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative min-h-[420px] flex items-center justify-center"
        style={{
          backgroundImage: `url('/assets/generated/hero-workers.dim_1400x600.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-navy/80" />
        <div className="relative z-10 text-center px-4 py-16 max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-red-500 leading-tight mb-4 drop-shadow-lg"
          >
            শ্রমিক অভিযোগ ও ট্র্যাকিং সিস্টেম
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-black font-bold bg-white/70 px-4 py-2 rounded-lg inline-block text-base sm:text-lg mb-8 leading-relaxed"
          >
            অনলাইনে অভিযোগ করুন এবং অভিযোগ নম্বর দিয়ে বর্তমান অবস্থা জানুন
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/complaint/submit"
              className="inline-flex items-center justify-center gap-2 bg-red-600 text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-red-700 transition-colors shadow-lg"
              data-ocid="hero.complaint.primary_button"
            >
              অভিযোগ করুন
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/complaint/track"
              className="inline-flex items-center justify-center gap-2 bg-green-600 border-2 border-green-400 text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-green-700 transition-all"
              data-ocid="hero.track.secondary_button"
            >
              অবস্থা দেখুন
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Quick Search Box */}
      <section className="bg-white py-0">
        <div className="max-w-3xl mx-auto px-4 -mt-8 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="shadow-card border-0">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <Search size={20} className="text-green-700" />
                  অভিযোগের আইডি দিয়ে ট্র্যাক করুন
                </h2>
                <div className="flex gap-3">
                  <Input
                    placeholder="অভিযোগ নম্বর লিখুন (e.g. BC-2026-0001)"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 text-sm h-12 text-gray-900 placeholder:text-gray-400"
                    data-ocid="homepage.search_input"
                  />
                  <Button
                    onClick={handleSearch}
                    className="bg-navy text-white h-12 px-6 font-semibold hover:bg-navy/90"
                    data-ocid="homepage.search.button"
                  >
                    অনুসন্ধান
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 px-4 bg-page-bg">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">
            অভিযোগের সংক্ষিপ্ত পরিসংখ্যান
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statsLoading
              ? [1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
                ))
              : [
                  {
                    icon: "📊",
                    label: "মোট অভিযোগ",
                    value: formatBigInt(stats?.total),
                    bg: "bg-blue-100",
                    color: "text-blue-800",
                    labelColor: "text-blue-700",
                    border: "border-l-4 border-l-blue-600",
                  },
                  {
                    icon: "⏳",
                    label: "চলমান",
                    value: formatBigInt(stats?.pending),
                    bg: "bg-amber-100",
                    color: "text-amber-800",
                    labelColor: "text-amber-700",
                    border: "border-l-4 border-l-amber-500",
                  },
                  {
                    icon: "✅",
                    label: "নিষ্পত্তিকৃত",
                    value: formatBigInt(stats?.resolved),
                    bg: "bg-green-100",
                    color: "text-green-800",
                    labelColor: "text-green-700",
                    border: "border-l-4 border-l-green-600",
                  },
                  {
                    icon: "🚨",
                    label: "জরুরি",
                    value: formatBigInt(stats?.urgent),
                    bg: "bg-red-100",
                    color: "text-red-800",
                    labelColor: "text-red-700",
                    border: "border-l-4 border-l-red-600",
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    <Card
                      className={`shadow-card border-0 h-full ${stat.border}`}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center text-2xl flex-shrink-0`}
                          >
                            {stat.icon}
                          </div>
                          <div>
                            <div className={`text-2xl font-bold ${stat.color}`}>
                              {stat.value}
                            </div>
                            <div
                              className={`text-xs font-semibold ${stat.labelColor}`}
                            >
                              {stat.label}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
          </div>
        </div>
      </section>

      {/* Complaint Types */}
      <section className="py-10 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-red-700 mb-2 text-center">
            অভিযোগের ধরন
          </h2>
          <p className="text-center text-gray-600 mb-6 text-sm">
            আপনার সমস্যার ধরন বেছে নিন
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {COMPLAINT_TYPES.map((type, i) => (
              <motion.div
                key={type.value}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link
                  to="/complaint/submit"
                  search={{ type: type.value }}
                  className="block"
                  data-ocid={`complaint_type.${type.value}.button`}
                >
                  <Card className="shadow-card border-0 hover:shadow-lg transition-shadow cursor-pointer group h-full">
                    <CardContent className="p-5 text-center">
                      <div
                        className={`w-14 h-14 ${type.bg} rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 group-hover:scale-110 transition-transform`}
                      >
                        {type.icon}
                      </div>
                      <div
                        className={`font-bold text-sm ${type.textColor} leading-tight`}
                      >
                        {type.label}
                      </div>
                      <div className="text-xs text-green-700 mt-1 font-semibold">
                        বিস্তারিত &gt;
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Notices */}
      <section className="py-10 px-4 bg-page-bg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-green-800 flex items-center gap-2">
              <Bell size={22} className="text-green-700" />
              সাম্প্রতিক নোটিশ ও আপডেট
            </h2>
            <Link
              to="/notices"
              className="text-green-700 text-sm font-bold hover:underline"
              data-ocid="homepage.notices.link"
            >
              সব দেখুন →
            </Link>
          </div>
          {noticesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : !notices || notices.length === 0 ? (
            <Card className="shadow-card border-0">
              <CardContent className="py-10 text-center text-gray-500">
                <Bell size={36} className="mx-auto mb-3 opacity-30" />
                এই মুহূর্তে কোনো নোটিশ নেই
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notices.slice(0, 3).map((notice, i) => (
                <Card
                  key={`notice-home-${notice.title}-${i}`}
                  className="shadow-card border-0 border-l-4 border-l-green-600"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {notice.isImportant && (
                            <Badge className="bg-red-600 text-white text-xs py-0">
                              গুরুত্বপূর্ণ
                            </Badge>
                          )}
                          <span className="font-bold text-red-700 text-sm">
                            {notice.title}
                          </span>
                        </div>
                        <p className="text-gray-700 text-xs leading-relaxed line-clamp-2">
                          {notice.content}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap font-medium">
                        {new Date(
                          Number(notice.createdAt / 1000000n),
                        ).toLocaleDateString("bn-BD")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent News Section */}
      <section className="py-10 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-red-700 flex items-center gap-2">
              <Newspaper size={22} className="text-red-600" />
              সাম্প্রতিক খবর ও আপডেট
            </h2>
            <Link
              to="/news"
              className="text-red-600 text-sm font-bold hover:underline"
              data-ocid="homepage.news.link"
            >
              সব দেখুন →
            </Link>
          </div>
          {newsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : !newsList || newsList.length === 0 ? (
            <Card className="shadow-card border-0">
              <CardContent className="py-10 text-center text-gray-500">
                <Newspaper size={36} className="mx-auto mb-3 opacity-30" />
                এই মুহূর্তে কোনো খবর নেই
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {newsList.slice(0, 3).map((news: News, i) => (
                <motion.div
                  key={`news-home-${news.title}-${i}`}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Card className="shadow-card border-0 border-t-4 border-t-red-600 h-full">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {news.isBreaking && (
                          <Badge className="bg-red-600 text-white text-xs font-bold">
                            🔴 ব্রেকিং
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(
                            Number(news.createdAt / 1000000n),
                          ).toLocaleDateString("bn-BD")}
                        </span>
                      </div>
                      {news.imageId && news.imageId.length > 0 && (
                        <NewsCardImage imageId={news.imageId} />
                      )}
                      <h3 className="font-bold text-navy text-sm mb-1 leading-tight">
                        {news.title}
                      </h3>
                      <p className="text-gray-600 text-xs line-clamp-2">
                        {news.content}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 px-4 bg-page-bg">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-blue-900 mb-2 text-center">
            কিভাবে কাজ করে?
          </h2>
          <p className="text-center text-gray-600 mb-10 text-sm">
            মাত্র ৪টি ধাপে আপনার অভিযোগ করুন
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card className="shadow-card border-0 text-center h-full border-t-4 border-t-green-600">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-3xl mx-auto mb-4">
                      {step.icon}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-green-600 text-white text-sm font-bold flex items-center justify-center mx-auto -mt-2 mb-3 shadow">
                      {step.step}
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-xs">{step.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-red-700 mb-8 text-center">
            সহায়তা পান
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-card border-0 border-l-4 border-l-red-600">
              <CardContent className="p-5">
                <div className="text-2xl mb-2">📞</div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">হটলাইন</h3>
                <p className="text-green-700 font-bold text-lg">
                  <a href="tel:01403163378">০১৪০৩-১৬৩৩৭৮</a>
                </p>
                <p className="text-xs text-gray-600">
                  রবি-শনি সকাল ৯টা – বিকাল ৫টা
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-card border-0 border-l-4 border-l-green-600">
              <CardContent className="p-5">
                <div className="text-2xl mb-2">💬</div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">
                  হোয়াটসঅ্যাপ
                </h3>
                <p className="text-green-700 font-bold text-lg">
                  <a
                    href="https://wa.me/8801403163378"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    +৮৮০১৪০৩-১৬৩৩৭৮
                  </a>
                </p>
                <p className="text-xs text-gray-600">সবসময় বার্তা পাঠান</p>
              </CardContent>
            </Card>
            <Card className="shadow-card border-0 border-l-4 border-l-blue-600">
              <CardContent className="p-5">
                <div className="text-2xl mb-2">📍</div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">
                  অফিসের ঠিকানা
                </h3>
                <p className="text-sm text-gray-700">
                  ১১০৪ রোজভিউ প্লাজা, ১৮৫ বীর উত্তম সি আর দত্ত রোড, হাতিরপুল, ঢাকা-১২০৫
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  রবি-বৃহঃ, সকাল ৯টা – বিকাল ৫টা
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-card border-0 border-l-4 border-l-amber-500">
              <CardContent className="p-5">
                <div className="text-2xl mb-2">❓</div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">
                  সাধারণ জিজ্ঞাসা
                </h3>
                <p className="text-xs text-gray-600 mb-2">
                  স্বাভাবিক প্রশ্নের উত্তর পান
                </p>
                <Link
                  to="/faq"
                  className="text-green-700 text-xs font-bold hover:underline"
                  data-ocid="homepage.faq.link"
                >
                  FAQ দেখুন &rarr;
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Privacy notice */}
      <section className="py-6 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-green-50 border border-green-300 rounded-xl p-4 text-center">
            <CheckCircle2 size={20} className="text-green-700 inline mr-2" />
            <span className="text-sm text-green-900 font-semibold">
              আপনার অভিযোগের তথ্য সম্পূর্ণ গোপনীয় রাখা হয়। আপনার ব্যক্তিগত তথ্য কাউকে দেওয়া
              হবে না।
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
