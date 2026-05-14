import { MotionProvider, Navigation, Header } from "@/components";
import { AnimationProvider } from "@/lib/animationContext";
import { LabFocusProvider } from "@/lib/labFocusContext";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6 mx-auto max-w-[628px] px-6 mt-[124px] mb-[124px] overflow-visible">
      <AnimationProvider>
        <LabFocusProvider>
          <MotionProvider>
            <Header />
            <Navigation />
            {children}
          </MotionProvider>
        </LabFocusProvider>
      </AnimationProvider>
    </div>
  );
}
