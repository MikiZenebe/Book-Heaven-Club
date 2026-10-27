import type { ShelfBook } from "@/types/shelf";

const STATUS_OPTIONS: {
  value: ShelfBook["status"];
  label: string;
  short: string;
  dot: string;
  activeDot: string;
}[] = [
  {
    value: "WANT_TO_READ",
    label: "Want to read",
    short: "To Read",
    dot: "bg-stone-400/60",
    activeDot: "bg-stone-600 ring-2 ring-stone-300",
  },
  {
    value: "CURRENTLY_READING",
    label: "Currently reading",
    short: "Reading",
    dot: "bg-[#c4873a]/60",
    activeDot: "bg-[#c4873a] ring-2 ring-amber-300/80",
  },
  {
    value: "FINISHED",
    label: "Finished",
    short: "Done",
    dot: "bg-[#4f7a55]/60",
    activeDot: "bg-[#3e7545] ring-2 ring-emerald-300/80",
  },
];

export default function StatusToggle({
  value,
  onChange,
  disabled,
}: {
  value: ShelfBook["status"];
  onChange: (status: ShelfBook["status"]) => void;
  disabled?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label="Reading status"
      className="inline-flex w-full items-center rounded-full bg-[#2b2420]/5 p-0.5 ring-1 ring-[#2b2420]/8 shadow-inner"
    >
      {STATUS_OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            title={opt.label}
            aria-pressed={active}
            className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-full py-1 px-2 text-[10.5px] font-medium tracking-tight transition-all duration-200 active:scale-95 disabled:pointer-events-none disabled:opacity-40 ${
              active
                ? "bg-white text-[#2b2420] shadow-xs ring-1 ring-black/5 font-semibold"
                : "text-[#6b5d52]/80 hover:bg-white/40 hover:text-[#2b2420]"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-200 ${
                active ? opt.activeDot : opt.dot
              }`}
            />
            <span className="truncate">{opt.short}</span>
          </button>
        );
      })}
    </div>
  );
}
