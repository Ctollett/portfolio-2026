import { getLabItems } from "@/lib/lab";
import { notFound } from "next/navigation";
import { codeToHtml } from "shiki";

interface LabDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function LabDetailPage({ params }: LabDetailPageProps) {
  const { slug } = await params;
  const labs = await getLabItems();
  const lab = labs.find((l) => l.slug === slug);

  if (!lab) {
    notFound();
  }

  // Fetch the code from GitHub
  const codeRes = await fetch(lab.codeUrl);
  const code = await codeRes.text();

  // Highlight with Shiki
  const highlightedCode = await codeToHtml(code, {
    lang: "tsx",
    theme: "github-light",
  });

  return (
    <main className="flex flex-col gap-4">

      <div className="flex flex-col gap-4">
        {/* Interactive Preview */}
        <div className="h-[450px] rounded-lg overflow-hidden border border-secondary">
          <iframe
            src={lab.iframeUrl}
            className="w-full h-full"
            title={lab.title}
          />
        </div>
          <div className="flex flex-col gap-1">
        <span className="text-xs text-secondary">{lab.number} — {lab.date}</span>
        <h1>{lab.title}</h1>
        <p className="text-secondary">{lab.description}</p>
      </div>

        {/* Code Display */}
        <div className="h-[450px] rounded-lg border border-secondary bg-white overflow-hidden">
          <div
            className="h-full overflow-auto text-sm [&_pre]:p-4 [&_pre]:m-0"
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </div>
      </div>
    </main>
  );
}
