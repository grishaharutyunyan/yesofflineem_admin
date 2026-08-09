"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { ensureSession } from "@/lib/api";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;

    // The access token is memory-only, so a hard reload always starts empty —
    // try to re-establish the session from the httpOnly refresh cookie before
    // deciding whether to bounce to /login.
    if (getToken()) {
      setReady(true);
      return;
    }

    ensureSession().then((ok) => {
      if (!alive) return;
      if (ok) setReady(true);
      else router.replace("/login");
    });

    return () => { alive = false; };
  }, [router]);

  if (!ready) return null;
  return <>{children}</>;
}
