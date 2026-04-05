import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Lock, LogIn, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";

const ADMIN_PASSWORD = "@dminBGWS2001";
const ADMIN_SESSION_KEY = "bgws_admin_session";

export function isPasswordAdmin(): boolean {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, loginStatus, identity, isLoggingIn } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminChecking } = useIsAdmin();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  useEffect(() => {
    // If already logged in via password session
    if (isPasswordAdmin()) {
      navigate({ to: "/admin/dashboard" });
      return;
    }
    if (identity && isAdmin) {
      navigate({ to: "/admin/dashboard" });
    }
  }, [identity, isAdmin, navigate]);

  const handlePasswordLogin = () => {
    if (!password) {
      setPasswordError("পাসওয়ার্ড লিখুন");
      return;
    }
    setIsPasswordLoading(true);
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
        navigate({ to: "/admin/dashboard" });
      } else {
        setPasswordError("ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।");
      }
      setIsPasswordLoading(false);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handlePasswordLogin();
  };

  return (
    <div className="min-h-screen bg-page-bg flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-card border-0">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-navy flex items-center justify-center mx-auto mb-4">
                <Shield size={32} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-navy">অ্যাডমিন লগইন</h1>
              <p className="text-muted-foreground text-sm mt-2">
                বাংলাদেশ গার্মেন্ট শ্রমিক সংহতি — প্রশাসনিক প্যানেল
              </p>
            </div>

            {/* Password Login Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Lock size={16} className="text-green-primary" />
                <h2 className="font-semibold text-navy text-sm">
                  পাসওয়ার্ড দিয়ে লগইন
                </h2>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">
                    অ্যাডমিন পাসওয়ার্ড
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError("");
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="পাসওয়ার্ড লিখুন"
                      className="h-12 pr-10"
                      data-ocid="admin_login.password.input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordError && (
                    <p
                      className="text-red-500 text-xs mt-1"
                      data-ocid="admin_login.password_error"
                    >
                      {passwordError}
                    </p>
                  )}
                </div>
                <Button
                  onClick={handlePasswordLogin}
                  disabled={isPasswordLoading}
                  className="w-full h-12 bg-green-primary text-white font-bold text-base rounded-xl hover:bg-green-primary/90"
                  data-ocid="admin_login.password.button"
                >
                  {isPasswordLoading ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      যাচাই হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Lock size={18} className="mr-2" />
                      প্রবেশ করুন
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-muted-foreground">অথবা</span>
              </div>
            </div>

            {/* Internet Identity Section */}
            {identity && adminChecking && (
              <div
                className="text-center py-4"
                data-ocid="admin_login.loading_state"
              >
                <Loader2
                  size={32}
                  className="animate-spin text-green-primary mx-auto mb-2"
                />
                <p className="text-muted-foreground text-sm">
                  পরিচয় যাচাই করা হচ্ছে...
                </p>
              </div>
            )}

            {identity && !adminChecking && !isAdmin && (
              <div
                className="bg-red-50 border border-red-200 rounded-xl p-4 text-center text-sm text-red-700 mb-4"
                data-ocid="admin_login.error_state"
              >
                আপনার অ্যাডমিন অ্যাক্সেস নেই। সঠিক অ্যাকাউন্ট দিয়ে লগইন করুন।
              </div>
            )}

            {!identity && (
              <>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 mb-4">
                  <p>
                    Internet Identity ব্যবহার করেও দায়িত্বপ্রাপ্ত কর্মকর্তারা লগইন করতে
                    পারেন।
                  </p>
                </div>
                <Button
                  onClick={login}
                  disabled={isLoggingIn}
                  variant="outline"
                  className="w-full h-12 border-navy text-navy font-bold text-sm rounded-xl hover:bg-navy/5"
                  data-ocid="admin_login.login.button"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      লগইন হচ্ছে...
                    </>
                  ) : (
                    <>
                      <LogIn size={18} className="mr-2" />
                      Internet Identity দিয়ে লগইন
                    </>
                  )}
                </Button>
              </>
            )}

            {loginStatus === "loginError" && (
              <p
                className="text-red-500 text-sm text-center mt-3"
                data-ocid="admin_login.error_state"
              >
                লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
