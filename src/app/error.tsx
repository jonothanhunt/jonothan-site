"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Error({ error }: { error: Error & { digest?: string } }) {
  const router = useRouter();

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
    router.replace("/");
  }, [error, router]);

  return null;
}
