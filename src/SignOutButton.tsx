"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      className="px-3 py-2 sm:px-6 sm:py-3 rounded-2xl text-sm sm:text-base bg-white text-gray-800 border-2 border-gray-200 font-semibold hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
      onClick={() => void signOut()}
    >
      <span className="hidden sm:inline">Sign out</span>
      <span className="sm:hidden">Sign out</span>
    </button>
  );
}
