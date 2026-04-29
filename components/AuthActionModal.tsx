"use client";

import Link from "next/link";
import React from "react";

interface AuthActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  loginHref?: string;
  signupHref?: string;
}

const AuthActionModal: React.FC<AuthActionModalProps> = ({
  isOpen,
  onClose,
  title = "Login Required",
  message = "Please log in or create an account to continue with this action.",
  loginHref = "/auth/login",
  signupHref = "/auth/signup",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-dark-100 p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="mt-2 text-sm text-light-100">{message}</p>

        <div className="mt-6 flex flex-col gap-2">
          <Link
            href={loginHref}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-primary/90"
          >
            Go to Login
          </Link>
          <Link
            href={signupHref}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-center text-sm font-semibold text-light-100 hover:bg-dark-200"
          >
            Create Account
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg px-4 py-2.5 text-sm text-light-200 hover:bg-dark-200"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthActionModal;
