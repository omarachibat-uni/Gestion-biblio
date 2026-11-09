import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Lock,
  Mail,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Veuillez saisir votre adresse e-mail académique.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      if (!res.success) {
        setError(res.message || 'Identifiants invalides.');
      }
      setLoading(false);
    }, 300);
  };

  const handleQuickFill = (demoEmail: string, demoPass: string = 'password123') => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between p-4 md:p-8 font-sans">
      {/* Top institution banner */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-900 text-white flex items-center justify-center font-bold shadow-sm">
            <BookOpen className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              Université Sidi Mohamed Ben Abdellah
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Système Intégré de Gestion de Bibliothèque (SIGB - USMBA)
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Portail académique sécurisé</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto w-full my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6">
        {/* Left presentation / Academic Context */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 text-xs font-semibold">
              <GraduationCap className="w-4 h-4" />
              <span>Campus Fès · Bibliothèque Centrale & Facultés</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Gestion moderne des prêts, retours & ressources documentaires.
            </h2>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              Consultez le catalogue en temps réel, suivez vos emprunts en cours, recevez vos rappels de restitution et accédez à votre carte d'étudiant numérique avec QR code.
            </p>
          </div>

          {/* Quick Demo Selector */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Comptes de démonstration pré-configurés
              </span>
              <span className="text-[11px] text-slate-400">1 clic pour tester</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@usmba.ac.ma')}
                className="text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 hover:bg-sky-50/50 dark:hover:bg-sky-950/30 transition-all text-xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400">
                    Administrateur BU
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                    Admin
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] font-mono mt-0.5 truncate">
                  admin@usmba.ac.ma
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('ahmed.benali@usmba.ac.ma')}
                className="text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 hover:bg-sky-50/50 dark:hover:bg-sky-950/30 transition-all text-xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400">
                    Ahmed Benali
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono">
                    À jour 🟢
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] font-mono mt-0.5 truncate">
                  ahmed.benali@usmba.ac.ma
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('sara.amrani@usmba.ac.ma')}
                className="text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 transition-all text-xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
                    Sara Amrani
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-mono">
                    Retard 3j 🟡
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] font-mono mt-0.5 truncate">
                  sara.amrani@usmba.ac.ma
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('youssef.alaoui@usmba.ac.ma')}
                className="text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-950/30 transition-all text-xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400">
                    Youssef Alaoui
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-mono">
                    Retard 6j 🟠
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] font-mono mt-0.5 truncate">
                  youssef.alaoui@usmba.ac.ma
                </p>
              </button>
            </div>

            {/* Negative test controls */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span>Tester les sécurités :</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('inconnu@usmba.ac.ma')}
                  className="hover:underline text-rose-600 dark:text-rose-400"
                  title="Adresse USMBA mais étudiant non autorisé par l'admin"
                >
                  Non-inscrit
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => handleQuickFill('test@gmail.com')}
                  className="hover:underline text-rose-600 dark:text-rose-400"
                  title="Domaine non @usmba.ac.ma"
                >
                  Hors domaine
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-xl">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Authentification
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Entrez votre identifiant académique <span className="font-semibold text-sky-700 dark:text-sky-300">@usmba.ac.ma</span>
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Adresse e-mail académique
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="prenom.nom@usmba.ac.ma"
                    required
                    className="w-full pl-9 pr-3 py-2.5 text-xs md:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Doit obligatoirement se terminer par <code className="text-sky-700 dark:text-sky-300 font-mono">@usmba.ac.ma</code>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2.5 text-xs md:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-sky-900 hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-semibold text-xs md:text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
                >
                  {loading ? 'Vérification...' : 'Se connecter'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
              <p>
                Problème de compte ou nouvel étudiant ?{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Contactez le bureau des prêts
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto w-full pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
        © 2026 Université Sidi Mohamed Ben Abdellah · Bibliothèque Universitaire Centrale · Fès, Maroc
      </div>
    </div>
  );
};
