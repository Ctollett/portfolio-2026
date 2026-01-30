  interface FeatureEntryProps {
   publication: string;
   article: string;
    
  }


export default function FeatureEntry({publication, article}: FeatureEntryProps) {

   return <article className="flex flex-col gap-2 text-sm tracking-normal">
    <h3>{publication}</h3>
    <p>{article}</p>
  </article>;
}
