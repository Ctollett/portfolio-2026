import ProjectEntry from "./ProjectEntry";
import { projects } from '@/lib/projects'


export default function ProjectSection() {
 
  return <section className="flex flex-col gap-3">
      <h2 className="text-base font-sans text-primary font-medium">Projects</h2>
      {projects.map((p) => (
        <ProjectEntry key={p.id} title={p.title} description={p.description} />
      ))}
  </section>;
}
