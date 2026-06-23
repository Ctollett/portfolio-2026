"use client";

import { usePathname } from "next/navigation";
import { LabBackButton } from "@/components/LabBackButton";

export default function LabLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDetail = pathname !== "/lab";

  return (
    <>
      {children}
      {isDetail && <LabBackButton />}
    </>
  );
}
