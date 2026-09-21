import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { ROLE_LABEL } from "@/components/common";
import {
  LayoutDashboard, Users, Award, BadgeCheck, TrendingUp, ClipboardList, Activity,
  FileText, AlertTriangle, Settings, LogOut, Bell, Menu, X, Stethoscope, ListChecks,
  BarChart3, ScrollText, Map, UserCircle, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const MENU = [
  { section: "Utama", items: [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "kepala", "pj_program"] },
    { to: "/", label: "Dashboard Saya", icon: LayoutDashboard, roles: ["pegawai"] },
  ]},
  { section: "Kinerja Pegawai", roles: ["admin", "kepala"], items: [
    { to: "/monitoring-pegawai", label: "Monitoring Pegawai", icon: Users, roles: ["admin", "kepala"] },
    { to: "/monitoring-jpl", label: "Monitoring JPL", icon: TrendingUp, roles: ["admin", "kepala"] },
    { to: "/analitik-pegawai", label: "Analitik Pegawai", icon: BarChart3, roles: ["admin", "kepala"] },
    { to: "/verifikasi", label: "Verifikasi Sertifikat", icon: BadgeCheck, roles: ["admin"] },
  ]},
  { section: "Sertifikat Saya", roles: ["pegawai", "pj_program"], items: [
    { to: "/sertifikat", label: "Sertifikat & JPL", icon: Award, roles: ["pegawai", "pj_program"] },
  ]},
  { section: "Program & SPM", roles: ["admin", "kepala", "pj_program"], items: [
    { to: "/program", label: "Program & Indikator", icon: ListChecks, roles: ["admin", "pj_program"] },
    { to: "/input-spm", label: "Input Data SPM", icon: ClipboardList, roles: ["admin", "pj_program"] },
    { to: "/monitoring-spm", label: "Monitoring SPM", icon: Activity, roles: ["admin", "kepala", "pj_program"] },
  ]},
  { section: "Analisis & Tindak Lanjut", roles: ["admin", "kepala", "pj_program"], items: [
    { to: "/ews", label: "Early Warning System", icon: AlertTriangle, roles: ["admin", "kepala", "pj_program"] },
    { to: "/policy-brief", label: "Policy Brief", icon: ScrollText, roles: ["admin", "kepala", "pj_program"] },
    { to: "/laporan", label: "Laporan & Export", icon: FileText, roles: ["admin", "kepala"] },
  ]},
  { section: "Pengaturan", roles: ["admin"], items: [
    { to: "/pengaturan", label: "Pengaturan Sistem", icon: Settings, roles: ["admin"] },
  ]},
  { section: "Informasi", items: [
    { to: "/roadmap", label: "Roadmap Implementasi", icon: Map, roles: ["admin", "kepala", "pj_program", "pegawai"] },
  ]},
];

function NotifBell() {
  const [data, setData] = useState({ notifications: [], unread: 0 });
  const load = () => api.get("/notifications").then((r) => setData(r.data)).catch(() => {});
  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);
  const markAll = async () => {
    await api.put("/notifications/read-all");
    load();
  };
  const toneDot = { success: "bg-emerald-500", error: "bg-rose-500", info: "bg-sky-500" };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button data-testid="notif-bell" className="relative grid h-10 w-10 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100">
          <Bell className="h-5 w-5" />
          {data.unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              {data.unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b p-3">
          <p className="font-heading font-semibold text-slate-800">Notifikasi</p>
          <button onClick={markAll} data-testid="notif-mark-all" className="text-xs font-medium text-sky-600 hover:underline">Tandai dibaca</button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {data.notifications.length === 0 && <p className="p-6 text-center text-sm text-slate-400">Tidak ada notifikasi</p>}
          {data.notifications.map((n) => (
            <div key={n.id} className={cn("flex gap-3 border-b p-3 text-sm", !n.is_read && "bg-sky-50/50")}>
              <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", toneDot[n.tipe] || "bg-slate-400")} />
              <div>
                <p className="font-medium text-slate-800">{n.judul}</p>
                <p className="text-xs text-slate-500">{n.pesan}</p>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const canSee = (roles) => !roles || roles.includes(user.role);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-100 px-5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 text-white shadow">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <p className="font-heading text-lg font-extrabold leading-none text-slate-900">E-SPAK</p>
            <p className="text-[10px] font-medium text-slate-400">Puskesmas Palaran</p>
          </div>
        </div>
        <nav className="h-[calc(100vh-4rem)] overflow-y-auto px-3 py-4">
          {MENU.filter((g) => canSee(g.roles)).map((group) => {
            const items = group.items.filter((it) => canSee(it.roles));
            if (items.length === 0) return null;
            return (
              <div key={group.section} className="mb-4">
                <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{group.section}</p>
                {items.map((it) => (
                  <NavLink
                    key={it.to + it.label}
                    to={it.to}
                    end={it.to === "/"}
                    data-testid={`nav-${it.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                    className={({ isActive }) => cn(
                      "mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                      isActive ? "bg-gradient-to-r from-sky-500 to-teal-500 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <it.icon className="h-[18px] w-[18px]" />
                    {it.label}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button className="grid h-10 w-10 place-items-center rounded-lg text-slate-500 lg:hidden" onClick={() => setOpen(!open)} data-testid="sidebar-toggle">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="hidden sm:block">
              <p className="text-xs text-slate-400">Selamat datang,</p>
              <p className="font-heading text-sm font-semibold text-slate-800">{user.nama}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotifBell />
            <Popover>
              <PopoverTrigger asChild>
                <button data-testid="user-menu" className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-3 transition hover:bg-slate-50">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-teal-500 text-white">
                    <UserCircle className="h-5 w-5" />
                  </span>
                  <span className="hidden text-left sm:block">
                    <span className="block text-xs font-semibold text-slate-700">{ROLE_LABEL[user.role]}</span>
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-56 p-2">
                <div className="border-b px-2 pb-2">
                  <p className="font-heading text-sm font-semibold text-slate-800">{user.nama}</p>
                  <p className="text-xs text-slate-500">{user.jabatan || ROLE_LABEL[user.role]}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-slate-400">NIP {user.nip || "-"}</p>
                </div>
                <button
                  onClick={async () => { await logout(); navigate("/login"); }}
                  data-testid="logout-btn"
                  className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" /> Keluar
                </button>
              </PopoverContent>
            </Popover>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl animate-fade-up">{children}</div>
        </main>
      </div>
    </div>
  );
}
