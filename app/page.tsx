"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Root() {
  const router = useRouter();
  useEffect(() => {
    // AuthGuard on /dashboard attempts a silent refresh and redirects to
    // /login itself if there's no valid session — no need to check here.
    router.replace("/dashboard");
  }, [router]);
  return null;
}