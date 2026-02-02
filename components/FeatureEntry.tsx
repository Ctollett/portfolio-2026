'use client';
import { m } from 'framer-motion'
  
  interface FeatureEntryProps {
   publication: string;
   article: string;
   link: string;
    
  }


export default function FeatureEntry({publication, article, link}: FeatureEntryProps) {

   return <m.article whileHover="hover" initial="rest" className="flex flex-col gap-2 text-sm tracking-normal">
    <h3>{publication}</h3> 
    <div className="flex flex-row gap-2">
    <a href={link}>{article}</a>
    <m.p variants={{rest: {opacity: 0, y: 2}, hover: {opacity: 1, y:0}}}>↗</m.p>
    </div>
  </m.article>
}
