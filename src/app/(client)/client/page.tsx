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

  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

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
        o.customerId === customerId || o.customer?.id === customerId || o.customer?.code === customerId
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

  const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    ACOMPTE_ATTENDU: { label: "Acompte attendu", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" },
    PRODUCTION: { label: "En confection à l'atelier", color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/30" },
    ESSAYAGE: { label: "Essayage en cours", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
    RETOUCHE: { label: "Retouches en cours", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
    CONTROLE_QUALITE: { label: "Contrôle qualité", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30" },
    SOLDE_A_PAYER: { label: "Solde à régler", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30" },
    PRET: { label: "Prêt à livrer", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
    CLOTURE: { label: "Clôturé / Livré", color: "text-gray-400", bg: "bg-gray-500/10 border-gray-500/30" },
  };

  const totalAmountSum = clientOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const totalBalanceDueSum = clientOrders.reduce((sum, o) => sum + Number(o.balanceDue || 0), 0);
  const totalPaidSum = Math.max(0, totalAmountSum - totalBalanceDueSum);

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
                <label className="block text-[#A3A3B3] text-xs font-semibold mb-1">Identifiant ou Email</label>
                <input
                  type="text"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="ex: gytatadeen ou email"
                  className="w-full bg-[#1A1A24] border border-[#2A2A38] rounded-xl px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none placeholder-[#555]"
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
    <div className="min-h-screen bg-[#0A0A0F] text-white font-sans">
      {/* Header */}
      <header className="border-b border-[#2A2A38] bg-[#0E0E14] px-6 py-4 flex justify-between items-center sticky top-0 z-30">
        <div>
          <span className="text-[#D4AF37] font-serif text-2xl font-black">GY</span>
          <span className="text-white text-sm font-light tracking-[0.3em] ml-2 uppercase">Maison Couture</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#A3A3B3] hidden sm:inline">Bonjour, <strong className="text-white">{clientUser?.fullName?.split(" ")[0]}</strong></span>
          <button
            onClick={() => setChangePwdModal(true)}
            className="px-3 py-1.5 bg-[#1A1A24] border border-[#2A2A38] rounded-lg text-xs font-bold text-[#A3A3B3] hover:text-white transition-all"
          >
            MOT DE PASSE
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-xl text-xs font-black uppercase hover:bg-rose-500 hover:text-white transition-all"
          >
            DÉCONNEXION
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">Mon Espace Client VIP</h1>
            <p className="text-[#A3A3B3] text-sm mt-1">Suivi en direct de l&apos;état d&apos;avancement de vos créations sur-mesure</p>
          </div>
          <button
            onClick={() => fetchClientOrders(clientUser.customerId)}
            className="px-4 py-2 bg-[#1A1A24] border border-[#2A2A38] text-white rounded-xl text-xs font-bold hover:border-[#D4AF37] transition-all"
          >
            ACTUALISER
          </button>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#12121A] border border-[#2A2A38] p-5 rounded-2xl">
            <span className="text-[11px] font-bold text-[#A3A3B3] uppercase tracking-wider block">Commandes</span>
            <strong className="text-2xl font-black text-white mt-1 block">{clientOrders.length}</strong>
          </div>
          <div className="bg-[#12121A] border border-[#2A2A38] p-5 rounded-2xl">
            <span className="text-[11px] font-bold text-[#A3A3B3] uppercase tracking-wider block">Montant Total</span>
            <strong className="text-xl font-black text-white mt-1 block">{formatFcfa(totalAmountSum)}</strong>
          </div>
          <div className="bg-[#12121A] border border-[#2A2A38] p-5 rounded-2xl">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Total Versé</span>
            <strong className="text-xl font-black text-emerald-400 mt-1 block">{formatFcfa(totalPaidSum)}</strong>
          </div>
          <div className="bg-[#12121A] border border-[#2A2A38] p-5 rounded-2xl">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">Solde Restant</span>
            <strong className="text-xl font-black text-amber-400 mt-1 block">{formatFcfa(totalBalanceDueSum)}</strong>
          </div>
        </div>

        {loading && (
          <div className="text-center text-[#A3A3B3] py-12 bg-[#12121A] rounded-3xl border border-[#2A2A38]">
            Chargement de vos commandes...
          </div>
        )}

        {!loading && clientOrders.length === 0 && (
          <div className="text-center py-16 bg-[#12121A] rounded-3xl border border-[#2A2A38]">
            <div className="text-5xl mb-4 text-[#D4AF37] font-serif font-black">GY</div>
            <h3 className="font-serif text-xl font-bold text-white mb-2">Aucune commande en cours</h3>
            <p className="text-[#A3A3B3] text-sm">Vos commandes apparaîtront ici dès qu&apos;elles seront enregistrées.</p>
          </div>
        )}

        {/* Structured Orders Table */}
        {!loading && clientOrders.length > 0 && (
          <div className="bg-[#12121A] border border-[#2A2A38] rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-[#2A2A38] flex justify-between items-center">
              <h3 className="font-serif text-xl font-bold text-white">LISTE DE MES COMMANDES & CRÉATIONS</h3>
              <span className="text-xs text-[#D4AF37] font-bold">{clientOrders.length} création(s)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#E1E1E6]">
                <thead>
                  <tr className="border-b border-[#2A2A38] bg-[#0E0E14] text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                    <th className="p-4 min-w-[130px]">RÉFÉRENCE</th>
                    <th className="p-4 min-w-[220px]">TENUE SUR-MESURE</th>
                    <th className="p-4 min-w-[140px]">COMMANDE DU</th>
                    <th className="p-4 min-w-[150px]">RETRAIT SOUHAITÉ</th>
                    <th className="p-4 min-w-[130px]">MONTANT</th>
                    <th className="p-4 min-w-[130px]">SOLDE DÛ</th>
                    <th className="p-4 min-w-[170px]">STATUT ATELIER</th>
                    <th className="p-4 min-w-[120px] text-center">PHOTOS & SUIVI</th>
                  </tr>
                </thead>
                <tbody>
                  {clientOrders.map((order) => {
                    const statusInfo = STATUS_LABELS[order.status] || { label: order.status, color: "text-white", bg: "bg-gray-500/10 border-gray-500/30" };
                    const hasPhotos = (order.images && order.images.length > 0) || order.deliveryImage;
                    return (
                      <tr key={order.id} className="border-b border-[#2A2A38]/50 hover:bg-[#181822] transition-colors">
                        <td className="p-4 font-bold text-white">
                          <span className="px-2.5 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/40 rounded-lg text-xs font-black text-[#D4AF37]">
                            {order.reference}
                          </span>
                        </td>
                        <td className="p-4">
                          <strong className="text-white block font-bold text-sm">
                            {order.items?.[0]?.itemName || "Création Sur-Mesure"}
                          </strong>
                          <span className="text-xs text-[#A3A3B3] block mt-0.5">
                            Tissu : {order.items?.[0]?.fabricDetails || "Tissu sélectionné"}
                          </span>
                        </td>
                        <td className="p-4 text-[#A3A3B3] text-xs font-medium">
                          {formatDate(order.orderDate || order.createdAt)}
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                            {formatDate(order.promisedDate)}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-white text-sm">
                          {formatFcfa(order.totalAmount)}
                        </td>
                        <td className="p-4 font-bold text-sm">
                          {Number(order.balanceDue) > 0 ? (
                            <span className="text-rose-400">{formatFcfa(order.balanceDue)}</span>
                          ) : (
                            <span className="text-emerald-400 text-xs font-bold">Soldé</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-xl text-xs font-black border uppercase block text-center ${statusInfo.bg} ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedOrderDetails(order)}
                            className="px-3 py-1.5 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black border border-[#D4AF37]/40 text-xs font-black uppercase transition-all shadow-sm"
                          >
                            {hasPhotos ? "PHOTOS (" + ((order.images?.length || 0) + (order.deliveryImage ? 1 : 0)) + ")" : "DÉTAILS"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Order Details & Photo Gallery Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#12121A] border border-[#D4AF37]/50 rounded-3xl p-8 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start border-b border-[#2A2A38] pb-4 mb-6">
              <div>
                <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">{selectedOrderDetails.reference}</span>
                <h3 className="font-serif text-2xl font-bold text-white mt-1">
                  {selectedOrderDetails.items?.[0]?.itemName || "Création Sur-Mesure"}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-[#A3A3B3] hover:text-white px-3 py-1 bg-[#1A1A24] border border-[#2A2A38] rounded-lg text-xs font-bold"
              >
                [ FERMER ]
              </button>
            </div>

            <div className="space-y-6 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-[#1A1A24] p-5 rounded-2xl border border-[#2A2A38]">
                <div>
                  <span className="text-xs text-[#A3A3B3] block">Date de commande</span>
                  <strong className="text-white text-sm">{formatDate(selectedOrderDetails.orderDate || selectedOrderDetails.createdAt)}</strong>
                </div>
                <div>
                  <span className="text-xs text-[#D4AF37] font-bold block">Date de retrait souhaitée</span>
                  <strong className="text-amber-400 text-sm">{formatDate(selectedOrderDetails.promisedDate)}</strong>
                </div>
                <div>
                  <span className="text-xs text-[#A3A3B3] block">Montant Total</span>
                  <strong className="text-white text-base font-bold">{formatFcfa(selectedOrderDetails.totalAmount)}</strong>
                </div>
                <div>
                  <span className="text-xs text-[#A3A3B3] block">Solde Restant</span>
                  <strong className={`text-base font-bold ${Number(selectedOrderDetails.balanceDue) > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                    {formatFcfa(selectedOrderDetails.balanceDue)}
                  </strong>
                </div>
              </div>

              <div>
                <h4 className="font-serif text-lg font-bold text-white mb-2">Matière & Tissu Associé</h4>
                <div className="bg-[#1A1A24] p-4 rounded-xl border border-[#2A2A38] text-white">
                  {selectedOrderDetails.items?.[0]?.fabricDetails || "Tissu fourni par la cliente."}
                </div>
              </div>

              {/* Photos Gallery */}
              <div>
                <h4 className="font-serif text-lg font-bold text-white mb-3">Galerie Photos (Tissus & Produit Fini)</h4>
                {((selectedOrderDetails.images && selectedOrderDetails.images.length > 0) || selectedOrderDetails.deliveryImage) ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(selectedOrderDetails.images || []).map((img: string, idx: number) => (
                      <div key={idx} className="cursor-pointer group relative overflow-hidden rounded-2xl border border-[#2A2A38]" onClick={() => setActivePhoto(img)}>
                        <img src={img} alt={`Tissu ${idx + 1}`} className="w-full h-36 object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-bold text-white">Tissu {idx + 1}</span>
                      </div>
                    ))}
                    {selectedOrderDetails.deliveryImage && (
                      <div className="cursor-pointer group relative overflow-hidden rounded-2xl border-2 border-[#D4AF37]" onClick={() => setActivePhoto(selectedOrderDetails.deliveryImage)}>
                        <img src={selectedOrderDetails.deliveryImage} alt="Produit fini" className="w-full h-36 object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#D4AF37] text-[10px] font-black text-black">PRODUIT FINI</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[#A3A3B3] italic text-xs bg-[#1A1A24] p-4 rounded-xl border border-[#2A2A38]">
                    Aucune photo ajoutée pour cette commande pour le moment.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Lightbox */}
      {activePhoto && (
        <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4" onClick={() => setActivePhoto(null)}>
          <div className="relative max-w-3xl max-h-[90vh]">
            <img src={activePhoto} alt="Agrandissement" className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-[#D4AF37]" />
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute -top-4 -right-4 bg-black border border-[#D4AF37] text-white rounded-full w-8 h-8 font-black flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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
