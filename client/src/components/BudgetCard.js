export default function BudgetCard({ budget }) {
  if (!budget) return (
    <div className="budget-card">
      <h3>💰 Budget Tracker</h3>
      <p style={{ color: "#aaa", fontSize: "13px", marginTop: "8px" }}>
        Loading budget...
      </p>
    </div>
  );

  if (budget.budget === 0) return (
    <div className="budget-card">
      <h3>💰 Budget Tracker</h3>
      <p style={{ color: "#aaa", fontSize: "13px", marginTop: "10px" }}>
        No budget set yet.
      </p>
      <div style={{
        marginTop: "12px", padding: "12px",
        background: "#f8f8ff", borderRadius: "10px",
        border: "1px dashed #c4b5fd", textAlign: "center"
      }}>
        <p style={{ color: "#4f46e5", fontSize: "13px", fontWeight: "600" }}>
          💡 Set a budget below to start tracking your spending!
        </p>
      </div>
    </div>
  );

  const pct   = Math.min(budget.percentage, 100);
  const over  = budget.spent > budget.budget;
  const color = pct >= 90 ? "#e53e3e" : pct >= 70 ? "#f59e0b" : "#10b981";

  return (
    <div className="budget-card">

      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: "18px"
      }}>
        <h3>💰 Budget Tracker</h3>
        {over && (
          <span style={{
            background: "#fff5f5", color: "#e53e3e",
            padding: "4px 12px", borderRadius: "20px",
            fontSize: "12px", fontWeight: "700",
            border: "1px solid #fed7d7"
          }}>
            ⚠️ Over Budget!
          </span>
        )}
        {!over && pct >= 70 && (
          <span style={{
            background: "#fffbeb", color: "#f59e0b",
            padding: "4px 12px", borderRadius: "20px",
            fontSize: "12px", fontWeight: "700",
            border: "1px solid #fde68a"
          }}>
            ⚡ Running Low
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          marginBottom: "8px", alignItems: "center"
        }}>
          <span style={{ fontSize: "13px", color: "#888", fontWeight: "600" }}>
            Budget used
          </span>
          <span style={{
            fontSize: "14px", fontWeight: "800", color,
            background: color + "15", padding: "2px 10px",
            borderRadius: "20px"
          }}>
            {pct}%
          </span>
        </div>
        <div style={{
          height: "14px", background: "#f0f0f0",
          borderRadius: "10px", overflow: "hidden"
        }}>
          <div style={{
            height: "100%",
            width: pct + "%",
            background: color,
            borderRadius: "10px",
            transition: "width 0.6s ease",
            minWidth: pct > 0 ? "14px" : "0"
          }}/>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "12px",
        marginBottom: "16px"
      }}>
        <div style={statBox("#f8f8ff", "#4f46e5")}>
          <span style={{ fontSize: "15px", fontWeight: "800", color: "#4f46e5" }}>
            ₹{budget.budget.toLocaleString()}
          </span>
          <span style={{ fontSize: "11px", color: "#888", fontWeight: "600" }}>
            Total Budget
          </span>
        </div>
        <div style={statBox("#fff8f0", "#f59e0b")}>
          <span style={{ fontSize: "15px", fontWeight: "800", color: "#f59e0b" }}>
            ₹{budget.spent.toLocaleString()}
          </span>
          <span style={{ fontSize: "11px", color: "#888", fontWeight: "600" }}>
            Total Spent
          </span>
        </div>
        <div style={statBox(
          over ? "#fff5f5" : "#f0fdf8",
          over ? "#e53e3e" : "#10b981"
        )}>
          <span style={{
            fontSize: "15px", fontWeight: "800",
            color: over ? "#e53e3e" : "#10b981"
          }}>
            ₹{Math.abs(budget.remaining).toLocaleString()}
          </span>
          <span style={{ fontSize: "11px", color: "#888", fontWeight: "600" }}>
            {over ? "Over By" : "Remaining"}
          </span>
        </div>
      </div>

      {/* Breakdown */}
      {budget.spent > 0 && (
        <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "14px" }}>
          <p style={{
            fontSize: "11px", fontWeight: "700",
            color: "#aaa", marginBottom: "10px",
            letterSpacing: "1px"
          }}>
            BREAKDOWN BY TYPE
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {budget.breakdown.flights > 0 && (
              <span style={badge("#eff6ff", "#3b82f6")}>
                ✈️ ₹{budget.breakdown.flights.toLocaleString()}
              </span>
            )}
            {budget.breakdown.hotels > 0 && (
              <span style={badge("#f0fdf8", "#10b981")}>
                🏨 ₹{budget.breakdown.hotels.toLocaleString()}
              </span>
            )}
            {budget.breakdown.activities > 0 && (
              <span style={badge("#fffdf0", "#f59e0b")}>
                🎯 ₹{budget.breakdown.activities.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function statBox(bg, color) {
  return {
    background: bg, borderRadius: "12px", padding: "14px",
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: "4px",
    border: "1px solid " + color + "33"
  };
}

function badge(bg, color) {
  return {
    background: bg, color,
    padding: "5px 14px", borderRadius: "20px",
    fontSize: "12px", fontWeight: "700",
    border: "1px solid " + color + "44"
  };
}