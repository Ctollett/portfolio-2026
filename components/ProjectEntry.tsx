

  interface ProjectEntryProps {
    title: string;
    description: string;
  }
export default function ProjectEntry({title, description}: ProjectEntryProps) {
  return <article className="flex flex-col gap-2 text-sm tracking-normal">
    <h3>{title}</h3>
    <p>{description}</p>
  </article>;
}
