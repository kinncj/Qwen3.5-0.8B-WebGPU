interface Props {
  message: string
}

export function LoadingOverlay({ message }: Props) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[10px] bg-black/70 backdrop-blur-sm">
      <span className="text-lg font-semibold text-white">{message}</span>
    </div>
  )
}
