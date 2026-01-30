import LabEntry from "./LabEntry";
import { labItems } from "@/lib/lab";

export default function LabSection() {
  return (
    <section className="flex flex-col gap-4">
      {labItems.map((item) => (
        <LabEntry key={item.id} number={item.number} title={item.title} description={item.description} date={item.date} thumbnail={item.thumbnail} />
      ))}
    </section>
  );
}
