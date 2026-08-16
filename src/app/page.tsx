"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gy-dark text-gy-text flex flex-col justify-between relative overflow-hidden font-aptos">
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
              <p className="text-xs text-gy-gold font-bold tracking-wider uppercase">ERP CENTRALISÉ & WORKFLOWS HAUTE COUTURE</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">
              SYNCHRO TEMPS RÉEL ACTIVES
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-gy-gold/10 text-gy-gold border border-gy-gold/30 mb-4 uppercase tracking-wider">
            ÉCOSYSTÈME MULTI-INTERFACES CONNECTÉ
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            Plateforme Haute Couture GY
          </h2>
          <p className="text-gy-textMuted text-base sm:text-lg">
            Direction, Atelier et Clients réunis sur une même base de données centrale.
          </p>
        </div>

        {/* 3 Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Interface 1: GY ADMIN */}
          <div className="glass-panel rounded-2xl p-8 flex flex-col justify-between border border-gy-border hover:border-gy-gold/60 transition-all duration-300 group hover:-translate-y-1">
            <div>
              <div className="w-14 h-14 rounded-xl bg-gy-gold/10 text-gy-gold flex items-center justify-center font-black text-xl mb-6">
                GY
              </div>
              <div className="text-xs text-gy-gold font-extrabold uppercase tracking-wider mb-1">BACK-OFFICE DIRECTION</div>
              <h3 className="font-serif text-2xl font-bold text-white mb-3">GY ADMIN</h3>
              <p className="text-gy-textMuted text-sm leading-relaxed mb-6">
                Centre de pilotage global : CRM Client 360°, Mensurations, Modèles, Devis, Commandes, Stock physique/réservé, Finances FCFA & RH.
              </p>
            </div>
            <Link
              href="/admin"
              className="w-full py-4 px-4 rounded-xl bg-gold-gradient text-black font-black text-xs uppercase tracking-wider flex items-center justify-center shadow-gold hover:opacity-95 transition-opacity"
            >
              ACCÉDER À GY ADMIN
            </Link>
          </div>

          {/* Interface 2: GY ATELIER */}
          <div className="glass-panel rounded-2xl p-8 flex flex-col justify-between border border-gy-border hover:border-gy-gold/60 transition-all duration-300 group hover:-translate-y-1">
            <div>
              <div className="w-14 h-14 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-black text-xl mb-6">
                PROD
              </div>
              <div className="text-xs text-amber-400 font-extrabold uppercase tracking-wider mb-1">PRODUCTION & CONFECTION</div>
              <h3 className="font-serif text-2xl font-bold text-white mb-3">GY ATELIER</h3>
              <p className="text-gy-textMuted text-sm leading-relaxed mb-6">
                Interface tactile simplifiée pour tablettes/mobiles : Tâches des artisans, scan QR Code, avancement des étapes et contrôles qualité.
              </p>
            </div>
            <Link
              href="/atelier"
              className="w-full py-4 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center shadow-lg transition-colors"
            >
              ACCÉDER À GY ATELIER
            </Link>
          </div>

          {/* Interface 3: MY GY */}
          <div className="glass-panel rounded-2xl p-8 flex flex-col justify-between border border-gy-border hover:border-gy-gold/60 transition-all duration-300 group hover:-translate-y-1">
            <div>
              <div className="w-14 h-14 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-black text-xl mb-6">
                VIP
              </div>
              <div className="text-xs text-sky-400 font-extrabold uppercase tracking-wider mb-1">PORTAIL CLIENT PRIVÉ</div>
              <h3 className="font-serif text-2xl font-bold text-white mb-3">MY GY</h3>
              <p className="text-gy-textMuted text-sm leading-relaxed mb-6">
                Espace VIP des clients : Suivi élégant de la tenue en confection, dates d&apos;essayages, devis, factures & reçus de paiements.
              </p>
            </div>
            <Link
              href="/client"
              className="w-full py-4 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center shadow-lg transition-colors"
            >
              ACCÉDER À MY GY
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-gy-border/40 py-6 text-center text-xs font-bold text-gy-textMuted uppercase tracking-wider">
        © 2026 GY MAISON COUTURE. TOUS DROITS RÉSERVÉS. SYS ERP V1.0.0
      </footer>
    </div>
  );
}
