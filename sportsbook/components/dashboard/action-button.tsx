import { ReactNode } from "react"

interface Props {
  title: string
  icon: ReactNode
}

export default function ActionButton({
  title,
  icon,
}: Props) {
  return (
    <button className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-emerald-500 hover:bg-zinc-800">
      {icon}

      <span className="font-semibold">
        {title}
      </span>
    </button>
  )
}