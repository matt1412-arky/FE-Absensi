import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../context/AuthContext";
import { studentAPI } from "../../api";

ChartJS.register(ArcElement, Tooltip, Legend);

const NAV = [
  { type: "label", label: "Saya" },
  { path: "", icon: "🏠", label: "Dashboard" },
  { path: "/grades", icon: "📝", label: "Nilai Saya" },
  { path: "/attendance", icon: "✅", label: "Kehadiran Saya" },
];

const STATUS_BADGE = {
  present: { label: "Hadir", cls: "badge-present" },
  absent: { label: "Absen", cls: "badge-absent" },
  sick: { label: "Sakit", cls: "badge-sick" },
  permission: { label: "Izin", cls: "badge-permission" },
};

// ── Overview ─────────────────────────────────────────────────────────────────
function Overview() {
  const { user } = useAuth();
  const [dash, setDash] = useState(null);

  useEffect(() => {
    studentAPI
      .dashboard()
      .then((r) => setDash(r.data))
      .catch(() => setDash(null));
  }, []);

  const doughnutData = dash
    ? {
        labels: ["Hadir", "Tidak Hadir"],
        datasets: [
          {
            data: [dash.present_count, dash.total_count - dash.present_count],
            backgroundColor: ["#0d1b3e", "#eef0f5"],
            borderWidth: 0,
          },
        ],
      }
    : null;

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <div className="greeting">Selamat datang,</div>
          <div className="greeting-name">{user?.name} 🎓</div>
        </div>
        <div className="topbar-right">
          <div className="date-chip">
            📅{" "}
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon navy">⭐</div>
          <div className="stat-info">
            <div className="stat-value">{dash?.points || 0}</div>
            <div className="stat-label">Total Poin</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info">
            <div className="stat-value">{dash?.present_count || 0}</div>
            <div className="stat-label">Hari Hadir (30 hari)</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gold">📊</div>
          <div className="stat-info">
            <div className="stat-value">
              {(dash?.attendance_rate || 0).toFixed(0)}%
            </div>
            <div className="stat-label">% Kehadiran</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">📝</div>
          <div className="stat-info">
            <div className="stat-value">
              {(dash?.avg_score || 0).toFixed(1)}
            </div>
            <div className="stat-label">Rata-rata Nilai</div>
          </div>
        </div>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}
      >
        {/* Donut chart kehadiran */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Kehadiran 30 Hari</span>
          </div>
          <div
            className="card-body"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {doughnutData && (
              <div
                style={{
                  position: "relative",
                  width: 160,
                  height: 160,
                  margin: "0 auto",
                }}
              >
                <Doughnut
                  data={doughnutData}
                  options={{
                    cutout: "70%",
                    plugins: { legend: { display: false } },
                    maintainAspectRatio: false,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      color: "var(--navy)",
                    }}
                  >
                    {(dash?.attendance_rate || 0).toFixed(0)}%
                  </div>
                  <div style={{ fontSize: 11, color: "var(--gray-400)" }}>
                    Hadir
                  </div>
                </div>
              </div>
            )}
            <div style={{ marginTop: 16, width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 13, color: "var(--gray-600)" }}>
                  Hadir
                </span>
                <span style={{ fontWeight: 700 }}>
                  {dash?.present_count || 0}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "var(--gray-600)" }}>
                  Total
                </span>
                <span style={{ fontWeight: 700 }}>
                  {dash?.total_count || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent grades */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📝 Nilai Terbaru</span>
          </div>
          <div className="card-body table-wrap">
            {dash?.grades?.length ? (
              <table>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Mata Pelajaran</th>
                    <th>Tipe</th>
                    <th>Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {(dash.grades || []).slice(0, 8).map((g) => (
                    <tr key={g.id}>
                      <td style={{ color: "var(--gray-400)", fontSize: 13 }}>
                        {g.date}
                      </td>
                      <td style={{ fontWeight: 600 }}>{g.subject}</td>
                      <td>
                        <span
                          className="badge"
                          style={{ background: "#dbeafe", color: "#1d4ed8" }}
                        >
                          {g.type}
                        </span>
                      </td>
                      <td
                        style={{
                          fontWeight: 700,
                          fontSize: 16,
                          color: g.score >= 75 ? "var(--green)" : "var(--red)",
                        }}
                      >
                        {g.score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <p>Belum ada nilai</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Grades ────────────────────────────────────────────────────────────────────
function GradesPage() {
  const [grades, setGrades] = useState([]);
  useEffect(() => {
    studentAPI.grades().then((r) => setGrades(r.data || []));
  }, []);

  const avg = grades.length
    ? (grades.reduce((s, g) => s + g.score, 0) / grades.length).toFixed(2)
    : 0;

  return (
    <>
      <div className="page-header">
        <div className="page-title">📝 Nilai Saya</div>
      </div>
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-icon navy">📊</div>
          <div className="stat-info">
            <div className="stat-value">{avg}</div>
            <div className="stat-label">Rata-rata Nilai</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gold">📝</div>
          <div className="stat-info">
            <div className="stat-value">{grades.length}</div>
            <div className="stat-label">Total Penilaian</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info">
            <div className="stat-value">
              {grades.filter((g) => g.score >= 75).length}
            </div>
            <div className="stat-label">Nilai ≥ 75</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">❌</div>
          <div className="stat-info">
            <div className="stat-value">
              {grades.filter((g) => g.score < 75).length}
            </div>
            <div className="stat-label">Nilai {"<"} 75</div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-body table-wrap">
          {grades.length ? (
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Mata Pelajaran</th>
                  <th>Tipe</th>
                  <th>Nilai</th>
                  <th>Catatan</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((g) => (
                  <tr key={g.id}>
                    <td style={{ color: "var(--gray-400)" }}>{g.date}</td>
                    <td style={{ fontWeight: 600 }}>{g.subject}</td>
                    <td>
                      <span
                        className="badge"
                        style={{ background: "#dbeafe", color: "#1d4ed8" }}
                      >
                        {g.type}
                      </span>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 16,
                            color:
                              g.score >= 75 ? "var(--green)" : "var(--red)",
                          }}
                        >
                          {g.score}
                        </span>
                        <div className="progress-wrap" style={{ width: 60 }}>
                          <div
                            className={`progress-bar ${g.score >= 75 ? "green" : ""}`}
                            style={{
                              width: `${g.score}%`,
                              background:
                                g.score < 75 ? "var(--red)" : undefined,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "var(--gray-400)", fontSize: 13 }}>
                      {g.notes || "–"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p>Belum ada nilai</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Attendance ────────────────────────────────────────────────────────────────
function AttendancePage() {
  const [records, setRecords] = useState([]);
  useEffect(() => {
    studentAPI.attendance().then((r) => setRecords(r.data || []));
  }, []);

  const counts = records.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <div className="page-header">
        <div className="page-title">✅ Kehadiran Saya</div>
      </div>
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        {["present", "absent", "sick", "permission"].map((s) => (
          <div key={s} className="stat-card">
            <div
              className={`stat-icon ${s === "present" ? "green" : s === "absent" ? "red" : s === "sick" ? "gold" : "blue"}`}
            >
              {s === "present"
                ? "✅"
                : s === "absent"
                  ? "❌"
                  : s === "sick"
                    ? "🤒"
                    : "📋"}
            </div>
            <div className="stat-info">
              <div className="stat-value">{counts[s] || 0}</div>
              <div className="stat-label">{STATUS_BADGE[s].label}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-body table-wrap">
          {records.length ? (
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => {
                  const cfg = STATUS_BADGE[r.status] || {
                    label: r.status,
                    cls: "",
                  };
                  return (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 500 }}>
                        {new Date(r.date).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td>
                        <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <p>Belum ada rekaman kehadiran</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  return (
    <div className="app-shell">
      <Sidebar navItems={NAV} basePath="/student" />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/grades" element={<GradesPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
        </Routes>
      </main>
    </div>
  );
}
