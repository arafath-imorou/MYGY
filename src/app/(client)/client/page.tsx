"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ClientPortal() {
  const [activeTab, setActiveTab] = useState<"creations" | "fittings" | "invoices" | "sav">("creations");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savSubject, setSavSubject] = useState("");
  const [savDesc, setSavDesc] = useState("");
  const [savModal, setSavModal] = useState(false);

  const defaultCustomerId = "CLI-2026-0001";

  const fetchClientData = async () => {
    setLoading(true);
    try {
      const custRes = await fetch("/api/admin/customers");
      const customers = await custRes.json();
      const demoCust = customers.find((c: any) => c.code === defaultCustomerId) || customers[0];

      if (demoCust) {
        const orderRes = await fetch(`/api/client/orders?customerId=${demoCust.id}`);
        const result = await orderRes.json();
        setData(result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, []);

  const formatFcfa = (val: number) => {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 })
      .format(val || 0)
      .replace("XOF", "FCFA");
  };

  const customer = data?.customer;
  const orders = data?.orders || [];

  return (
    <div className="min-h-screen bg-gy-dark text-gy-text flex overflow-hidden font-aptos text-base">
      {/* SIDEBAR NAVIGATION (NO ICONS, UPPERCASE BUTTONS) */}
      <aside className="w-72 bg-gy-card border-r border-gy-border/80 flex flex-col justify-between select-none z-30 shrink-0">
        <div>
          <div className="p-6 border-b border-gy-border/60 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center font-serif text-black font-bold text-xl shadow-gold group-hover:scale-105 transition-transform">
                GY
              </div>
              <div>
                <h1 className="font-serif text-lg font-bold text-white tracking-wide leading-tight group-hover:text-gy-gold transition-colors">
                  MY GY
                </h1>
                <span className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider block">
                  Espace Privé Membre VIP
                </span>
              </div>
            </Link>
          </div>

          <div className="px-4 py-6 space-y-3">
            <div className="px-3 mb-2 text-[10px] font-extrabold text-gy-textMuted uppercase tracking-wider">
              MON ESPACE HAUTE COUTURE
            </div>

            <button
              onClick={() => setActiveTab("creations")}
              className={`w-full text-left px-5 py-4 rounded-xl text-xs font-black transition-all uppercase tracking-wider ${
                activeTab === "creations"
                  ? "bg-gold-gradient text-black shadow-gold"
                  : "bg-gy-dark text-white border border-gy-border hover:border-gy-gold"
              }`}
            >
              MES CRÉATIONS & CONFECTION
            </button>

            <button
              onClick={() => setActiveTab("fittings")}
              className={`w-full text-left px-5 py-4 rounded-xl text-xs font-black transition-all uppercase tracking-wider ${
                activeTab === "fittings"
                  ? "bg-gold-gradient text-black shadow-gold"
                  : "bg-gy-dark text-white border border-gy-border hover:border-gy-gold"
              }`}
            >
              MES RENDEZ-VOUS ESSAYAGES
            </button>

            <button
              onClick={() => setActiveTab("invoices")}
              className={`w-full text-left px-5 py-4 rounded-xl text-xs font-black transition-all uppercase tracking-wider ${
                activeTab === "invoices"
                  ? "bg-gold-gradient text-black shadow-gold"
                  : "bg-gy-dark text-white border border-gy-border hover:border-gy-gold"
              }`}
            >
              MES FACTURES & REÇUS XOF
            </button>

            <button
              onClick={() => setSavModal(true)}
              className="w-full text-left px-5 py-4 rounded-xl text-xs font-black transition-all uppercase tracking-wider bg-gy-dark text-gy-textMuted border border-gy-border hover:text-white hover:border-gy-gold"
            >
              SUPPORT & SERVICE CLIENT
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-gy-border/60 bg-gy-dark/40">
          <div className="flex items-center justify-between p-3 rounded-xl bg-gy-card border border-gy-gold/30">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-gy-gold/20 border border-gy-gold/40 flex items-center justify-center font-bold text-gy-gold text-xs shadow-gold">
                YB
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white leading-tight">{customer?.firstName} {customer?.lastName}</div>
                <div className="text-[10px] text-gy-gold font-semibold">{customer?.loyaltyAccount?.tier || "GY VIP Diamond"}</div>
              </div>
            </div>
            <Link href="/" title="Déconnexion" className="text-gy-textMuted hover:text-rose-400 font-bold text-xs px-2 py-1 border border-gy-border rounded-lg">
              QUITTER
            </Link>
          </div>
        </div>
      </aside>

      {/* MAIN CLIENT PORTAL VIEW */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-gy-border/80 bg-gy-card/80 backdrop-blur-md sticky top-0 z-20 px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xs text-gy-textMuted font-medium">BIENVENUE,</span>
            <span className="text-sm font-bold text-white uppercase">{customer?.firstName || "Princesse Yasmine"}</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gy-gold/10 px-4 py-1.5 rounded-full border border-gy-gold/30">
              <span className="text-xs font-black text-gy-gold uppercase">{customer?.loyaltyAccount?.tier || "GY VIP DIAMOND"}</span>
            </div>
          </div>
        </header>

        <main className="p-8 space-y-8 flex-1 max-w-6xl w-full mx-auto font-aptos">
          <div className="glass-panel rounded-3xl p-8 border border-gy-gold/40 relative overflow-hidden shadow-2xl">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-bold bg-gy-gold/20 text-gy-gold mb-3 border border-gy-gold/30 uppercase tracking-wider">
                  ESPACE MEMBRE PRIVILÉGIÉ
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                  Bonjour, {customer?.firstName || "Princesse Yasmine"}
                </h2>
                <p className="text-gy-textMuted text-sm mt-1">
                  Suivez en temps réel la confection de vos tenues et la préparation de vos essayages.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-sky-500/40 bg-sky-950/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">VOTRE PROCHAINE ÉTAPE</span>
              <h4 className="font-serif text-lg font-bold text-white mt-1">Essayage 1 - Ajustement de Toile</h4>
              <p className="text-xs text-gy-textMuted mt-0.5">Samedi 22 Août 2026 à 15h00 • Boutique Principale Cotonou</p>
            </div>
            <button className="px-5 py-3 bg-sky-500 hover:bg-sky-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-colors">
              CONFIRMER PRÉSENCE
            </button>
          </div>

          {activeTab === "creations" && (
            <div className="space-y-6">
              <h3 className="font-serif text-2xl font-bold text-white">VOS CRÉATIONS SUR-MESURE</h3>

              {orders.map((o: any) => (
                <div key={o.id} className="glass-panel p-6 rounded-2xl border border-gy-border space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gy-border/60 pb-4 gap-2">
                    <div>
                      <div className="text-xs text-gy-gold font-bold uppercase">{o.reference}</div>
                      <h4 className="font-serif text-xl font-bold text-white mt-0.5">
                        {o.items?.[0]?.itemName || "Création Sur-Mesure GY"}
                      </h4>
                      <p className="text-xs text-gy-textMuted mt-1">Livraison prévue : {new Date(o.promisedDate).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-xs text-gy-textMuted">Montant Total : <strong className="text-white">{formatFcfa(o.totalAmount)}</strong></div>
                      <div className="text-xs text-emerald-400 font-semibold">Payé : {formatFcfa(o.totalPaid)}</div>
                      {o.balanceDue > 0 && (
                        <div className="text-xs text-amber-400 font-bold">Solde restant : {formatFcfa(o.balanceDue)}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
