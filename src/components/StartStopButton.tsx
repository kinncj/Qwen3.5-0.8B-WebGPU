interface Props {
  isProcessing: boolean
  disabled: boolean
  onStart: () => void
  onStop: () => void
}

export function StartStopButton({ isProcessing, disabled, onStart, onStop }: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={isProcessing ? onStop : onStart}
      className={[
        'min-w-[84px] rounded-lg px-3.5 py-2 text-sm font-semibold text-white transition-all duration-100',
        'hover:not-disabled:-translate-y-px hover:not-disabled:shadow-lg',
        'disabled:cursor-not-allowed disabled:opacity-60',
        isProcessing ? 'bg-red-600' : 'bg-green-600',
      ].join(' ')}
    >
      {isProcessing ? 'Stop' : 'Start'}
    </button>
  )
}
