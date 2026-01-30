import { socials } from '@/lib/socials'


export default function ConnectSection() {
  return <section className='flex flex-col gap-3'>
     <h2 className="text-base font-sans text-primary font-medium">Connect</h2>
     <div className='flex flex-row justify-between'>
     <div className='flex flex-row gap-3 text-sm text-primary'>
    {socials.map((s) => (
     <a key={s.id} href={s.link}>{s.social}</a>

    ))}
    </div>
   <p className='text-sm text-primary'><span className='text-accent'>{'\u00A9'} </span>2026</p>

    </div> 
  </section>;
}
