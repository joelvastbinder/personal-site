import { JVLogo } from "./jv-logo"

interface FloatingChatWidgetProps {
  onClick: () => void
}

export function FloatingChatWidget({ onClick }: FloatingChatWidgetProps) {
  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex cursor-pointer items-center gap-2 sm:gap-3"
      onClick={onClick}
      role="button"
      aria-label="Open chat"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {/* Chat bubble — compact on mobile so it stays on-screen; full size from sm+ */}
      <div
        className="relative max-w-[calc(100vw-5.5rem-env(safe-area-inset-left,0px))] rounded-xl border border-gray-300 bg-white px-2.5 py-1.5 sm:max-w-none sm:rounded-2xl sm:px-4 sm:py-2"
        style={{
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        }}
      >
        {/* Tail pointing at the circle — mobile only */}
        <span
          className="pointer-events-none absolute top-1/2 right-[-5px] h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-r border-b border-gray-300 bg-white sm:hidden"
          aria-hidden
        />
        <p className="text-left text-xs leading-snug text-gray-800 sm:text-sm sm:leading-normal sm:whitespace-nowrap">
          Click to chat
        </p>
      </div>

      {/* Circle with logo */}
      <div
        className="w-14 h-14 rounded-full border-2 shadow-xl flex items-center justify-center"
        style={{
          background: "#1e293b",
          borderColor: "#3b82f6",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div className="text-white">
          <JVLogo />
        </div>
      </div>
    </div>
  )
}
