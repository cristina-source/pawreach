export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="min-h-screen flex"
      style={{
        background: "var(--app-bg)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background: dot pattern */}
      <div
        className="bg-dots"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      />
      {/* Glow blob — top right */}
      <div
        style={{
          position: "absolute",
          top: "-120px",
          right: "-120px",
          width: "480px",
          height: "480px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%)",
          zIndex: 0,
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      {/* Glow blob — bottom left */}
      <div
        style={{
          position: "absolute",
          bottom: "-80px",
          left: "-80px",
          width: "360px",
          height: "360px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)",
          zIndex: 0,
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1, display: "flex", width: "100%", minHeight: "100vh" }}>
        {children}
      </div>
    </div>
  )
}
