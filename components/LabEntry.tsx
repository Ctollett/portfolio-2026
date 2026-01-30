interface LabEntryProps {
  number: string;
  title: string;
  thumbnail: string;
  description: string;
  date: string;
}

export default function LabEntry({ number, title, description, thumbnail, date }: LabEntryProps) {
  return (
    <article className="flex flex-col gap-2">
    <div className="w-full h-[348px] overflow-hidden rounded-lg bg-accent">
  <img
    src={thumbnail}
    alt={title}
    className="w-full h-full object-cover object-top"
  />
</div>
 <div className="flex flex-col">
      <span className="text-xs">{number} — {date}</span>
      <h3>{title}</h3>
      </div>
    </article>
  );
}
