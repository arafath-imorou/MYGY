"use client";

import Link from "next/link";
import { ShieldCheck, Scissors, Sparkles, ArrowRight, CheckCircle2, Server, Database, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gy-dark flex flex-col justify-between relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-gy-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-gy-gold/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="border-b border-gy-border/60 backdrop-blur-md sticky top-0 z-50 bg-gy-dark/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center font-serif text-black font-bold text-xl shadow-gold">
              GY
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold tracking-wide text-white">GY MAISON COUTURE</h1>
              <p className="text-xs text-gy-gold font-medium tracking-wider uppercase">ERP Centralisé & Workflows Haute Couture</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2" />
              Base Centralisée Synchro (Prisma DB)
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-gy-gold/10 text-gy-gold border border-gy-gold/30 mb-4">
            <Sparkles className="w-3.5 h-3.5 mr-2" />
            3 Interfaces Connectées vers Une Seule Source de Vérité
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            L&apos;Écosystème Numérique Intégré de la Haute Couture
          </h2>
          <p className="text-gy-textMuted text-base sm:text-lg">
            Direction, Atelier et Clients réunis sur une même base de données centrale avec synchronisation en temps réel et contrôles d&apos;accès RBAC stricts.
          </p>
        </div>

        {/* 3 Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Interface 1: GY ADMIN */}
          <div className="glass-panel rounded-2xl p-8 flex flex-col justify-between border border-gy-border hover:border-gy-gold/60 transition-all duration-300 group hover:-translate-y-1">
            <div>
              <div className="w-14 h-14 rounded-xl bg-gy-gold/10 text-gy-gold flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="text-xs text-gy-gold font-semibold uppercase tracking-wider mb-1">Back-office Direction</div>
              <h3 className="font-serif text-2xl font-bold text-white mb-3">GY ADMIN</h3>
              <p className="text-gy-textMuted text-sm leading-relaxed mb-6">
                Centre de pilotage global : CRM Client 360°, Mensurations, Modèles, Devis, Commandes, Stock physique/réservé, Finances FCFA & RH.
              </p>
              <ul className="space-y-2 mb-8 text-xs text-gy-text">
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-gy-gold mr-2" /> Dashboard Exécutif CA & Marges</li>
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-gy-gold mr-2" /> Fiches Mensurations (20+ mesures)</li>
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-gy-gold mr-2" /> Suivi Rentabilité & Coût Réel</li>
              </ul>
            </div>
            <Link
              href="/admin"
              className="w-full py-3.5 px-4 rounded-xl bg-gold-gradient text-black font-semibold text-sm flex items-center justify-center shadow-gold hover:opacity-95 transition-opacity"
            >
              Accéder à GY ADMIN
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          {/* Interface 2: GY ATELIER */}
          <div className="glass-panel rounded-2xl p-8 flex flex-col justify-between border border-gy-border hover:border-gy-gold/60 transition-all duration-300 group hover:-translate-y-1">
            <div>
              <div className="w-14 h-14 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Scissors className="w-7 h-7" />
              </div>
              <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">Production & Confection</div>
              <h3 className="font-serif text-2xl font-bold text-white mb-3">GY ATELIER</h3>
              <p className="text-gy-textMuted text-sm leading-relaxed mb-6">
                Interface tactile simplifiée pour tablettes/mobiles : Tâches des artisans, scan QR Code, avancement des étapes et contrôles qualité.
              </p>
              <ul className="space-y-2 mb-8 text-xs text-gy-text">
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-amber-400 mr-2" /> Mode Gros Boutons & Tactile</li>
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-amber-400 mr-2" /> Scan QR Code Pièce</li>
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-amber-400 mr-2" /> Signalement de Problèmes & Qualité</li>
              </ul>
            </div>
            <Link
              href="/atelier"
              className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-semibold text-sm flex items-center justify-center shadow-lg transition-colors"
            >
              Accéder à GY ATELIER
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          {/* Interface 3: MY GY */}
          <div className="glass-panel rounded-2xl p-8 flex flex-col justify-between border border-gy-border hover:border-gy-gold/60 transition-all duration-300 group hover:-translate-y-1">
            <div>
              <div className="w-14 h-14 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="text-xs text-sky-400 font-semibold uppercase tracking-wider mb-1">Portail Client Private</div>
              <h3 className="font-serif text-2xl font-bold text-white mb-3">MY GY</h3>
              <p className="text-gy-textMuted text-sm leading-relaxed mb-6">
                Espace VIP des clients : Suivi élégant de la tenue en confection, dates d&apos;essayages, devis, factures & reçus de paiements.
              </p>
              <ul className="space-y-2 mb-8 text-xs text-gy-text">
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-sky-400 mr-2" /> Timeline Visuelle de Confection</li>
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-sky-400 mr-2" /> Confirmation des Rendez-vous</li>
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-sky-400 mr-2" /> Reçus de Paiement & SAV</li>
              </ul>
            </div>
            <Link
              href="/client"
              className="w-full py-3.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-black font-semibold text-sm flex items-center justify-center shadow-lg transition-colors"
            >
              Accéder à MY GY
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>

        {/* System Credentials & Architecture Banner */}
        <div className="glass-panel rounded-xl p-6 border border-gy-border/80">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Database className="w-6 h-6 text-gy-gold" />
              <div>
                <h4 className="text-sm font-semibold text-white">Comptes DEMO pour Test End-to-End</h4>
                <p className="text-xs text-gy-textMuted">Utilisez ces comptes pour tester les 3 expériences instantanément :</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="bg-gy-card px-3 py-1.5 rounded-lg border border-gy-border text-gy-text">
                <strong className="text-gy-gold">ADMIN :</strong> admin@gy-maisoncouture.bj (Pass: demo123)
              </span>
              <span className="bg-gy-card px-3 py-1.5 rounded-lg border border-gy-border text-gy-text">
                <strong className="text-amber-400">ATELIER :</strong> atelier@gy-maisoncouture.bj (Pass: demo123)
              </span>
              <span className="bg-gy-card px-3 py-1.5 rounded-lg border border-gy-border text-gy-text">
                <strong className="text-sky-400">MY GY :</strong> client1@gmail.com (Pass: demo123)
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gy-border/40 py-6 text-center text-xs text-gy-textMuted">
        © 2026 GY MAISON COUTURE. Tous droits réservés. Système ERP Centralisé v1.0.0
      </footer>
    </div>
  );
}
