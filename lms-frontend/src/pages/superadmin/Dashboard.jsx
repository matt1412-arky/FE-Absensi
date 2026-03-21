import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../context/AuthContext";
import { usersAPI, classesAPI } from "../../api";

const NAV = [
  { type: "label", label: "Manajemen" },
  { path: "", icon: "🏠", label: "Overview" },
  { path: "/users", icon: "👥", label: "Kelola User" },
  { path: "/classes", icon: "🏫", label: "Kelola Kelas" },
  { type: "label", label: "Akses Penuh" },
  { path: "/admin-panel", icon: "📊", label: "Panel Admin" },
];

// ── Overview ─────────────────────────────────────────────────────────────────
function Overview() {
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  useEffect(() => {
    usersAPI.list().then((r) => setUsers(r.data || []));
    classesAPI.list().then((r) => setClasses(r.data || []));
  }, []);
  const admins = users.filter((u) => u.role === "admin").length;
  const students = users.filter((u) => u.role === "student").length;
  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <div className="greeting">Selamat datang kembali,</div>
          <div className="greeting-name">Super Admin 👑</div>
        </div>
        <div className="topbar-right">
          <div className="date-chip">
            📅{" "}
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon navy">👥</div>
          <div className="stat-info">
            <div className="stat-value">{users.length}</div>
            <div className="stat-label">Total User</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gold">🎓</div>
          <div className="stat-info">
            <div className="stat-value">{students}</div>
            <div className="stat-label">Siswa</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">👨‍🏫</div>
          <div className="stat-info">
            <div className="stat-value">{admins}</div>
            <div className="stat-label">Guru / Admin</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">🏫</div>
          <div className="stat-info">
            <div className="stat-value">{classes.length}</div>
            <div className="stat-label">Kelas</div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Daftar User Terbaru</span>
        </div>
        <div className="card-body table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Username</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 10).map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td style={{ color: "var(--gray-400)" }}>{u.username}</td>
                  <td>
                    <span className={`badge badge-${u.role}`}>{u.role}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ── Users Management ──────────────────────────────────────────────────────────
function UsersPage() {
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    username: "",
    password: "",
    name: "",
    role: "student",
    class_id: "",
  });

  const load = () => {
    usersAPI.list().then((r) => setUsers(r.data || []));
    classesAPI.list().then((r) => setClasses(r.data || []));
  };
  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({
      username: "",
      password: "",
      name: "",
      role: "student",
      class_id: "",
    });
    setModal(true);
  };
  const openEdit = (u) => {
    setEditing(u);
    setForm({
      username: u.username,
      password: "",
      name: u.name,
      role: u.role,
      class_id: u.class_id || "",
    });
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      class_id: form.class_id ? parseInt(form.class_id) : null,
    };
    if (!payload.password) delete payload.password;
    if (editing) await usersAPI.update(editing.id, payload);
    else await usersAPI.create(payload);
    setModal(false);
    load();
  };

  const remove = async (id) => {
    if (!confirm("Hapus user ini?")) return;
    await usersAPI.delete(id);
    load();
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">Kelola User</div>
        <div className="page-subtitle">Tambah, edit, dan hapus akun user</div>
      </div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Semua User</span>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            + Tambah User
          </button>
        </div>
        <div className="card-body table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Username</th>
                <th>Role</th>
                <th>Kelas</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ color: "var(--gray-400)" }}>{u.username}</td>
                  <td>
                    <span className={`badge badge-${u.role}`}>{u.role}</span>
                  </td>
                  <td>
                    {u.class_id
                      ? classes.find((c) => c.id === u.class_id)?.name || "-"
                      : "-"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => openEdit(u)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => remove(u.id)}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                {editing ? "Edit" : "Tambah"} User
              </span>
              <button className="modal-close" onClick={() => setModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama Lengkap</label>
                  <input
                    className="form-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                      className="form-input"
                      value={form.username}
                      onChange={(e) =>
                        setForm({ ...form, username: e.target.value })
                      }
                      required={!editing}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Password {editing && "(kosong = tidak ganti)"}
                    </label>
                    <input
                      className="form-input"
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      required={!editing}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select
                      className="form-input form-select"
                      value={form.role}
                      onChange={(e) =>
                        setForm({ ...form, role: e.target.value })
                      }
                    >
                      <option value="superadmin">Super Admin</option>
                      <option value="admin">Admin / Guru</option>
                      <option value="student">Siswa</option>
                    </select>
                  </div>
                  {form.role === "student" && (
                    <div className="form-group">
                      <label className="form-label">Kelas</label>
                      <select
                        className="form-input form-select"
                        value={form.class_id}
                        onChange={(e) =>
                          setForm({ ...form, class_id: e.target.value })
                        }
                      >
                        <option value="">-- Pilih Kelas --</option>
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
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

// ── Classes Management ────────────────────────────────────────────────────────
function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");

  const load = () => {
    classesAPI.list().then((r) => setClasses(r.data || []));
  };
  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setName("");
    setModal(true);
  };
  const openEdit = (c) => {
    setEditing(c);
    setName(c.name);
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (editing) await classesAPI.update(editing.id, { name });
    else await classesAPI.create({ name });
    setModal(false);
    load();
  };

  const remove = async (id) => {
    if (!confirm("Hapus kelas?")) return;
    await classesAPI.delete(id);
    load();
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">Kelola Kelas</div>
        <div className="page-subtitle">Tambah dan kelola kelas</div>
      </div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Daftar Kelas</span>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            + Tambah Kelas
          </button>
        </div>
        <div className="card-body table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nama Kelas</th>
                <th>Dibuat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c, i) => (
                <tr key={c.id}>
                  <td style={{ color: "var(--gray-400)" }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>🏫 {c.name}</td>
                  <td style={{ color: "var(--gray-400)" }}>
                    {new Date(c.created_at).toLocaleDateString("id-ID")}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => openEdit(c)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => remove(c.id)}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                {editing ? "Edit" : "Tambah"} Kelas
              </span>
              <button className="modal-close" onClick={() => setModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">
                    Nama Kelas (cth: X-A, XI-IPA-1)
                  </label>
                  <input
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama kelas"
                    required
                  />
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

// ── Shell ─────────────────────────────────────────────────────────────────────
export default function SuperAdminDashboard() {
  return (
    <div className="app-shell">
      <Sidebar navItems={NAV} basePath="/superadmin" />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route
            path="/admin-panel"
            element={
              <div className="page-header">
                <div className="page-title">Panel Admin</div>
                <div className="page-subtitle">
                  Gunakan menu Admin untuk fitur lengkap
                </div>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
