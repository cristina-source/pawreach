export default function DashboardRootLoading() {
  return (
    <div style={{ maxWidth: "1100px" }}>
      {/* Header skeleton */}
      <div style={{ marginBottom: "28px" }}>
        <div className="skeleton" style={{ width: "220px", height: "28px", marginBottom: "8px" }} />
        <div className="skeleton" style={{ width: "340px", height: "16px" }} />
      </div>

      {/* Quick actions skeleton */}
      <div className="dashboard-quick-grid">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="skeleton"
            style={{ height: "64px", borderRadius: "12px" }}
          />
        ))}
      </div>

      {/* Stat cards skeleton */}
      <div className="dashboard-stat-grid">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              background: "var(--app-surface)",
              border: "1px solid var(--app-border)",
              borderRadius: "12px",
              padding: "24px",
            }}
          >
            <div className="skeleton" style={{ width: "80px", height: "14px", marginBottom: "12px" }} />
            <div className="skeleton" style={{ width: "60px", height: "32px", marginBottom: "8px" }} />
            <div className="skeleton" style={{ width: "110px", height: "12px" }} />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div
        style={{
          background: "var(--app-surface)",
          border: "1px solid var(--app-border)",
          borderRadius: "12px",
          padding: "24px",
        }}
      >
        <div className="skeleton" style={{ width: "200px", height: "18px", marginBottom: "6px" }} />
        <div className="skeleton" style={{ width: "140px", height: "13px", marginBottom: "24px" }} />
        <div className="skeleton" style={{ width: "100%", height: "260px" }} />
      </div>
    </div>
  )
}
