import type { Metadata } from "next";
import "./globals.css";
import { MotionProvider, Navigation, Header } from "@/components";
import { AnimationProvider } from "@/lib/animationContext";


export const metadata: Metadata = {
  title: "Colton Tollett - Design Engineer",
  description: "Building polished, technically complex interfaces—blending design + engineering to ship products that feel right.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col gap-6 mx-auto max-w-[628px] px-6 mt-[124px] mb-[124px]">
        <AnimationProvider>
        <MotionProvider>
          <Header />
          <Navigation />
          {children}
        </MotionProvider>
        </AnimationProvider>
      </body>
    </html>
  );
}
