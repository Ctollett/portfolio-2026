import { LabSection } from "@/components";
import { getLabItems } from "@/lib/lab";

export default async function LabPage() {
  const labs = await getLabItems();

  return (
    <main className="overflow-visible">
      <LabSection labs={labs} />
    </main>
  );
}