interface Props {
  visible: boolean
}

export function PrefillIndicator({ visible }: Props) {
  if (!visible) return null

  return (
    <div className="absolute right-2.5 top-2.5 z-10 flex items-center gap-2 rounded-full bg-gray-900/70 px-2.5 py-1.5 backdrop-blur-sm">
      <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/35 border-t-white" />
      <span className="text-xs font-semibold text-white">Processing image</span>
    </div>
  )
}
