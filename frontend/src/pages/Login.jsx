import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { apiErr } from "@/lib/api";
import { Stethoscope, Eye, EyeOff, LogIn, Activity, ShieldCheck, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(identifier.trim(), password);
      toast.success("Berhasil masuk ke E-SPAK");
      navigate("/");
    } catch (err) {
      setError(apiErr(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-sky-600 via-cyan-600 to-teal-600 p-12 text-white lg:flex">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10" />
        <div className="absolute -bottom-24 -left-10 h-80 w-80 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 backdrop-blur">
            <Stethoscope className="h-6 w-6" />
          </div>
          <span className="font-heading text-2xl font-extrabold">E-SPAK</span>
        </div>
        <div className="relative">
          <h1 className="font-heading text-4xl font-extrabold leading-tight">
            Elektronik Sistem Pemantauan Kinerja dan Analisis Kesehatan
          </h1>
          <p className="mt-4 max-w-md text-sky-50/90">
            Pusat monitoring kinerja pegawai dan sistem peringatan dini capaian kesehatan Puskesmas Palaran.
          </p>
          <div className="mt-8 space-y-3">
            {[
              { icon: TrendingUp, t: "Monitoring JPL & sertifikat pegawai secara real-time" },
              { icon: Activity, t: "Dashboard capaian SPM dengan status hijau/kuning/merah" },
              { icon: ShieldCheck, t: "Early Warning System & Policy Brief untuk pimpinan" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-sky-50">
                <f.icon className="h-5 w-5 shrink-0" /> {f.t}
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-sky-100/70">© 2026 Puskesmas Palaran · Kota Samarinda</p>
      </div>

      {/* Right form */}
      <div className="flex w-full items-center justify-center bg-slate-50 p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 text-white shadow-lg">
              <Stethoscope className="h-7 w-7" />
            </div>
            <h1 className="font-heading text-2xl font-extrabold text-slate-900">E-SPAK</h1>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
            <h2 className="font-heading text-2xl font-bold text-slate-900">Masuk ke Akun Anda</h2>
            <p className="mt-1 text-sm text-slate-500">Gunakan Username atau NIP dan kata sandi Anda.</p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Username / NIP</label>
                <input
                  data-testid="login-identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="cth: admin atau NIP"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Kata Sandi</label>
                <div className="relative">
                  <input
                    data-testid="login-password"
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-11 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    required
                  />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-600">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-sky-600" />
                  Ingat saya
                </label>
                <button type="button" onClick={() => toast.info("Silakan hubungi Administrator untuk reset kata sandi.")} className="font-medium text-sky-600 hover:underline">
                  Lupa Password?
                </button>
              </div>

              {error && <div data-testid="login-error" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">{error}</div>}

              <button
                data-testid="login-submit"
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 py-3 font-heading font-semibold text-white shadow-lg transition hover:opacity-95 disabled:opacity-60"
              >
                <LogIn className="h-4 w-4" /> {loading ? "Memproses..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
