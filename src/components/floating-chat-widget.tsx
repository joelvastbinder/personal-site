import { JVLogo } from "./jv-logo"

interface FloatingChatWidgetProps {
  onClick: () => void
}

export function FloatingChatWidget({ onClick }: FloatingChatWidgetProps) {
  return (
    <div
      className="fixed bottom-5 right-5 flex items-center gap-3 cursor-pointer z-50"
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
      {/* Chat bubble - hidden on very small screens */}
      <div
        className="hidden sm:block bg-white border border-gray-300 rounded-2xl px-4 py-2 shadow-lg"
        style={{
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        }}
      >
        <p className="text-sm text-gray-800 whitespace-nowrap">
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
