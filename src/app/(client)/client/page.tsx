"use client";

import { useState, useEffect } from "react";

export default function ClientPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [clientUser, setClientUser] = useState<any>(null);
  const [clientOrders, setClientOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [changePwdModal, setChangePwdModal] = useState(false);
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("gy_client_user");
    if (saved) {
      const u = JSON.parse(saved);
      setClientUser(u);
      setIsAuthenticated(true);
      fetchClientOrders(u.customerId);
    }
  }, []);

  const fetchClientOrders = async (customerId: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders", { cache: "no-store" });
      const allOrders = res.ok ? await res.json() : [];
      const myOrders = allOrders.filter((o: any) =>
        o.customerId === customerId || o.customer?.id === customerId
      );
      setClientOrders(myOrders);
    } catch (e) {}
    setLoading(false);
  };

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword, portal: "client" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("gy_client_user", JSON.stringify(data.user));
        setClientUser(data.user);
        setIsAuthenticated(true);
        if (data.user.customerId) fetchClientOrders(data.user.customerId);
      } else {
        setLoginError(data.error || "Identifiants invalides");
      }
    } catch (e) {
      setLoginError("Erreur de connexion au serveur");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("gy_client_user");
    setIsAuthenticated(false);
    setClientUser(null);
    setClientOrders([]);
  };

  const formatFcfa = (n: any) => `${Number(n || 0).toLocaleString("fr-FR")} FCFA`;
  const formatDate = (d: any) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "—";

  const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    ACOMPTE_ATTENDU: { label: "Acompte attendu", color: "text-amber-400" },
    PRODUCTION: { label: "En production à l'atelier", color: "text-blue-400" },
    ESSAYAGE: { label: "Essayage en cours", color: "text-violet-400" },
    RETOUCHE: { label: "Retouches en cours", color: "text-orange-400" },
    CONTROLE_QUALITE: { label: "Contrôle qualité", color: "text-cyan-400" },
    SOLDE_A_PAYER: { label: "Solde à payer", color: "text-rose-400" },
    PRET: { label: "Prêt à livrer ✅", color: "text-emerald-400" },
    CLOTURE: { label: "Clôturé", color: "text-gray-400" },
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="text-[#D4AF37] font-serif text-5xl font-black tracking-tight mb-2">GY</div>
            <div className="text-white text-xl font-light tracking-[0.4em] uppercase">Maison Couture</div>
            <p className="text-[#A3A3B3] text-sm mt-3">Votre espace client personnel</p>
          </div>

          <div className="bg-[#12121A] border border-[#2A2A38] rounded-3xl p-8 shadow-2xl">
            <h2 className="text-white font-serif text-2xl font-bold mb-6 text-center">CONNEXION</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[#A3A3B3] text-xs font-semibold mb-1">Adresse email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-[#1A1A24] border border-[#2A2A38] rounded-xl px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[#A3A3B3] text-xs font-semibold mb-1">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-[#1A1A24] border border-[#2A2A38] rounded-xl px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none pr-12"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A3A3B3] text-xs">
                    {showPassword ? "CACHER" : "VOIR"}
                  </button>
                </div>
              </div>
              {loginError && <p className="text-rose-400 text-xs font-bold">{loginError}</p>}
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 rounded-xl bg-[#D4AF37] text-black font-black text-sm uppercase tracking-wider hover:bg-[#F3E5AB] transition-all disabled:opacity-50"
              >
                {loginLoading ? "CONNEXION EN COURS..." : "SE CONNECTER"}
              </button>
            </form>
            <p className="text-center text-[#A3A3B3] text-xs mt-4">
              Vous n&apos;avez pas encore de compte ? Contactez-nous par WhatsApp.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Header */}
      <header className="border-b border-[#2A2A38] bg-[#0E0E14] px-6 py-4 flex justify-between items-center">
        <div>
          <span className="text-[#D4AF37] font-serif text-2xl font-black">GY</span>
          <span className="text-white text-sm font-light tracking-[0.3em] ml-2 uppercase">Maison Couture</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#A3A3B3]">Bonjour, <strong className="text-white">{clientUser?.fullName?.split(" ")[0]}</strong></span>
          <button
            onClick={() => setChangePwdModal(true)}
            className="px-3 py-1.5 bg-[#1A1A24] border border-[#2A2A38] rounded-lg text-xs font-bold text-[#A3A3B3] hover:text-white transition-all"
          >
            🔑 MOT DE PASSE
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-xl text-xs font-black uppercase hover:bg-rose-500 hover:text-white transition-all"
          >
            DÉCONNEXION
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div>
          <h1 className="font-serif text-4xl font-bold text-white">Mes Commandes</h1>
          <p className="text-[#A3A3B3] text-sm mt-1">Suivez l&apos;avancement de vos créations en temps réel</p>
        </div>

        {loading && (
          <div className="text-center text-[#A3A3B3] py-12">Chargement de vos commandes...</div>
        )}

        {!loading && clientOrders.length === 0 && (
          <div className="text-center py-16 bg-[#12121A] rounded-3xl border border-[#2A2A38]">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="font-serif text-xl font-bold text-white mb-2">Aucune commande en cours</h3>
            <p className="text-[#A3A3B3] text-sm">Vos commandes apparaîtront ici dès qu&apos;elles seront enregistrées.</p>
          </div>
        )}

        <div className="space-y-6">
          {clientOrders.map((order) => {
            const statusInfo = STATUS_LABELS[order.status] || { label: order.status, color: "text-white" };
            return (
              <div key={order.id} className="bg-[#12121A] border border-[#2A2A38] rounded-3xl p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">{order.reference}</span>
                    <h3 className="font-serif text-xl font-bold text-white mt-1">
                      {order.items?.[0]?.itemName || "Création Sur-Mesure"}
                    </h3>
                    {order.items?.length > 1 && (
                      <p className="text-xs text-[#A3A3B3] mt-0.5">+ {order.items.length - 1} autres tenue(s)</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-white">{formatFcfa(order.totalAmount)}</div>
                    {Number(order.balanceDue) > 0 && (
                      <div className="text-xs text-rose-400 font-bold mt-0.5">Solde dû : {formatFcfa(order.balanceDue)}</div>
                    )}
                    {Number(order.balanceDue) === 0 && (
                      <div className="text-xs text-emerald-400 font-bold mt-0.5">✅ Entièrement payé</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`font-black text-sm ${statusInfo.color}`}>● {statusInfo.label}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs text-[#A3A3B3]">
                  <div>
                    <span className="block">Date de commande</span>
                    <strong className="text-white">{formatDate(order.orderDate || order.createdAt)}</strong>
                  </div>
                  <div>
                    <span className="block text-[#D4AF37]">Date de retrait souhaitée</span>
                    <strong className="text-amber-400">{formatDate(order.promisedDate)}</strong>
                  </div>
                </div>

                {/* Images section */}
                {((order.images && order.images.length > 0) || order.deliveryImage) && (
                  <div>
                    <p className="text-xs text-[#A3A3B3] font-bold mb-2">📸 Photos</p>
                    <div className="flex flex-wrap gap-2">
                      {(order.images || []).map((img: string, idx: number) => (
                        <img key={idx} src={img} alt={`Tissu ${idx + 1}`} className="w-20 h-20 object-cover rounded-xl border border-[#2A2A38]" />
                      ))}
                      {order.deliveryImage && (
                        <div className="relative">
                          <img src={order.deliveryImage} alt="Produit fini" className="w-20 h-20 object-cover rounded-xl border-2 border-[#D4AF37]" />
                          <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-black text-xs font-black px-1 rounded text-[10px]">FINI</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Change Password Modal */}
      {changePwdModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#12121A] border border-[#2A2A38] rounded-3xl p-8 w-full max-w-sm">
            <h3 className="font-serif text-xl font-bold text-white mb-6">Changer le mot de passe</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[#A3A3B3] text-xs font-semibold mb-1">Nouveau mot de passe</label>
                <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} className="w-full bg-[#1A1A24] border border-[#2A2A38] rounded-xl px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none" />
              </div>
              <div>
                <label className="block text-[#A3A3B3] text-xs font-semibold mb-1">Confirmer le mot de passe</label>
                <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} className="w-full bg-[#1A1A24] border border-[#2A2A38] rounded-xl px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setChangePwdModal(false)} className="w-1/2 py-3 rounded-xl bg-[#1A1A24] border border-[#2A2A38] text-[#A3A3B3] font-black text-xs uppercase">ANNULER</button>
                <button
                  onClick={() => {
                    if (!newPwd || newPwd.length < 6) { alert("Mot de passe trop court (min. 6 caractères)."); return; }
                    if (newPwd !== confirmPwd) { alert("Les mots de passe ne correspondent pas."); return; }
                    alert("Fonctionnalité de changement de mot de passe à venir. Contactez l'admin pour le moment.");
                    setChangePwdModal(false);
                  }}
                  className="w-1/2 py-3 rounded-xl bg-[#D4AF37] text-black font-black text-xs uppercase"
                >
                  CONFIRMER
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
