"use client";
import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("No se pudo registrar el Service Worker:", error);
      });
    }
  }, []);
  return null;
}
