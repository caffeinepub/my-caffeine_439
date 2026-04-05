import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { HelpCircle } from "lucide-react";
import { motion } from "motion/react";

const FAQS = [
  {
    id: "faq-1",
    q: "অভিযোগ কিভাবে দাখিল করবো?",
    a: "আমাদের ঵েবসাইটে 'অভিযোগ করুন' পেজে গিয়ে ফর্মটি পূরণ করুন। আপনার নাম, মোবাইল নম্বর, কারখানার নাম এবং অভিযোগের বিস্তারিত বিবরণ দিন। ফর্ম জমা দেওয়ার পর আপনি একটি অনন্য অভিযোগ নম্বর পাবেন।",
  },
  {
    id: "faq-2",
    q: "অভিযোগ দাখিলের পর কোন তথ্য প্রয়োজন হবে?",
    a: "অভিযোগ দাখিলের পর আপনি একটি অভিযোগ নম্বর পাবেন। এই নম্বর সংরক্ষণ করুন। ভবিষ্যতে এই নম্বর দিয়ে অভিযোগের বর্তমান অবস্থা জানতে পারবেন।",
  },
  {
    id: "faq-3",
    q: "অভিযোগের অবস্থা কিভাবে ট্র্যাক করবো?",
    a: "'অবস্থা দেখুন' পেজে যান এবং আপনার অভিযোগ নম্বর লিখুন। সাথে সাথে অভিযোগের বর্তমান পরিস্থিতি দেখা যাবে।",
  },
  {
    id: "faq-4",
    q: "অভিযোগ দাখিলের জন্য কোন দলিল প্রয়োজন হবে?",
    a: "মূলত কোনো দলিল আবশ্যক নয়। তবে যদি বেতন সর্ন্ত্রকে বা হয়রানির প্রমাণ থাকে তাহলে ছবি, ভিডিও, বা অডিও ফাইল আপলোড করুন যা অভিযোগের শক্তিশালী প্রমাণ হিসেবে বিবেচিত হবে।",
  },
  {
    id: "faq-5",
    q: "অভিযোগ প্রস্তুত করতে কত সময় লাগে?",
    a: "সাধারণত অভিযোগ দাখিলের ৭ কার্যদিবসের মধ্যে প্রাথমিক যাচাই সম্পন্ন হয়। জটিল অভিযোগের জন্য অধিক সময় লাগতে পারে।",
  },
  {
    id: "faq-6",
    q: "আমার ব্যক্তিগত তথ্য কি সুরক্ষিত?",
    a: "হ্যাঁ, আপনার সব তথ্য সম্পূর্ণ গোপন আমাদের সিস্টেমে সংরক্ষিত থাকে। আপনার নাম, মোবাইল নম্বর বা অন্যান্য রেকর্ড কাউকে দেওয়া হারাম হবে।",
  },
  {
    id: "faq-7",
    q: "অভিযোগ না করে সরাসরি ফোন করতে পারর?",
    a: "অবশ্যই। আমাদের হটলাইন ০১৪০৩-১৬৩৩৭৮ তে ফোন করুন। রবিবার থেকে বৃহস্পতিবার সকাল ৯টা থেকে বিকাল ৫টা পর্যন্ত আমাদের দল প্রস্তুত থাকে।",
  },
  {
    id: "faq-8",
    q: "অভিযোগ প্রত্যাখ্যাত হলে কী করা যাবে?",
    a: "অভিযোগ প্রত্যাখ্যাত হলে আপনি আমাদের হটলাইনে যোগাযোগ করুন বা সরাসরি অফিসে আসুন। আমরা আপনার বিষয়টি পুনরায় মূল্যায়ন করব।",
  },
  {
    id: "faq-9",
    q: "কোন ধরনের অভিযোগ করা যায়?",
    a: "বেতন না পাওয়া, চাকরিচ্যুতি, কর্মক্ষেত্রে হয়রানি, নিরাপত্তা ধর্মঘট, অবৈধ ছাঁটাই, ওভারটাইম না দেওয়া, চুক্তি ভঙ্গ সহ শ্রম আইনের যেকোনো লঙ্ঘনের অভিযোগ করা যায়।",
  },
  {
    id: "faq-10",
    q: "অভিযোগ করলে কি আমার চাকরি যাবে?",
    a: "না, আল্লাহর রহমতে নয়। আমরা শ্রমিকদের সম্পূর্ণ গোপনীয়তা রক্ষা করি। তবে যদি নিয়োগকর্তা শ্রমিকের বিরুদ্ধে প্রতিশোধমূলক ব্যবস্থা নেয়, তা হলে আমরা আইনশৃংখল বিভাগে জানাবো।",
  },
];

export default function FAQPage() {
  return (
    <div className="py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2 flex items-center gap-3">
            <HelpCircle className="text-green-primary" size={28} />
            সাধারণভাবে জিজ্ঞাসিত প্রশ্নসমূহ (FAQ)
          </h1>
          <p className="text-muted-foreground">
            শ্রমিকদের সাধারণ প্রশ্নের উত্তর নিচে দেওয়া হল
          </p>
        </div>

        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="space-y-2">
              {FAQS.map((faq, i) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <AccordionItem
                    value={faq.id}
                    className="border border-border rounded-xl px-4"
                    data-ocid={`faq.item.${i + 1}`}
                  >
                    <AccordionTrigger className="text-navy font-semibold text-sm py-4 hover:no-underline text-left">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm pb-4 leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="mt-8 bg-green-50 border border-green-100 rounded-xl p-5 text-center">
          <p className="text-sm text-green-800 mb-3">
            আপনার প্রশ্নের উত্তর নেই? আমাদের সাথে যোগাযোগ করুন:
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="tel:01403163378"
              className="inline-flex items-center justify-center gap-2 bg-green-primary text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90"
              data-ocid="faq.hotline.button"
            >
              📞 হটলাইন: ০১৪০৩-১৬৩৩৭৮
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 border border-green-primary text-green-primary px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-green-50"
              data-ocid="faq.contact.link"
            >
              📬 যোগাযোগ ফর্ম
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
