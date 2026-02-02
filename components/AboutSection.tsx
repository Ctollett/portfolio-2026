'use client';
import { m } from 'framer-motion'
import { fadeInstant } from '@/lib/motion'

export default function AboutSection() {
  return (
    <m.section variants={fadeInstant} initial="hidden" animate="visible"  className="flex flex-col gap-4 text-sm leading-normal">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et doloremagna aliqua dunt ut labore et doloremag. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et doloremagna aliqua dunt ut labore et doloremag. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et doloremagna aliqua dunt ut labore et doloremag.  
        </p>
        <div className="flex flex-col gap-3">
            <h3 className="text-base font-sans text-primary tracking-normal">Education</h3>
               <ul className="flex flex-col gap-0">
                <li>
                    BS Computer Science
                </li>
                <li>
                    BA English/Communications
                </li>
            </ul>
        </div>
         <div className="flex flex-col gap-3">
            <h3 className="text-base font-sans text-primary tracking-normal">Services</h3>
            <ul className="flex flex-col gap-0">
                <li>
                    BS Computer Science
                </li>
                <li>
                    BA English/Communications
                </li>
            </ul>
        </div>
    </m.section>
  );
}
