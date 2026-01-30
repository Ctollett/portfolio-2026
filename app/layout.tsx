import type { Metadata } from "next";
import "./globals.css";
import { MotionProvider } from "@/components";
import {
  Navigation,
  Header,
  ConnectSection
} from "@/components";


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
        <MotionProvider>
        <Header />
        <Navigation /> 
        {children}
        <ConnectSection/>
        </MotionProvider>
      </body>
    </html>
  );
}
