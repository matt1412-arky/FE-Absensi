import { useState, useEffect, useRef } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../context/AuthContext";
import {
  studentsAPI,
  classesAPI,
  attendanceAPI,
  gradesAPI,
  schedulesAPI,
  statsAPI,
} from "../../api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const NAV = [
  { type: "label", label: "Utama" },
  { path: "", icon: "🏠", label: "Dashboard" },
  { path: "/schedule", icon: "📅", label: "Jadwal Mengajar" },
  { type: "label", label: "Akademik" },
  { path: "/attendance", icon: "✅", label: "Input Absensi" },
  { path: "/grades", icon: "📝", label: "Input Nilai" },
  { path: "/students", icon: "👨‍🎓", label: "Data Siswa" },
  { type: "label", label: "Laporan" },
  { path: "/stats", icon: "📊", label: "Statistik" },
];

const DAYS_ID = [
  "",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];
const chartOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: "rgba(0,0,0,.05)" } },
  },
};

// ── Overview ─────────────────────────────────────────────────────────────────
function Overview() {
  const { user } = useAuth();
  const [dash, setDash] = useState(null);
  const [stats, setStats] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selClass, setSelClass] = useState("");

  useEffect(() => {
    statsAPI.dashboardAdmin().then((r) => setDash(r.data));
    classesAPI.list().then((r) => {
      setClasses(r.data);
      if (r.data[0]) {
        setSelClass(r.data[0].id);
        statsAPI.get({ class_id: r.data[0].id }).then((s) => setStats(s.data));
      }
    });
  }, []);

  useEffect(() => {
    if (selClass)
      statsAPI.get({ class_id: selClass }).then((r) => setStats(r.data));
  }, [selClass]);

  const att = dash?.today_attendance || {};
  const chartData = stats
    ? {
        labels: stats.students?.map((s) => s.name.split(" ")[0]) || [],
        datasets: [
          {
            label: "Nilai Rata-rata",
            data: stats.students?.map((s) => s.avg_score) || [],
            backgroundColor: "rgba(13,27,62,.75)",
            borderRadius: 8,
          },
        ],
      }
    : null;

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <div className="greeting">Selamat datang,</div>
          <div className="greeting-name">{user?.name || "Admin"} 👋</div>
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

      {/* Stat cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info">
            <div className="stat-value">{att.present || 0}</div>
            <div className="stat-label">Hadir Hari Ini</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">❌</div>
          <div className="stat-info">
            <div className="stat-value">{att.absent || 0}</div>
            <div className="stat-label">Tidak Hadir</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gold">🤒</div>
          <div className="stat-info">
            <div className="stat-value">{att.sick || 0}</div>
            <div className="stat-label">Sakit</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">📋</div>
          <div className="stat-info">
            <div className="stat-value">{att.permission || 0}</div>
            <div className="stat-label">Izin</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Jadwal hari ini */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📅 Jadwal Hari Ini</span>
          </div>
          <div className="card-body">
            {dash?.today_schedules?.length ? (
              dash.today_schedules.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: "1px solid var(--gray-100)",
                  }}
                >
                  <div
                    style={{
                      background: "var(--navy)",
                      color: "var(--gold)",
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.time}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{s.subject}</div>
                    <div style={{ color: "var(--gray-400)", fontSize: 13 }}>
                      {s.class?.name}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">😴</div>
                <p>Tidak ada jadwal hari ini</p>
              </div>
            )}
          </div>
        </div>

        {/* Chart nilai per kelas */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📊 Grafik Nilai</span>
            <select
              className="form-input form-select"
              style={{ width: 120, padding: "6px 10px", fontSize: 13 }}
              value={selClass}
              onChange={(e) => setSelClass(e.target.value)}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="card-body">
            <div className="chart-wrap">
              {chartData ? (
                <Bar data={chartData} options={chartOpts} />
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📊</div>
                  <p>Tidak ada data</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Schedule ──────────────────────────────────────────────────────────────────
function SchedulePage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    class_id: "",
    subject: "",
    day: 1,
    time: "08:00",
    end_time: "09:00",
  });

  const load = () => schedulesAPI.list().then((r) => setSchedules(r.data));
  useEffect(() => {
    load();
    classesAPI.list().then((r) => setClasses(r.data || []));
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({
      class_id: "",
      subject: "",
      day: 1,
      time: "08:00",
      end_time: "09:00",
    });
    setModal(true);
  };
  const openEdit = (s) => {
    setEditing(s);
    setForm({
      class_id: String(s.class_id),
      subject: s.subject,
      day: s.day,
      time: s.time,
      end_time: s.end_time || "",
    });
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      class_id: parseInt(form.class_id),
      day: parseInt(form.day),
      admin_id: user.id,
    };
    if (editing) await schedulesAPI.update(editing.id, payload);
    else await schedulesAPI.create(payload);
    setModal(false);
    load();
  };

  const grouped = DAYS_ID.slice(1, 7).map((day, i) => ({
    day: i + 1,
    label: day,
    slots: schedules
      .filter((s) => s.day === i + 1)
      .sort((a, b) => a.time.localeCompare(b.time)),
  }));

  return (
    <>
      <div className="page-header">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div className="page-title">📅 Jadwal Mengajar</div>
            <div className="page-subtitle">Atur jadwal mengajar per hari</div>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>
            + Tambah Jadwal
          </button>
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6,1fr)",
              gap: 12,
            }}
          >
            {grouped.map((g) => (
              <div key={g.day}>
                <div
                  style={{
                    textAlign: "center",
                    fontWeight: 700,
                    fontSize: 13,
                    color: "var(--gray-400)",
                    textTransform: "uppercase",
                    marginBottom: 10,
                    letterSpacing: 0.5,
                  }}
                >
                  {g.label}
                </div>
                {g.slots.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      background: "var(--navy)",
                      color: "white",
                      borderRadius: 10,
                      padding: 12,
                      marginBottom: 8,
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        color: "var(--gold)",
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {s.time}
                      {s.end_time ? ` – ${s.end_time}` : ""}
                    </div>
                    <div style={{ fontSize: 13, marginTop: 2 }}>
                      {s.subject}
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.7, marginTop: 3 }}>
                      🏫 {s.class?.name}
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        display: "flex",
                        gap: 4,
                      }}
                    >
                      <button
                        onClick={() => openEdit(s)}
                        style={{
                          background: "rgba(255,255,255,.15)",
                          border: "none",
                          color: "white",
                          cursor: "pointer",
                          borderRadius: 4,
                          width: 20,
                          height: 20,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                        }}
                      >
                        ✏
                      </button>
                      <button
                        onClick={() => schedulesAPI.delete(s.id).then(load)}
                        style={{
                          background: "rgba(255,255,255,.15)",
                          border: "none",
                          color: "white",
                          cursor: "pointer",
                          borderRadius: 4,
                          width: 20,
                          height: 20,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                {g.slots.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      color: "var(--gray-200)",
                      fontSize: 12,
                      padding: "20px 0",
                    }}
                  >
                    –
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {modal && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setModal(false)}
        >
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">
                {editing ? "✏️ Edit Jadwal" : "Tambah Jadwal"}
              </span>
              <button className="modal-close" onClick={() => setModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Kelas</label>
                    <select
                      className="form-input form-select"
                      value={form.class_id}
                      onChange={(e) =>
                        setForm({ ...form, class_id: e.target.value })
                      }
                      required
                    >
                      <option value="">-- Pilih Kelas --</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mata Pelajaran</label>
                    <input
                      className="form-input"
                      value={form.subject}
                      onChange={(e) =>
                        setForm({ ...form, subject: e.target.value })
                      }
                      placeholder="Matematika, Fisika, …"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Hari</label>
                    <select
                      className="form-input form-select"
                      value={form.day}
                      onChange={(e) =>
                        setForm({ ...form, day: e.target.value })
                      }
                    >
                      {DAYS_ID.slice(1, 7).map((d, i) => (
                        <option key={i + 1} value={i + 1}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Jam Mulai</label>
                    <input
                      className="form-input"
                      type="time"
                      value={form.time}
                      onChange={(e) =>
                        setForm({ ...form, time: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Jam Selesai</label>
                    <input
                      className="form-input"
                      type="time"
                      value={form.end_time}
                      onChange={(e) =>
                        setForm({ ...form, end_time: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group" />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setModal(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ── Attendance ────────────────────────────────────────────────────────────────
function AttendancePage() {
  const [classes, setClasses] = useState([]);
  const [selClass, setSelClass] = useState("");
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [statuses, setStatuses] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    classesAPI.list().then((r) => {
      setClasses(r.data);
      if (r.data[0]) setSelClass(String(r.data[0].id));
    });
  }, []);
  useEffect(() => {
    if (!selClass) return;
    studentsAPI.list(selClass).then((r) => setStudents(r.data));
    attendanceAPI
      .list({ class_id: selClass, start: date, end: date })
      .then((r) => {
        const map = {};
        r.data.forEach((a) => {
          map[a.student_id] = a.status;
        });
        setStatuses(map);
      });
  }, [selClass, date]);

  const mark = (studentId, status) =>
    setStatuses((prev) => ({ ...prev, [studentId]: status }));

  const saveAll = async () => {
    setSaving(true);
    await Promise.all(
      students
        .map((s) => {
          const status = statuses[s.id];
          if (!status) return null;
          return attendanceAPI.save({
            student_id: s.id,
            class_id: parseInt(selClass),
            date,
            status,
          });
        })
        .filter(Boolean),
    );
    setSaving(false);
    alert("Absensi tersimpan!");
  };

  const statusConfig = [
    { key: "present", label: "Hadir", cls: "hadir" },
    { key: "absent", label: "Absen", cls: "absen" },
    { key: "sick", label: "Sakit", cls: "sakit" },
    { key: "permission", label: "Izin", cls: "izin" },
  ];

  return (
    <>
      <div className="page-header">
        <div className="page-title">✅ Input Absensi</div>
        <div className="page-subtitle">Rekam kehadiran siswa</div>
      </div>
      <div className="card">
        <div className="card-header">
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <select
              className="form-input form-select"
              style={{ width: 160 }}
              value={selClass}
              onChange={(e) => setSelClass(e.target.value)}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              className="form-input"
              type="date"
              style={{ width: 160 }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <button className="btn btn-gold" onClick={saveAll} disabled={saving}>
            {saving ? "Menyimpan…" : "💾 Simpan Semua"}
          </button>
        </div>
        <div className="card-body table-wrap">
          {students.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👨‍🎓</div>
              <p>Pilih kelas terlebih dahulu</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nama Siswa</th>
                  <th>Poin</th>
                  <th>Status Kehadiran</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s.id}>
                    <td style={{ color: "var(--gray-400)" }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>
                      <span
                        style={{
                          background: "var(--gold-pale)",
                          color: "var(--navy)",
                          padding: "2px 10px",
                          borderRadius: 99,
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        ⭐ {s.points}
                      </span>
                    </td>
                    <td>
                      <div className="attendance-actions">
                        {statusConfig.map((sc) => (
                          <button
                            key={sc.key}
                            className={`att-btn ${sc.cls} ${statuses[s.id] === sc.key ? "active" : ""}`}
                            onClick={() => mark(s.id, sc.key)}
                          >
                            {sc.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

// ── Grades ────────────────────────────────────────────────────────────────────
function GradesPage() {
  const [classes, setClasses] = useState([]);
  const [selClass, setSelClass] = useState("");
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    student_id: "",
    subject: "",
    score: "",
    type: "tugas",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });
  const [sortCol, setSortCol] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  const load = (col = sortCol, dir = sortDir) => {
    if (selClass) {
      studentsAPI.list(selClass).then((r) => setStudents(r.data || []));
      gradesAPI
        .list({ class_id: selClass, order_by: col, sort: dir })
        .then((r) => setGrades(r.data || []));
    }
  };
  useEffect(() => {
    classesAPI.list().then((r) => {
      setClasses(r.data);
      if (r.data[0]) setSelClass(String(r.data[0].id));
    });
  }, []);
  useEffect(() => {
    load();
  }, [selClass]);

  const handleSort = (col) => {
    const newDir = sortCol === col && sortDir === "asc" ? "desc" : "asc";
    setSortCol(col);
    setSortDir(newDir);
    load(col, newDir);
  };

  const SortIcon = ({ col }) => (
    <span
      style={{
        marginLeft: 4,
        opacity: sortCol === col ? 1 : 0.3,
        fontSize: 11,
      }}
    >
      {sortCol === col ? (sortDir === "asc" ? "▲" : "▼") : "▲"}
    </span>
  );

  const openAdd = () => {
    setEditing(null);
    setForm({
      student_id: "",
      subject: "",
      score: "",
      type: "tugas",
      date: new Date().toISOString().slice(0, 10),
      notes: "",
    });
    setModal(true);
  };
  const openEdit = (g) => {
    setEditing(g);
    setForm({
      student_id: String(g.student_id),
      subject: g.subject,
      score: String(g.score),
      type: g.type,
      date: g.date,
      notes: g.notes || "",
    });
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      student_id: parseInt(form.student_id),
      class_id: parseInt(selClass),
      score: parseFloat(form.score),
    };
    if (editing) await gradesAPI.update(editing.id, payload);
    else await gradesAPI.create(payload);
    setModal(false);
    load();
  };

  const typeLabel = {
    tugas: "Tugas",
    ulangan: "Ulangan",
    uts: "UTS",
    uas: "UAS",
  };
  const typeBadge = { tugas: "blue", ulangan: "navy", uts: "gold", uas: "red" };
  const typeBadgeStyle = {
    navy: { background: "var(--navy)", color: "var(--gold)" },
    blue: { background: "#dbeafe", color: "#1d4ed8" },
    gold: { background: "var(--gold-pale)", color: "#92400e" },
    red: { background: "#fee2e2", color: "#dc2626" },
  };

  return (
    <>
      <div className="page-header">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div className="page-title">📝 Input Nilai</div>
            <div className="page-subtitle">Rekam nilai siswa</div>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>
            + Tambah Nilai
          </button>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Daftar Nilai</span>
          <select
            className="form-input form-select"
            style={{ width: 140 }}
            value={selClass}
            onChange={(e) => setSelClass(e.target.value)}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="card-body table-wrap">
          {grades.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p>Belum ada nilai</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th
                    onClick={() => handleSort("date")}
                    style={{ cursor: "pointer" }}
                  >
                    Tanggal <SortIcon col="date" />
                  </th>
                  <th>Siswa</th>
                  <th
                    onClick={() => handleSort("subject")}
                    style={{ cursor: "pointer" }}
                  >
                    Mata Pelajaran <SortIcon col="subject" />
                  </th>
                  <th
                    onClick={() => handleSort("type")}
                    style={{ cursor: "pointer" }}
                  >
                    Tipe <SortIcon col="type" />
                  </th>
                  <th
                    onClick={() => handleSort("score")}
                    style={{ cursor: "pointer" }}
                  >
                    Nilai <SortIcon col="score" />
                  </th>
                  <th>Catatan</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {grades.map((g) => {
                  const s = students.find((s) => s.id === g.student_id);
                  const tc = typeBadge[g.type] || "blue";
                  const ts = typeBadgeStyle[tc];
                  return (
                    <tr key={g.id}>
                      <td style={{ color: "var(--gray-400)" }}>{g.date}</td>
                      <td style={{ fontWeight: 600 }}>{s?.name || "–"}</td>
                      <td>{g.subject}</td>
                      <td>
                        <span
                          style={{
                            ...ts,
                            padding: "2px 10px",
                            borderRadius: 99,
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {typeLabel[g.type] || g.type}
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
                      <td style={{ color: "var(--gray-400)", fontSize: 13 }}>
                        {g.notes || "–"}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => openEdit(g)}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                              if (
                                confirm(
                                  "Hapus nilai? Data bisa dipulihkan nanti.",
                                )
                              )
                                gradesAPI.delete(g.id).then(load);
                            }}
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setModal(false)}
        >
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">
                {editing ? "✏️ Edit Nilai" : "Tambah Nilai"}
              </span>
              <button className="modal-close" onClick={() => setModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Siswa</label>
                    <select
                      className="form-input form-select"
                      value={form.student_id}
                      onChange={(e) =>
                        setForm({ ...form, student_id: e.target.value })
                      }
                      required
                    >
                      <option value="">-- Pilih Siswa --</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mata Pelajaran</label>
                    <input
                      className="form-input"
                      value={form.subject}
                      onChange={(e) =>
                        setForm({ ...form, subject: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tipe</label>
                    <select
                      className="form-input form-select"
                      value={form.type}
                      onChange={(e) =>
                        setForm({ ...form, type: e.target.value })
                      }
                    >
                      <option value="tugas">Tugas</option>
                      <option value="ulangan">Ulangan</option>
                      <option value="uts">UTS</option>
                      <option value="uas">UAS</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nilai (0–100)</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      max="100"
                      value={form.score}
                      onChange={(e) =>
                        setForm({ ...form, score: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tanggal</label>
                    <input
                      className="form-input"
                      type="date"
                      value={form.date}
                      onChange={(e) =>
                        setForm({ ...form, date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Catatan</label>
                    <input
                      className="form-input"
                      value={form.notes}
                      onChange={(e) =>
                        setForm({ ...form, notes: e.target.value })
                      }
                      placeholder="Opsional"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setModal(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ── Students ──────────────────────────────────────────────────────────────────
function StudentsPage() {
  const [classes, setClasses] = useState([]);
  const [selClass, setSelClass] = useState("");
  const [students, setStudents] = useState([]);
  const [deleted, setDeleted] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", class_id: "", points: 0 });
  const [sortCol, setSortCol] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [pointModal, setPointModal] = useState(false);
  const [pointTarget, setPointTarget] = useState(null);
  const [pointHistory, setPointHistory] = useState([]);
  const [pointForm, setPointForm] = useState({ delta: "", reason: "" });
  const [pointMsg, setPointMsg] = useState("");

  const load = (col = sortCol, dir = sortDir) => {
    if (selClass)
      studentsAPI
        .list(selClass, col, dir)
        .then((r) => setStudents(r.data || []));
    studentsAPI.listDeleted().then((r) => setDeleted(r.data || []));
  };
  useEffect(() => {
    classesAPI.list().then((r) => {
      setClasses(r.data);
      if (r.data[0]) setSelClass(String(r.data[0].id));
    });
  }, []);
  useEffect(() => {
    load();
  }, [selClass]);

  const handleSort = (col) => {
    const newDir = sortCol === col && sortDir === "asc" ? "desc" : "asc";
    setSortCol(col);
    setSortDir(newDir);
    load(col, newDir);
  };

  const SortIcon = ({ col }) => (
    <span
      style={{
        marginLeft: 4,
        opacity: sortCol === col ? 1 : 0.3,
        fontSize: 11,
      }}
    >
      {sortCol === col ? (sortDir === "asc" ? "▲" : "▼") : "▲"}
    </span>
  );

  const openPointModal = async (s) => {
    setPointTarget(s);
    setPointForm({ delta: "", reason: "" });
    setPointMsg("");
    const r = await studentsAPI.getPointHistory(s.id);
    setPointHistory(r.data || []);
    setPointModal(true);
  };

  const submitPoint = async (e) => {
    e.preventDefault();
    setPointMsg("");
    const delta = parseInt(pointForm.delta);
    if (isNaN(delta) || delta === 0) {
      setPointMsg("Delta tidak boleh 0");
      return;
    }
    if (!pointForm.reason.trim()) {
      setPointMsg("Alasan tidak boleh kosong");
      return;
    }
    try {
      const r = await studentsAPI.addPoint(
        pointTarget.id,
        delta,
        pointForm.reason,
      );
      setPointTarget((prev) => ({ ...prev, points: r.data.points }));
      setPointForm({ delta: "", reason: "" });
      setPointMsg(`✅ Poin berhasil ${delta > 0 ? "ditambah" : "dikurangi"}!`);
      const h = await studentsAPI.getPointHistory(pointTarget.id);
      setPointHistory(h.data || []);
      load();
    } catch (err) {
      setPointMsg("❌ " + (err.response?.data?.error || "Gagal update poin"));
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", class_id: selClass, points: 0 });
    setModal(true);
  };
  const openEdit = (s) => {
    setEditing(s);
    setForm({ name: s.name, class_id: String(s.class_id), points: s.points });
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const classId = parseInt(form.class_id) || parseInt(selClass);
    if (!classId) {
      alert("Pilih kelas terlebih dahulu");
      return;
    }
    if (editing) {
      await studentsAPI.update(editing.id, {
        name: form.name,
        class_id: classId,
        points: parseInt(form.points) || 0,
      });
    } else {
      await studentsAPI.create({
        name: form.name,
        class_id: classId,
        points: parseInt(form.points) || 0,
      });
    }
    setModal(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus siswa? Data bisa dipulihkan nanti.")) return;
    await studentsAPI.delete(id);
    load();
  };

  const handleRestore = async (id) => {
    await studentsAPI.restore(id);
    load();
  };

  return (
    <>
      <div className="page-header">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div className="page-title">👨‍🎓 Data Siswa</div>
            <div className="page-subtitle">Kelola data siswa per kelas</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {deleted.length > 0 && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowDeleted(!showDeleted)}
              >
                {showDeleted ? "✅ Aktif" : `🗑 Terhapus (${deleted.length})`}
              </button>
            )}
            <button className="btn btn-primary" onClick={openAdd}>
              + Tambah Siswa
            </button>
          </div>
        </div>
      </div>

      {/* Tabel data terhapus */}
      {showDeleted && (
        <div
          className="card"
          style={{ marginBottom: 16, border: "2px solid var(--red)" }}
        >
          <div className="card-header">
            <span className="card-title" style={{ color: "var(--red)" }}>
              🗑 Siswa Terhapus
            </span>
          </div>
          <div className="card-body table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Kelas</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {deleted.map((s) => (
                  <tr key={s.id} style={{ opacity: 0.7 }}>
                    <td style={{ textDecoration: "line-through" }}>{s.name}</td>
                    <td>{s.class?.name || "–"}</td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: "var(--green)" }}
                        onClick={() => handleRestore(s.id)}
                      >
                        ♻️ Pulihkan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span className="card-title">Siswa Kelas</span>
          <select
            className="form-input form-select"
            style={{ width: 140 }}
            value={selClass}
            onChange={(e) => setSelClass(e.target.value)}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="card-body table-wrap">
          {students.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👨‍🎓</div>
              <p>Belum ada siswa di kelas ini</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th
                    onClick={() => handleSort("name")}
                    style={{ cursor: "pointer" }}
                  >
                    Nama <SortIcon col="name" />
                  </th>
                  <th>Kelas</th>
                  <th
                    onClick={() => handleSort("points")}
                    style={{ cursor: "pointer" }}
                  >
                    Poin <SortIcon col="points" />
                  </th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s.id}>
                    <td style={{ color: "var(--gray-400)" }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>{s.class?.name || "–"}</td>
                    <td>
                      <span
                        onClick={() => openPointModal(s)}
                        style={{
                          background: "var(--gold-pale)",
                          color: "var(--navy)",
                          padding: "2px 12px",
                          borderRadius: 99,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                        title="Kelola Poin"
                      >
                        ⭐ {s.points}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => openEdit(s)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => openPointModal(s)}
                          title="Kelola Poin"
                        >
                          🏅
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(s.id)}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setModal(false)}
        >
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">
                {editing ? "✏️ Edit Siswa" : "Tambah Siswa"}
              </span>
              <button className="modal-close" onClick={() => setModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama Siswa</label>
                  <input
                    className="form-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Kelas</label>
                    <select
                      className="form-input form-select"
                      value={form.class_id}
                      onChange={(e) =>
                        setForm({ ...form, class_id: e.target.value })
                      }
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Poin Awal</label>
                    <input
                      className="form-input"
                      type="number"
                      value={form.points}
                      onChange={(e) =>
                        setForm({ ...form, points: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setModal(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kelola Poin */}
      {pointModal && pointTarget && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setPointModal(false)}
        >
          <div className="modal" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <span className="modal-title">🏅 Poin — {pointTarget.name}</span>
              <button
                className="modal-close"
                onClick={() => setPointModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {/* Current Points */}
              <div
                style={{
                  textAlign: "center",
                  marginBottom: 16,
                  padding: "12px",
                  background: "var(--gold-pale)",
                  borderRadius: 10,
                }}
              >
                <div style={{ fontSize: 13, color: "var(--gray-400)" }}>
                  Total Poin Saat Ini
                </div>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: "var(--navy)",
                  }}
                >
                  ⭐ {pointTarget.points}
                </div>
              </div>

              {/* Form tambah/kurang poin */}
              <form onSubmit={submitPoint}>
                {pointMsg && (
                  <div
                    style={{
                      background: pointMsg.startsWith("✅")
                        ? "#dcfce7"
                        : "#fee2e2",
                      color: pointMsg.startsWith("✅") ? "#15803d" : "#dc2626",
                      padding: "8px 12px",
                      borderRadius: 8,
                      fontSize: 13,
                      marginBottom: 12,
                    }}
                  >
                    {pointMsg}
                  </div>
                )}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Delta Poin</label>
                    <input
                      className="form-input"
                      type="number"
                      value={pointForm.delta}
                      onChange={(e) =>
                        setPointForm({ ...pointForm, delta: e.target.value })
                      }
                      placeholder="Contoh: +10 atau -5"
                      required
                    />
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--gray-400)",
                        marginTop: 4,
                      }}
                    >
                      Positif = tambah, negatif = kurang
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Alasan</label>
                    <input
                      className="form-input"
                      value={pointForm.reason}
                      onChange={(e) =>
                        setPointForm({ ...pointForm, reason: e.target.value })
                      }
                      placeholder="Contoh: Juara lomba, Terlambat..."
                      required
                    />
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "flex-end",
                    marginBottom: 16,
                  }}
                >
                  <button type="submit" className="btn btn-primary btn-sm">
                    Simpan Poin
                  </button>
                </div>
              </form>

              {/* History */}
              <div
                style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}
              >
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>
                  📋 Riwayat Perubahan Poin
                </div>
                {pointHistory.length === 0 ? (
                  <div
                    style={{
                      color: "var(--gray-400)",
                      fontSize: 13,
                      textAlign: "center",
                      padding: "12px 0",
                    }}
                  >
                    Belum ada riwayat
                  </div>
                ) : (
                  <div style={{ maxHeight: 220, overflowY: "auto" }}>
                    {pointHistory.map((h) => (
                      <div
                        key={h.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 0",
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>
                            {h.reason}
                          </div>
                          <div
                            style={{ fontSize: 11, color: "var(--gray-400)" }}
                          >
                            {new Date(h.created_at).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </div>
                        </div>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 15,
                            color: h.delta > 0 ? "#15803d" : "#dc2626",
                            minWidth: 50,
                            textAlign: "right",
                          }}
                        >
                          {h.delta > 0 ? "+" : ""}
                          {h.delta}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setPointModal(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Stats ─────────────────────────────────────────────────────────────────────
function StatsPage() {
  const [classes, setClasses] = useState([]);
  const [selClass, setSelClass] = useState("");
  const [stats, setStats] = useState(null);
  const [start, setStart] = useState(
    new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
  );
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    classesAPI.list().then((r) => {
      setClasses(r.data);
      if (r.data[0]) setSelClass(String(r.data[0].id));
    });
  }, []);
  useEffect(() => {
    if (selClass)
      statsAPI
        .get({ class_id: selClass, start, end })
        .then((r) => setStats(r.data));
  }, [selClass, start, end]);

  const chartData = stats
    ? {
        labels: stats.students?.map((s) => s.name.split(" ")[0]) || [],
        datasets: [
          {
            label: "Nilai Rata-rata",
            data: stats.students?.map((s) => s.avg_score) || [],
            backgroundColor: "rgba(13,27,62,.8)",
            borderRadius: 6,
          },
          {
            label: "% Kehadiran",
            data: stats.students?.map((s) => s.attendance_rate) || [],
            backgroundColor: "rgba(201,168,76,.8)",
            borderRadius: 6,
          },
        ],
      }
    : null;

  return (
    <>
      <div className="page-header">
        <div className="page-title">📊 Statistik</div>
        <div className="page-subtitle">Analisis nilai dan kehadiran</div>
      </div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div
          className="card-body"
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <select
            className="form-input form-select"
            style={{ width: 150 }}
            value={selClass}
            onChange={(e) => setSelClass(e.target.value)}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            className="form-input"
            type="date"
            style={{ width: 160 }}
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
          <span style={{ color: "var(--gray-400)" }}>s/d</span>
          <input
            className="form-input"
            type="date"
            style={{ width: 160 }}
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
      </div>

      {chartData && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <span className="card-title">Perbandingan Nilai & Kehadiran</span>
          </div>
          <div className="card-body">
            <div className="chart-wrap">
              <Bar
                data={chartData}
                options={{
                  ...chartOpts,
                  plugins: { legend: { display: true } },
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span className="card-title">Detail Siswa</span>
        </div>
        <div className="card-body table-wrap">
          {stats?.students?.length ? (
            <table>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Kelas</th>
                  <th>Poin</th>
                  <th>Hadir</th>
                  <th>Total</th>
                  <th>% Hadir</th>
                  <th>Rata Nilai</th>
                </tr>
              </thead>
              <tbody>
                {stats.students.map((s) => (
                  <tr key={s.student_id}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>{s.class_name}</td>
                    <td>
                      <span
                        style={{
                          background: "var(--gold-pale)",
                          color: "var(--navy)",
                          padding: "2px 10px",
                          borderRadius: 99,
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        ⭐ {s.points}
                      </span>
                    </td>
                    <td>{s.present_count}</td>
                    <td>{s.total_count}</td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div className="progress-wrap" style={{ width: 80 }}>
                          <div
                            className="progress-bar green"
                            style={{
                              width: `${Math.min(s.attendance_rate, 100)}%`,
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>
                          {s.attendance_rate?.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td
                      style={{
                        fontWeight: 700,
                        color:
                          s.avg_score >= 75 ? "var(--green)" : "var(--red)",
                      }}
                    >
                      {s.avg_score?.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <p>Tidak ada data</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  return (
    <div className="app-shell">
      <Sidebar navItems={NAV} basePath="/admin" />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/grades" element={<GradesPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </main>
    </div>
  );
}
