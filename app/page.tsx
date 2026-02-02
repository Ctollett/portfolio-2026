import {
  ProjectSection,
  FeaturesSection,
  ConnectSection,
} from "@/components";

export default function Home() {
  return (
    <main className="flex flex-col gap-6">
      <ProjectSection />
      <FeaturesSection />
      <ConnectSection />
    </main>
  );
}
