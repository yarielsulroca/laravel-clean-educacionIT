"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAuthError } from "@/hooks/useAuthError";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const { login } = useAuth();
  const { error, isSubmitting, handleError, startSubmitting, stopSubmitting } = useAuthError();
  const router = useRouter();
  const { t } = useTranslations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      handleError(t("auth.pleaseCompleteFields"));
      return;
    }

    try {
      startSubmitting();
      const success = await login(email, password);
      if (success) {
        router.push("/"); // Redirige al dashboard después del login
      }
    } catch (error) {
      handleError(error);
    } finally {
      stopSubmitting();
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
                  <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon />
            {t("auth.backToDashboard")}
          </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              {t("auth.signIn")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("auth.enterEmailPassword")}
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                  {error.message}
                </div>
              )}
              <div className="space-y-6">
                <div>
                  <Label>
                    {t("auth.email")} <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input 
                    placeholder="info@gmail.com" 
                    type="email" 
                    defaultValue={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label>
                    {t("auth.password")} <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      defaultValue={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? <EyeIcon /> : <EyeCloseIcon />}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      {t("auth.keepMeLoggedIn")}
                    </span>
                  </div>
                  <Link
                    href="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    {t("auth.forgotPassword")}
                  </Link>
                </div>
                <div>
                  <Button 
                    className="w-full" 
                    size="sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t("auth.signingIn") : t("auth.signIn")}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                {t("auth.dontHaveAccount")} {""}
                <Link
                  href="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  {t("auth.signUp")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}