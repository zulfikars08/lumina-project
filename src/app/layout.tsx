import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumina",
  description: "Modern beauty storefront for Lumina.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const initTheme = "try{var t=localStorage.getItem('lumina-theme')==='dark'?'dark':'light';document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}";
  return <html lang="en" className="h-full antialiased" suppressHydrationWarning><body className="min-h-full flex flex-col"><script dangerouslySetInnerHTML={{ __html: initTheme }} />{children}</body></html>;
}
