import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1200);
  };

  return (
    <div className="py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">যোগাযোগ</h1>
          <p className="text-muted-foreground">আমাদের সাথে যোগাযোগ করুন</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            <Card className="shadow-card border-0">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                    <Phone size={20} className="text-red-primary" />
                  </div>
                  <div>
                    <div className="font-bold text-navy text-sm">হটলাইন</div>
                    <div className="text-green-primary font-bold text-lg">
                      ০১৪০৩-১৬৩৩৭৮
                    </div>
                    <div className="text-xs text-muted-foreground">
                      রবি-বৃহস্পতি, সকাল ৯টা - বিকাল ৫টা
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">💬</span>
                  </div>
                  <div>
                    <div className="font-bold text-navy text-sm">হোয়াটসঅ্যাপ</div>
                    <a
                      href="https://wa.me/8801403163378"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-primary font-bold text-lg hover:underline"
                    >
                      +৮৮০১৪০৩-১৬৩৩৭৮
                    </a>
                    <div className="text-xs text-muted-foreground">
                      সবসময় বার্তা পাঠান যাবে
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Mail size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-navy text-sm">ইমেইল</div>
                    <a
                      href="mailto:garment.samhati@gmail.com"
                      className="text-navy font-medium hover:underline"
                    >
                      garment.samhati@gmail.com
                    </a>
                    <div className="text-xs text-muted-foreground">
                      ২৪ ঘন্টার মধ্যে উত্তর দেওয়া হয়
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-yellow-50 flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} className="text-yellow-600" />
                  </div>
                  <div>
                    <div className="font-bold text-navy text-sm">
                      অফিসের ঠিকানা
                    </div>
                    <div className="text-navy text-sm">
                      ১১০৪ রোজভিউ প্লাজা, ১৮৫ বীর উত্তম সি আর দত্ত রোড
                    </div>
                    <div className="text-muted-foreground text-xs">
                      হাতিরপুল, ঢাকা-১২০৫, বাংলাদেশ
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <Clock size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <div className="font-bold text-navy text-sm">অফিস সময়</div>
                    <div className="text-navy text-sm">রবি-বৃহস্পতিবার</div>
                    <div className="text-muted-foreground text-xs">
                      সকাল ৯:00 - বিকাল ৫:00
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map placeholder */}
            <Card className="shadow-card border-0 overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
                <div className="text-center">
                  <MapPin
                    size={36}
                    className="text-green-primary mx-auto mb-2"
                  />
                  <p className="text-sm text-muted-foreground">
                    হাতিরপুল, ঢাকা-১২০৫
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-navy mb-5">বার্তা পাঠান</h2>

              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                  data-ocid="contact.success_state"
                >
                  <CheckCircle2
                    size={48}
                    className="text-green-primary mx-auto mb-3"
                  />
                  <p className="font-bold text-navy">আপনার বার্তা পাঠানো হয়েছে।</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    আমরা শীঘ্রই যোগাযোগ কররো।
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label
                      htmlFor="contact-name"
                      className="text-sm font-semibold mb-1.5 block"
                    >
                      নাম *
                    </Label>
                    <Input
                      id="contact-name"
                      value={form.name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="আপনার নাম"
                      className="h-11"
                      data-ocid="contact.name.input"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="contact-phone"
                      className="text-sm font-semibold mb-1.5 block"
                    >
                      মোবাইল নম্বর *
                    </Label>
                    <Input
                      id="contact-phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      placeholder="০১৬৫-XXXXXXXX"
                      className="h-11"
                      data-ocid="contact.phone.input"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="contact-msg"
                      className="text-sm font-semibold mb-1.5 block"
                    >
                      বার্তা *
                    </Label>
                    <Textarea
                      id="contact-msg"
                      value={form.message}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, message: e.target.value }))
                      }
                      placeholder="আপনার বার্তা লিখুন..."
                      rows={5}
                      data-ocid="contact.message.textarea"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-green-primary hover:bg-green-primary/90 text-white font-bold"
                    data-ocid="contact.submit_button"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="mr-2 animate-spin" />
                        পাঠানো হচ্ছে...
                      </>
                    ) : (
                      "বার্তা পাঠান"
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
