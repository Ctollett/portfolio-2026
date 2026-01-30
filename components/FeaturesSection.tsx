import FeatureEntry from "./FeatureEntry";
import { features } from '@/lib/features'



export default function FeaturesSection() {


  return <section className="flex flex-col gap-3">
        <h2 className="text-base font-sans text-primary font-medium">Notable Features</h2>
        {features.map((f) => (
          <FeatureEntry key={f.id} publication={f.publication} article={f.article} />
        ))}
    </section>;
}
