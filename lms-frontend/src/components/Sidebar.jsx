import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";

function Sidebar({ navItems, basePath }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassModal, setShowPassModal] = useState(false);
  const [passForm, setPassForm] = useState({
    old_password: "",
    new_password: "",
    confirm: "",
  });
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const initials = (name = "") =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const openPassModal = () => {
    setPassForm({ old_password: "", new_password: "", confirm: "" });
    setPassError("");
    setPassSuccess("");
    setShowPassModal(true);
  };

  const handleChangePass = async (e) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");
    if (passForm.new_password !== passForm.confirm) {
      setPassError("Password baru dan konfirmasi tidak sama");
      return;
    }
    if (passForm.new_password.length < 6) {
      setPassError("Password minimal 6 karakter");
      return;
    }
    setLoading(true);
    try {
      await api.put("/auth/change-password", {
        old_password: passForm.old_password,
        new_password: passForm.new_password,
      });
      setPassSuccess("Password berhasil diubah!");
      setTimeout(() => setShowPassModal(false), 1500);
    } catch (err) {
      setPassError(err.response?.data?.error || "Gagal mengubah password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img
            src="/logo.png"
            alt="Gonzaga"
            onError={(e) => (e.target.style.display = "none")}
          />
          <div className="sidebar-brand-text">
            <div className="brand-main">Kolese Gonzaga</div>
            <div className="brand-sub">Learning Management</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, i) =>
            item.type === "label" ? (
              <div key={i} className="nav-section-label">
                {item.label}
              </div>
            ) : (
              <div
                key={item.path}
                className={`nav-item ${location.pathname === `${basePath}${item.path}` ? "active" : ""}`}
                onClick={() => navigate(`${basePath}${item.path}`)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </div>
            ),
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials(user?.name)}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">
                {user?.name || user?.username}
              </div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
            <button
              className="logout-btn"
              onClick={openPassModal}
              title="Ganti Password"
              style={{ marginRight: 4 }}
            >
              🔑
            </button>
            <button
              className="logout-btn"
              onClick={handleLogout}
              title="Logout"
            >
              ⏻
            </button>
          </div>
        </div>
      </aside>

      {showPassModal && (
        <div
          className="modal-overlay"
          style={{ zIndex: 300 }}
          onClick={(e) =>
            e.target === e.currentTarget && setShowPassModal(false)
          }
        >
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">🔑 Ganti Password</span>
              <button
                className="modal-close"
                onClick={() => setShowPassModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleChangePass}>
              <div className="modal-body">
                {passError && (
                  <div
                    style={{
                      background: "#fee2e2",
                      color: "#dc2626",
                      padding: "10px 14px",
                      borderRadius: 8,
                      fontSize: 13,
                      marginBottom: 14,
                    }}
                  >
                    ⚠ {passError}
                  </div>
                )}
                {passSuccess && (
                  <div
                    style={{
                      background: "#dcfce7",
                      color: "#15803d",
                      padding: "10px 14px",
                      borderRadius: 8,
                      fontSize: 13,
                      marginBottom: 14,
                    }}
                  >
                    ✅ {passSuccess}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Password Lama</label>
                  <input
                    className="form-input"
                    type="password"
                    value={passForm.old_password}
                    onChange={(e) =>
                      setPassForm({ ...passForm, old_password: e.target.value })
                    }
                    required
                    placeholder="Masukkan password lama"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password Baru</label>
                  <input
                    className="form-input"
                    type="password"
                    value={passForm.new_password}
                    onChange={(e) =>
                      setPassForm({ ...passForm, new_password: e.target.value })
                    }
                    required
                    placeholder="Minimal 6 karakter"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Konfirmasi Password Baru</label>
                  <input
                    className="form-input"
                    type="password"
                    value={passForm.confirm}
                    onChange={(e) =>
                      setPassForm({ ...passForm, confirm: e.target.value })
                    }
                    required
                    placeholder="Ulangi password baru"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowPassModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Menyimpan…" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
