'use client';
import { m } from 'framer-motion'
import { fadeInstant } from '@/lib/motion'
import LabEntry from "./LabEntry";
import { labItems } from "@/lib/lab";

export default function LabSection() {
  return (
    <m.section variants={fadeInstant} initial="hidden" animate="visible" className="flex flex-col gap-4">
      {labItems.map((item) => (
        <LabEntry key={item.id} number={item.number} title={item.title} description={item.description} date={item.date} thumbnail={item.thumbnail} />
      ))}
    </m.section>
  );
}
