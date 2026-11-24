import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PWARegister } from "@/components/pwa-register";

export const metadata: Metadata = {
  title: "MiHatoApp | Gestión bovina",
  description: "Calcula y registra el peso de tu ganado bovino, incluso sin conexión.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "MiHatoApp" },
};
export const viewport: Viewport = {
  themeColor: "#234b35",
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-MX"><body><PWARegister />{children}</body></html>;
}