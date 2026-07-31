import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tsubasa-narita.github.io/Kids-science-experiment/"),
  title: "ふしぎのたね｜おうちで あそぶ かがく",
  description: "4〜5歳の子どもと、家庭で安全に楽しむ小さな科学実験アプリ。みて、よそうして、やってみよう。",
  openGraph: {
    title: "ふしぎのたね｜おうちで あそぶ かがく",
    description: "みて、よそうして、やってみよう。親子で楽しむ、小さな科学実験。",
    type: "website",
    locale: "ja_JP",
    images: [{
      url: "https://tsubasa-narita.github.io/Kids-science-experiment/og.png",
      width: 1730,
      height: 909,
      alt: "水に浮かぶ折り紙の花と、ふしぎのたねのタイトル",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ふしぎのたね｜おうちで あそぶ かがく",
    description: "みて、よそうして、やってみよう。親子で楽しむ、小さな科学実験。",
    images: ["https://tsubasa-narita.github.io/Kids-science-experiment/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}
