

export default function Header() {
  return (
  <header>
    <div className="flex flex-col gap-3">
      <div className="">
       <img src="/vectors/logo-group.svg" alt="Logo" />
      </div>
      <div className="font-display w-[424px] text-lg tracking-tight leading-snug"><span className="text-accent italic">colton tollett</span> builds polished, technically complex interfaces—blending <span className="text-accent italic">design</span> + <span className="text-accent italic">engineering</span> to ship products that feel right.</div>
    </div>
  </header>
  );
}
