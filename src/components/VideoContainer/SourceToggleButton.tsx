import type { SourceMode } from '../../types'

interface Props {
  sourceMode: SourceMode
  disabled: boolean
  onToggle: () => void
}

export function SourceToggleButton({ sourceMode, disabled, onToggle }: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className="absolute left-2.5 top-2.5 z-10 rounded-full border border-white/30 bg-gray-900/70 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100 disabled:cursor-not-allowed disabled:opacity-45"
    >
      {sourceMode === 'webcam' ? 'Use video file' : 'Use webcam'}
    </button>
  )
}
