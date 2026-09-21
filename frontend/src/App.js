import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import "@/App.css";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Beranda from "@/pages/Beranda";
import Sertifikat from "@/pages/Sertifikat";
import Verifikasi from "@/pages/Verifikasi";
import MonitoringPegawai from "@/pages/MonitoringPegawai";
import MonitoringJPL from "@/pages/MonitoringJPL";
import Program from "@/pages/Program";
import InputSPM from "@/pages/InputSPM";
import MonitoringSPM from "@/pages/MonitoringSPM";
import EarlyWarning from "@/pages/EarlyWarning";
import PolicyBrief from "@/pages/PolicyBrief";
import Laporan from "@/pages/Laporan";
import Pengaturan from "@/pages/Pengaturan";
import Roadmap from "@/pages/Roadmap";

function Loader() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500" />
        <p className="text-sm text-slate-400">Memuat E-SPAK...</p>
      </div>
    </div>
  );
}

function Protected({ children, roles }) {
  const { user, ready } = useAuth();
  if (!ready || user === null) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

function LoginRoute() {
  const { user, ready } = useAuth();
  if (!ready) return <Loader />;
  if (user) return <Navigate to="/" replace />;
  return <Login />;
}

function App() {
  return (
    <div className="App">
      <Toaster position="top-right" richColors />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/" element={<Protected><Beranda /></Protected>} />
            <Route path="/sertifikat" element={<Protected roles={["pegawai", "pj_program"]}><Sertifikat /></Protected>} />
            <Route path="/verifikasi" element={<Protected roles={["admin"]}><Verifikasi /></Protected>} />
            <Route path="/monitoring-pegawai" element={<Protected roles={["admin", "kepala"]}><MonitoringPegawai /></Protected>} />
            <Route path="/monitoring-jpl" element={<Protected roles={["admin", "kepala"]}><MonitoringJPL /></Protected>} />
            <Route path="/program" element={<Protected roles={["admin", "pj_program"]}><Program /></Protected>} />
            <Route path="/input-spm" element={<Protected roles={["admin", "pj_program"]}><InputSPM /></Protected>} />
            <Route path="/monitoring-spm" element={<Protected roles={["admin", "kepala", "pj_program"]}><MonitoringSPM /></Protected>} />
            <Route path="/ews" element={<Protected roles={["admin", "kepala", "pj_program"]}><EarlyWarning /></Protected>} />
            <Route path="/policy-brief" element={<Protected roles={["admin", "kepala", "pj_program"]}><PolicyBrief /></Protected>} />
            <Route path="/laporan" element={<Protected roles={["admin", "kepala"]}><Laporan /></Protected>} />
            <Route path="/pengaturan" element={<Protected roles={["admin"]}><Pengaturan /></Protected>} />
            <Route path="/roadmap" element={<Protected><Roadmap /></Protected>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
