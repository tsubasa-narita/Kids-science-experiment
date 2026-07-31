import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ふしぎのたね｜おうちで あそぶ かがく",
  description: "4〜5歳の子どもと、家庭で安全に楽しむ小さな科学実験アプリ。みて、よそうして、やってみよう。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}
