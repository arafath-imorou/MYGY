"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState<
    "dashboard" | "clients" | "espace-client" | "commandes" | "atelier" | "finances" | "rh" | "administrations"
  >("clients");

  const [financeSubTab, setFinanceSubTab] = useState<"recettes" | "depenses">("recettes");

  const [metrics, setMetrics] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Finances state
  const [recettesList, setRecettesList] = useState<any[]>([]);
  const [depensesList, setDepensesList] = useState<any[]>([]);
  const [financeMetrics, setFinanceMetrics] = useState<any>(null);

  // Search & Filter & Mobile Navigation
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // AUTHENTICATION & LOGIN PORTAL STATE
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("gy_logged_in") === "true";
    }
    return false;
  });
  const [loginEmail, setLoginEmail] = useState("gymaisoncouture@gmail.com");
  const [loginPassword, setLoginPassword] = useState("gymc2026");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLoginSubmit = async (e?: any) => {
    if (e) e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword, portal: "admin" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        if (typeof window !== "undefined") {
          localStorage.setItem("gy_logged_in", "true");
          localStorage.setItem("gy_user_email", data.user.email);
        }
      } else {
        setLoginError(data.error || "Email ou mot de passe incorrect");
      }
    } catch (err) {
      setLoginError("Erreur de connexion au serveur");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("gy_logged_in");
      localStorage.removeItem("gy_user_email");
      sessionStorage.clear();
    }
  };

  // =========================================================
  // STEP-BY-STEP CLIENT PAYMENT WIZARD MODAL STATE
  // =========================================================
  const [paymentWizardModal, setPaymentWizardModal] = useState(false);
  const [payStep, setPayStep] = useState<1 | 2>(1); // 1: Saisie, 2: Prévisualisation
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
  const [payCustomerId, setPayCustomerId] = useState("");
  const [payOrderId, setPayOrderId] = useState("");
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMode, setPayMode] = useState("ESPECES");
  const [payRef, setPayRef] = useState("");
  const [payAgent, setPayAgent] = useState("Ghislaine LOKO DJIDJOHO (Direction)");

  // Expense Modal State
  const [newExpenseModal, setNewExpenseModal] = useState(false);
  const [expCategory, setExpCategory] = useState("Achat Tissus");
  const [expDescription, setExpDescription] = useState("");
  const [expAmount, setExpAmount] = useState<number>(0);
  const [expSupplier, setExpSupplier] = useState("");
  const [expPaymentMode, setExpPaymentMode] = useState("ESPECES");

  // View Order Detail Modal State
  const [viewOrderModal, setViewOrderModal] = useState<any>(null);

  // Client Modals
  const [viewCustomerModal, setViewCustomerModal] = useState<any>(null);
  const [editCustomerModal, setEditCustomerModal] = useState<any>(null);

  // Edit Customer Form State
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editCity, setEditCity] = useState("Cotonou");
  const [editCategory, setEditCategory] = useState("Standard");
  const [editProfession, setEditProfession] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // 22 Measurements Form State
  const [mPoitrine, setMPoitrine] = useState<string>("");
  const [mSousPoitrine, setMSousPoitrine] = useState<string>("");
  const [mTaille, setMTaille] = useState<string>("");
  const [mHanches, setMHanches] = useState<string>("");
  const [mCarrure, setMCarrure] = useState<string>("");
  const [mEpaule, setMEpaule] = useState<string>("");
  const [mBras, setMBras] = useState<string>("");
  const [mPoignet, setMPoignet] = useState<string>("");
  const [mHauteurPoitrine, setMHauteurPoitrine] = useState<string>("");
  const [mEcartPoitrine, setMEcartPoitrine] = useState<string>("");
  const [mLongueurCorsage, setMLongueurCorsage] = useState<string>("");
  const [mLongueurDos, setMLongueurDos] = useState<string>("");
  const [mHauteurBassin, setMHauteurBassin] = useState<string>("");
  const [mLongueurRobe, setMLongueurRobe] = useState<string>("");
  const [mLongueurJupe, setMLongueurJupe] = useState<string>("");
  const [mEntrejambe, setMEntrejambe] = useState<string>("");
  const [mPantalon, setMPantalon] = useState<string>("");
  const [mCuisse, setMCuisse] = useState<string>("");
  const [mGenou, setMGenou] = useState<string>("");
  const [mMollet, setMMollet] = useState<string>("");
  const [mCheville, setMCheville] = useState<string>("");
  const [mMorphologie, setMMorphologie] = useState<string>("Sablier (8 / X)");

  // Admin Account Creation Modal State
  const [newAdminModal, setNewAdminModal] = useState(false);
  const [adminFullName, setAdminFullName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminRole, setAdminRole] = useState("SUPER_ADMIN");
  const [usersList, setUsersList] = useState<any[]>([]);

  // Create Client Form Modal
  const [newCustomerModal, setNewCustomerModal] = useState(false);
  const [newCustFirstName, setNewCustFirstName] = useState("");
  const [newCustLastName, setNewCustLastName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");
  const [newCustCity, setNewCustCity] = useState("Cotonou");
  const [newCustCategory, setNewCustCategory] = useState("Standard");
  const [newCustProfession, setNewCustProfession] = useState("");
  const [newCustNotes, setNewCustNotes] = useState("");

  // Order Creation Form Modal
  const [newOrderModal, setNewOrderModal] = useState(false);
  const [newOrderCustomerId, setNewOrderCustomerId] = useState("");
  const [newOrderItemName, setNewOrderItemName] = useState("");
  const [newOrderOrderDate, setNewOrderOrderDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [newOrderPromisedDate, setNewOrderPromisedDate] = useState(
    new Date(Date.now() + 14 * 86400 * 1000).toISOString().split("T")[0]
  );
  const [newOrderFabricDetails, setNewOrderFabricDetails] = useState("");
  const [newOrderCustomNotes, setNewOrderCustomNotes] = useState("");
  const [newOrderTotalAmount, setNewOrderTotalAmount] = useState<number>(0);
  const [newOrderDepositRequired, setNewOrderDepositRequired] = useState<number>(0);
  const [newOrderPriority, setNewOrderPriority] = useState("VIP");

  const getStoredLocal = (key: string) => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  };

  const setStoredLocal = (key: string, data: any[]) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const noCacheOpts: RequestInit = { cache: "no-store", headers: { "Cache-Control": "no-cache, no-store, must-revalidate" } };
      const [dashRes, ordersRes, custRes, finRes] = await Promise.all([
        fetch("/api/admin/dashboard", noCacheOpts),
        fetch("/api/admin/orders", noCacheOpts),
        fetch("/api/admin/customers", noCacheOpts),
        fetch("/api/admin/finances", noCacheOpts),
      ]);

      const dashData = dashRes.ok ? await dashRes.json() : {};
      const ordersData = ordersRes.ok ? await ordersRes.json() : [];
      const custData = custRes.ok ? await custRes.json() : [];
      const finData = finRes.ok ? await finRes.json() : {};

      const localCusts = getStoredLocal("gy_customers");
      const localOrders = getStoredLocal("gy_orders");
      const localRecettes = getStoredLocal("gy_recettes");
      const localDepenses = getStoredLocal("gy_depenses");

      const serverCusts = Array.isArray(custData) ? custData : [];
      const serverOrders = Array.isArray(ordersData) ? ordersData : [];
      const serverRecettes = Array.isArray(finData.recettes) ? finData.recettes : [];
      const serverDepenses = Array.isArray(finData.depenses) ? finData.depenses : [];

      const mergedCusts = [...serverCusts, ...localCusts.filter((l: any) => !serverCusts.some((s: any) => s.id === l.id))];
      const mergedOrders = [...serverOrders, ...localOrders.filter((l: any) => !serverOrders.some((s: any) => s.id === l.id))];
      const mergedRecettes = [...serverRecettes, ...localRecettes.filter((l: any) => !serverRecettes.some((s: any) => s.id === l.id))];
      const mergedDepenses = [...serverDepenses, ...localDepenses.filter((l: any) => !serverDepenses.some((s: any) => s.id === l.id))];

      setStoredLocal("gy_customers", mergedCusts);
      setStoredLocal("gy_orders", mergedOrders);

      setMetrics(dashData.metrics || {});
      setOrders(mergedOrders);
      setCustomers(mergedCusts);

      setRecettesList(mergedRecettes);
      setDepensesList(mergedDepenses);
      setFinanceMetrics(finData.metrics || {});

      if (mergedCusts.length > 0 && !newOrderCustomerId) {
        setNewOrderCustomerId(mergedCusts[0].id);
        setPayCustomerId(mergedCusts[0].id);
      }
      if (mergedOrders.length > 0 && !payOrderId) {
        setPayOrderId(mergedOrders[0].id);
      }
      setStockItems(dashData.lowStockItems || []);
    } catch (e) {
      console.error("fetchData error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // 1. Auto-sync interval every 8 seconds for all connected devices
    const interval = setInterval(() => {
      fetchData();
    }, 8000);

    // 2. Immediate sync when user refocuses tab/screen
    const handleFocus = () => {
      fetchData();
    };
    window.addEventListener("focus", handleFocus);

    // 3. Supabase Realtime Channel for instant push updates
    let channel: any;
    try {
      channel = supabase
        .channel("gy-realtime-sync")
        .on("postgres_changes", { event: "*", schema: "public" }, () => {
          fetchData();
        })
        .subscribe();
    } catch (e) {
      console.warn("Realtime channel subscription skipped:", e);
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // Filtered orders for selected customer in payment wizard
  const customerOrders = orders.filter((o) => o.customerId === payCustomerId);

  // Selected Order object in payment wizard
  const selectedPayOrder = orders.find((o) => o.id === payOrderId || o.reference === payOrderId) || customerOrders[0] || (orders.length > 0 ? orders[0] : null);

  // Open Payment Wizard
  const handleOpenPaymentWizard = (cust?: any, ord?: any) => {
    setPayStep(1);
    const targetCustId = cust?.id || (customers.length > 0 ? customers[0].id : "");
    setPayCustomerId(targetCustId);

    if (ord) {
      setPayOrderId(ord.id || ord.reference);
    } else {
      const availOrders = orders.filter((o) => o.customerId === targetCustId);
      if (availOrders.length > 0) {
        setPayOrderId(availOrders[0].id || availOrders[0].reference);
      } else if (orders.length > 0) {
        setPayOrderId(orders[0].id || orders[0].reference);
      } else {
        setPayOrderId("ORD-2026-3719");
      }
    }

    setPayAmount(0);
    setPaymentWizardModal(true);
  };

  // Submit Final Payment Wizard
  const handleConfirmFinalPayment = async () => {
    const targetOrder = selectedPayOrder || (orders.length > 0 ? orders[0] : { id: payOrderId || "ORD-2026-3719", reference: "ORD-2026-3719" });
    if (payAmount <= 0) return;
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: targetOrder.id || targetOrder.reference || payOrderId || "ORD-2026-3719",
          newPayment: {
            amount: payAmount,
            paymentMode: payMode,
            transactionRef: payRef,
            receivedBy: payAgent,
          },
        }),
      });

      if (res.ok) {
        const updatedOrd = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === targetOrder.id || o.reference === targetOrder.reference ? { ...o, ...updatedOrd } : o)));
        setPaymentWizardModal(false);
        setPayAmount(0);
        setPayRef("");
        fetchData();
        setActiveMenu("finances");
        setFinanceSubTab("recettes");
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Erreur lors de l'enregistrement du reçu.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateExpense = async () => {
    if (!expCategory || expAmount <= 0) {
      alert("Veuillez sélectionner une catégorie et saisir un montant valide.");
      return;
    }
    try {
      const res = await fetch("/api/admin/finances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: expCategory,
          description: expDescription || expCategory,
          amount: expAmount,
          supplier: expSupplier,
          paymentMode: expPaymentMode,
        }),
      });

      if (res.ok) {
        setNewExpenseModal(false);
        setExpDescription("");
        setExpAmount(0);
        setExpSupplier("");
        fetchData();
      } else {
        alert("Erreur lors de la création de la dépense.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenEditCustomer = (cust: any) => {
    setEditCustomerModal(cust);
    setEditFirstName(cust.firstName || "");
    setEditLastName(cust.lastName || "");
    setEditPhone(cust.phone || "");
    setEditEmail(cust.email || "");
    setEditCity(cust.city || "Cotonou");
    setEditCategory(cust.category || "Standard");
    setEditProfession(cust.profession || "");
    setEditNotes(cust.notes || "");

    const m = cust.measurements && cust.measurements.length > 0 ? cust.measurements[0] : {};
    setMPoitrine(m.poitrine ? String(m.poitrine) : "");
    setMSousPoitrine(m.sousPoitrine ? String(m.sousPoitrine) : "");
    setMTaille(m.taille ? String(m.taille) : "");
    setMHanches(m.hanches ? String(m.hanches) : "");
    setMCarrure(m.carrure ? String(m.carrure) : "");
    setMEpaule(m.epaule ? String(m.epaule) : "");
    setMBras(m.bras ? String(m.bras) : "");
    setMPoignet(m.poignet ? String(m.poignet) : "");
    setMHauteurPoitrine(m.hauteurPoitrine ? String(m.hauteurPoitrine) : "");
    setMEcartPoitrine(m.ecartPoitrine ? String(m.ecartPoitrine) : "");
    setMLongueurCorsage(m.longueurCorsage ? String(m.longueurCorsage) : "");
    setMLongueurDos(m.longueurDos ? String(m.longueurDos) : "");
    setMHauteurBassin(m.hauteurBassin ? String(m.hauteurBassin) : "");
    setMLongueurRobe(m.longueurRobe ? String(m.longueurRobe) : "");
    setMLongueurJupe(m.longueurJupe ? String(m.longueurJupe) : "");
    setMEntrejambe(m.entrejambe ? String(m.entrejambe) : "");
    setMPantalon(m.pantalon ? String(m.pantalon) : "");
    setMCuisse(m.cuisse ? String(m.cuisse) : "");
    setMGenou(m.genou ? String(m.genou) : "");
    setMMollet(m.mollet ? String(m.mollet) : "");
    setMCheville(m.cheville ? String(m.cheville) : "");
    setMMorphologie(m.morphologie || "Sablier (8 / X)");
  };

  const handleSaveCustomerEdits = async () => {
    if (!editCustomerModal) return;
    try {
      const res = await fetch("/api/admin/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editCustomerModal.id,
          firstName: editFirstName,
          lastName: editLastName,
          phone: editPhone,
          email: editEmail,
          city: editCity,
          category: editCategory,
          profession: editProfession,
          notes: editNotes,
          measurements: {
            poitrine: mPoitrine,
            sousPoitrine: mSousPoitrine,
            taille: mTaille,
            hanches: mHanches,
            carrure: mCarrure,
            epaule: mEpaule,
            bras: mBras,
            poignet: mPoignet,
            hauteurPoitrine: mHauteurPoitrine,
            ecartPoitrine: mEcartPoitrine,
            longueurCorsage: mLongueurCorsage,
            longueurDos: mLongueurDos,
            hauteurBassin: mHauteurBassin,
            longueurRobe: mLongueurRobe,
            longueurJupe: mLongueurJupe,
            entrejambe: mEntrejambe,
            pantalon: mPantalon,
            cuisse: mCuisse,
            genou: mGenou,
            mollet: mMollet,
            cheville: mCheville,
            morphologie: mMorphologie,
          },
        }),
      });

      if (res.ok) {
        setEditCustomerModal(null);
        fetchData();
      } else {
        alert("Erreur lors de l'enregistrement.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCustomer = async (customerId: string, customerName: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer définitivement le client "${customerName}" ?`)) {
      return;
    }
    try {
      setCustomers((prev) => {
        const updated = prev.filter((c) => c.id !== customerId);
        setStoredLocal("gy_customers", updated);
        return updated;
      });
      fetch(`/api/admin/customers?id=${customerId}`, { method: "DELETE" });
    } catch (e) {
      console.error("Error deleting customer:", e);
    }
  };

  const handleCreateCustomer = async () => {
    if (!newCustFirstName || !newCustLastName || !newCustPhone) {
      alert("Veuillez remplir le prénom, le nom et le téléphone.");
      return;
    }
    try {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: newCustFirstName,
          lastName: newCustLastName,
          phone: newCustPhone,
          email: newCustEmail,
          city: newCustCity,
          category: newCustCategory,
          profession: newCustProfession,
          notes: newCustNotes,
        }),
      });

      if (res.ok) {
        const newCust = await res.json();
        if (newCust && newCust.id) {
          setCustomers((prev) => {
            const updated = [newCust, ...prev.filter((c) => c.id !== newCust.id)];
            setStoredLocal("gy_customers", updated);
            return updated;
          });
        }
        setNewCustomerModal(false);
        setNewCustFirstName("");
        setNewCustLastName("");
        setNewCustPhone("");
        setNewCustEmail("");
        setNewCustNotes("");
        setActiveMenu("clients");
      } else {
        const err = await res.json();
        alert(err.error || "Erreur lors de la création du client");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateOrder = async () => {
    const targetCustomerId = newOrderCustomerId || (customers.length > 0 ? customers[0].id : "");
    if (!targetCustomerId || !newOrderItemName || Number(newOrderTotalAmount) <= 0) {
      alert("Veuillez choisir un client, le nom de la tenue et un montant valide.");
      return;
    }
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: targetCustomerId,
          itemName: newOrderItemName,
          orderDate: newOrderOrderDate,
          promisedDate: newOrderPromisedDate,
          fabricDetails: newOrderFabricDetails,
          customNotes: newOrderCustomNotes,
          totalAmount: Number(newOrderTotalAmount),
          depositRequired: Number(newOrderDepositRequired),
          priority: newOrderPriority,
        }),
      });

      if (res.ok) {
        const newOrd = await res.json();
        if (newOrd && newOrd.id) {
          setOrders((prev) => {
            const updated = [newOrd, ...prev.filter((o) => o.id !== newOrd.id)];
            setStoredLocal("gy_orders", updated);
            return updated;
          });
        }
        setNewOrderModal(false);
        setNewOrderItemName("");
        setNewOrderFabricDetails("");
        setNewOrderCustomNotes("");
        setNewOrderTotalAmount(0);
        setNewOrderDepositRequired(0);
        setActiveMenu("commandes");
      } else {
        const err = await res.json();
        alert(err.error || "Erreur lors de la création de la commande");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateAdminUser = async () => {
    if (!adminEmail || !adminPassword || !adminFullName) {
      alert("Veuillez remplir le nom complet, l'email et le mot de passe.");
      return;
    }
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: adminFullName,
          email: adminEmail,
          password: adminPassword,
          role: adminRole,
        }),
      });

      if (res.ok) {
        alert(`Le compte administrateur pour ${adminFullName} (${adminEmail}) a été créé avec succès !`);
        setNewAdminModal(false);
        setAdminFullName("");
        setAdminEmail("");
        setAdminPassword("");
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Erreur lors de la création du compte.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          newStatus,
        }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatFcfa = (val: number) => {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 })
      .format(val || 0)
      .replace("XOF", "FCFA");
  };

  const formatDate = (dStr: string) => {
    if (!dStr) return "-";
    return new Date(dStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const filteredCustomers = (Array.isArray(customers) ? customers : []).filter((c) =>
    `${c?.firstName || ""} ${c?.lastName || ""} ${c?.code || ""} ${c?.phone || ""}`.toLowerCase().includes((searchTerm || "").toLowerCase())
  );

  const filteredOrders = (Array.isArray(orders) ? orders : []).filter((o) =>
    `${o?.reference || ""} ${o?.customer?.firstName || ""} ${o?.customer?.lastName || ""} ${o?.items?.[0]?.itemName || ""}`
      .toLowerCase()
      .includes((searchTerm || "").toLowerCase())
  );

  const filteredRecettes = (Array.isArray(recettesList) ? recettesList : []).filter((r) =>
    `${r?.receiptNumber || ""} ${r?.customer?.firstName || ""} ${r?.customer?.lastName || ""} ${r?.order?.reference || ""}`
      .toLowerCase()
      .includes((searchTerm || "").toLowerCase())
  );

  const filteredDepenses = (Array.isArray(depensesList) ? depensesList : []).filter((d) =>
    `${d?.reference || ""} ${d?.category || ""} ${d?.description || ""} ${d?.supplier || ""}`
      .toLowerCase()
      .includes((searchTerm || "").toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0B0B0E] text-[#E5E5EB] flex items-center justify-center p-4 font-aptos">
        <div className="glass-panel max-w-md w-full p-8 rounded-3xl border-2 border-[#D4AF37]/50 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <img
              src="/logogy.png"
              alt="GY MAISON COUTURE"
              className="h-20 w-auto object-contain mx-auto drop-shadow-[0_0_25px_rgba(212,175,55,0.5)]"
            />
            <div>
              <h1 className="font-serif text-3xl font-bold text-white tracking-wide">GY MAISON COUTURE</h1>
              <p className="text-xs font-black text-[#D4AF37] uppercase tracking-widest mt-1">PORTAIL D&apos;ACCÈS SÉCURISÉ ADMIN ERP</p>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 pt-2">
            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold text-center">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-gy-textMuted mb-1 font-semibold text-xs uppercase tracking-wider">Identifiant / Email *</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="gymaisoncouture@gmail.com"
                className="w-full bg-[#181820] border border-[#2A2A38] rounded-xl p-3.5 text-white font-bold text-sm focus:border-[#D4AF37] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-gy-textMuted mb-1 font-semibold text-xs uppercase tracking-wider">Mot de Passe *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#181820] border border-[#2A2A38] rounded-xl p-3.5 pr-24 text-white font-bold text-sm focus:border-[#D4AF37] focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[#252533] border border-[#3A3A4D] text-[#D4AF37] hover:text-white font-black text-[11px] uppercase tracking-wider transition-colors"
                >
                  {showPassword ? "MASQUER" : "VOIR"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#997A2C] text-black font-black text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(212,175,55,0.4)] hover:opacity-95 transition-opacity"
            >
              {loginLoading ? "CONNEXION EN COURS..." : "SE CONNECTER AU PORTAIL ADMIN"}
            </button>
          </form>

          <div className="text-center pt-3 border-t border-[#2A2A38] space-y-1.5">
            <span className="text-[11px] text-gy-textMuted block">
              Compte administrateur : <strong className="text-[#D4AF37]">gymaisoncouture@gmail.com</strong>
            </span>
            <a
              href="https://www.saninovagc.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-black text-emerald-400 hover:text-emerald-300 animate-pulse tracking-wider block drop-shadow-[0_0_12px_rgba(16,185,129,0.9)] transition-colors hover:underline"
            >
              By SaniNova Global Consulting
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0E] text-[#E5E5EB] flex overflow-hidden font-aptos">
      {/* MOBILE DRAWER OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-64 max-w-[85vw] bg-[#121217] border-r border-[#2A2A38] flex flex-col justify-between select-none z-50 h-full font-aptos">
            <div className="overflow-y-auto max-h-screen">
              <div className="p-5 border-b border-[#2A2A38] flex items-center justify-between sticky top-0 bg-[#121217] z-20">
                <Link href="/" className="flex items-center group">
                  <img
                    src="/logogy.png"
                    alt="GY MAISON COUTURE"
                    className="h-12 w-auto object-contain drop-shadow-[0_0_20px_rgba(212,175,55,0.45)] group-hover:scale-105 transition-all"
                  />
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 bg-[#181820] border border-[#2A2A38] text-white rounded-xl text-xs font-black"
                >
                  [ FERMER ]
                </button>
              </div>

              <div className="px-4 py-6 space-y-2.5 text-sm">
                <div className="px-3 mb-3 text-[11px] font-black text-[#D4AF37] uppercase tracking-widest">
                  MENUS PRINCIPAUX
                </div>

                <button
                  onClick={() => { setActiveMenu("dashboard"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-start px-5 py-4 rounded-2xl text-sm transition-all tracking-wider font-extrabold ${
                    activeMenu === "dashboard"
                      ? "bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#997A2C] text-black shadow-[0_4px_20px_rgba(212,175,55,0.4)]"
                      : "bg-[#181820] text-white border border-[#2A2A38] hover:border-[#D4AF37]/60 hover:bg-[#20202C]"
                  }`}
                >
                  <span>DASHBOARD</span>
                </button>

                <button
                  onClick={() => { setActiveMenu("clients"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-start px-5 py-4 rounded-2xl text-sm transition-all tracking-wider font-extrabold ${
                    activeMenu === "clients"
                      ? "bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#997A2C] text-black shadow-[0_4px_20px_rgba(212,175,55,0.4)]"
                      : "bg-[#181820] text-white border border-[#2A2A38] hover:border-[#D4AF37]/60 hover:bg-[#20202C]"
                  }`}
                >
                  <span>CLIENTS</span>
                </button>

                <button
                  onClick={() => { setActiveMenu("espace-client"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-start px-5 py-4 rounded-2xl text-sm transition-all tracking-wider font-extrabold ${
                    activeMenu === "espace-client"
                      ? "bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#997A2C] text-black shadow-[0_4px_20px_rgba(212,175,55,0.4)]"
                      : "bg-[#181820] text-white border border-[#2A2A38] hover:border-[#D4AF37]/60 hover:bg-[#20202C]"
                  }`}
                >
                  <span>ESPACE CLIENT VIP</span>
                </button>

                <button
                  onClick={() => { setActiveMenu("commandes"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-start px-5 py-4 rounded-2xl text-sm transition-all tracking-wider font-extrabold ${
                    activeMenu === "commandes"
                      ? "bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#997A2C] text-black shadow-[0_4px_20px_rgba(212,175,55,0.4)]"
                      : "bg-[#181820] text-white border border-[#2A2A38] hover:border-[#D4AF37]/60 hover:bg-[#20202C]"
                  }`}
                >
                  <span>COMMANDES</span>
                </button>

                <button
                  onClick={() => { setActiveMenu("atelier"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-start px-5 py-4 rounded-2xl text-sm transition-all tracking-wider font-extrabold ${
                    activeMenu === "atelier"
                      ? "bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#997A2C] text-black shadow-[0_4px_20px_rgba(212,175,55,0.4)]"
                      : "bg-[#181820] text-white border border-[#2A2A38] hover:border-[#D4AF37]/60 hover:bg-[#20202C]"
                  }`}
                >
                  <span>ATELIER</span>
                </button>

                <div>
                  <button
                    onClick={() => setActiveMenu("finances")}
                    className={`w-full flex items-center justify-start px-5 py-4 rounded-2xl text-sm transition-all tracking-wider font-extrabold ${
                      activeMenu === "finances"
                        ? "bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#997A2C] text-black shadow-[0_4px_20px_rgba(212,175,55,0.4)]"
                        : "bg-[#181820] text-white border border-[#2A2A38] hover:border-[#D4AF37]/60 hover:bg-[#20202C]"
                    }`}
                  >
                    <span>FINANCES</span>
                  </button>

                  {activeMenu === "finances" && (
                    <div className="pl-4 pr-2 py-2 space-y-1.5 border-l-2 border-[#D4AF37]/50 ml-5 mt-2 bg-[#0E0E12] rounded-xl">
                      <button
                        onClick={() => { setFinanceSubTab("recettes"); setMobileMenuOpen(false); }}
                        className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-black transition-all tracking-wider ${
                          financeSubTab === "recettes"
                            ? "bg-[#D4AF37]/20 text-[#F3E5AB] border border-[#D4AF37]/50 shadow-sm"
                            : "text-[#A3A3B3] hover:text-white hover:bg-[#181820]"
                        }`}
                      >
                        <span>RECETTES</span>
                      </button>

                      <button
                        onClick={() => { setFinanceSubTab("depenses"); setMobileMenuOpen(false); }}
                        className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-black transition-all tracking-wider ${
                          financeSubTab === "depenses"
                            ? "bg-[#D4AF37]/20 text-[#F3E5AB] border border-[#D4AF37]/50 shadow-sm"
                            : "text-[#A3A3B3] hover:text-white hover:bg-[#181820]"
                        }`}
                      >
                        <span>DÉPENSES</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => { setActiveMenu("rh"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-start px-5 py-4 rounded-2xl text-sm transition-all tracking-wider font-extrabold ${
                    activeMenu === "rh"
                      ? "bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#997A2C] text-black shadow-[0_4px_20px_rgba(212,175,55,0.4)]"
                      : "bg-[#181820] text-white border border-[#2A2A38] hover:border-[#D4AF37]/60 hover:bg-[#20202C]"
                  }`}
                >
                  <span>RH</span>
                </button>

                <button
                  onClick={() => { setActiveMenu("administrations"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-start px-5 py-4 rounded-2xl text-sm transition-all tracking-wider font-extrabold ${
                    activeMenu === "administrations"
                      ? "bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#997A2C] text-black shadow-[0_4px_20px_rgba(212,175,55,0.4)]"
                      : "bg-[#181820] text-white border border-[#2A2A38] hover:border-[#D4AF37]/60 hover:bg-[#20202C]"
                  }`}
                >
                  <span>ADMINISTRATIONS</span>
                </button>
              </div>
            </div>
            <div className="p-3 border-t border-[#2A2A38] bg-[#0E0E12] text-center">
              <a
                href="https://www.saninovagc.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-black text-emerald-400 hover:text-emerald-300 animate-pulse tracking-wider block drop-shadow-[0_0_10px_rgba(16,185,129,0.9)] transition-colors hover:underline"
              >
                By SaniNova Global Consulting
              </a>
            </div>
          </aside>
        </div>
      )}

      {/* DESKTOP SIDEBAR NAVIGATION */}
      <aside className="hidden lg:flex w-64 bg-[#121217] border-r border-[#2A2A38] flex-col justify-between select-none z-30 shrink-0 font-aptos">
        <div className="overflow-y-auto max-h-screen">
          <div className="p-5 border-b border-[#2A2A38] flex items-center justify-center sticky top-0 bg-[#121217] z-20">
            <Link href="/" className="flex items-center justify-center group">
              <img
                src="/logogy.png"
                alt="GY MAISON COUTURE"
                className="h-12 w-auto object-contain drop-shadow-[0_0_22px_rgba(212,175,55,0.5)] group-hover:scale-105 transition-all"
              />
            </Link>
          </div>

          <div className="px-3 py-5 space-y-2 text-sm">
            <div className="px-3 mb-2 text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">
              MENUS PRINCIPAUX
            </div>

            <button
              onClick={() => setActiveMenu("dashboard")}
              className={`w-full flex items-center justify-start px-4 py-3 rounded-xl text-xs sm:text-sm transition-all tracking-wider font-extrabold ${
                activeMenu === "dashboard"
                  ? "bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#997A2C] text-black shadow-[0_4px_20px_rgba(212,175,55,0.4)]"
                  : "bg-[#181820] text-white border border-[#2A2A38] hover:border-[#D4AF37]/60 hover:bg-[#20202C]"
              }`}
            >
              <span>DASHBOARD</span>
            </button>

            <button
              onClick={() => setActiveMenu("clients")}
              className={`w-full flex items-center justify-start px-4 py-3 rounded-xl text-xs sm:text-sm transition-all tracking-wider font-extrabold ${
                activeMenu === "clients"
                  ? "bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#997A2C] text-black shadow-[0_4px_20px_rgba(212,175,55,0.4)]"
                  : "bg-[#181820] text-white border border-[#2A2A38] hover:border-[#D4AF37]/60 hover:bg-[#20202C]"
              }`}
            >
              <span>CLIENTS</span>
            </button>

            <button
              onClick={() => setActiveMenu("espace-client")}
              className={`w-full flex items-center justify-start px-4 py-3 rounded-xl text-xs sm:text-sm transition-all tracking-wider font-extrabold ${
                activeMenu === "espace-client"
                  ? "bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#997A2C] text-black shadow-[0_4px_20px_rgba(212,175,55,0.4)]"
                  : "bg-[#181820] text-white border border-[#2A2A38] hover:border-[#D4AF37]/60 hover:bg-[#20202C]"
              }`}
            >
              <span>ESPACE CLIENT</span>
            </button>

            <button
              onClick={() => setActiveMenu("commandes")}
              className={`w-full flex items-center justify-start px-4 py-3 rounded-xl text-xs sm:text-sm transition-all tracking-wider font-extrabold ${
                activeMenu === "commandes"
                  ? "bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#997A2C] text-black shadow-[0_4px_20px_rgba(212,175,55,0.4)]"
                  : "bg-[#181820] text-white border border-[#2A2A38] hover:border-[#D4AF37]/60 hover:bg-[#20202C]"
              }`}
            >
              <span>COMMANDES</span>
            </button>

            <button
              onClick={() => setActiveMenu("atelier")}
              className={`w-full flex items-center justify-start px-4 py-3 rounded-xl text-xs sm:text-sm transition-all tracking-wider font-extrabold ${
                activeMenu === "atelier"
                  ? "bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#997A2C] text-black shadow-[0_4px_20px_rgba(212,175,55,0.4)]"
                  : "bg-[#181820] text-white border border-[#2A2A38] hover:border-[#D4AF37]/60 hover:bg-[#20202C]"
              }`}
            >
              <span>ATELIER</span>
            </button>

            <div>
              <button
                onClick={() => setActiveMenu("finances")}
                className={`w-full flex items-center justify-start px-4 py-3 rounded-xl text-xs sm:text-sm transition-all tracking-wider font-extrabold ${
                  activeMenu === "finances"
                    ? "bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#997A2C] text-black shadow-[0_4px_20px_rgba(212,175,55,0.4)]"
                    : "bg-[#181820] text-white border border-[#2A2A38] hover:border-[#D4AF37]/60 hover:bg-[#20202C]"
                }`}
              >
                <span>FINANCES</span>
              </button>

              {activeMenu === "finances" && (
                <div className="pl-3 pr-2 py-2 space-y-1.5 border-l-2 border-[#D4AF37]/50 ml-4 mt-2 bg-[#0E0E12] rounded-xl">
                  <button
                    onClick={() => setFinanceSubTab("recettes")}
                    className={`w-full text-left py-2 px-3 rounded-xl text-xs font-black transition-all tracking-wider ${
                      financeSubTab === "recettes"
                        ? "bg-[#D4AF37]/20 text-[#F3E5AB] border border-[#D4AF37]/50 shadow-sm"
                        : "text-[#A3A3B3] hover:text-white hover:bg-[#181820]"
                    }`}
                  >
                    <span>RECETTES</span>
                  </button>

                  <button
                    onClick={() => setFinanceSubTab("depenses")}
                    className={`w-full text-left py-2 px-3 rounded-xl text-xs font-black transition-all tracking-wider ${
                      financeSubTab === "depenses"
                        ? "bg-[#D4AF37]/20 text-[#F3E5AB] border border-[#D4AF37]/50 shadow-sm"
                        : "text-[#A3A3B3] hover:text-white hover:bg-[#181820]"
                    }`}
                  >
                    <span>DÉPENSES</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveMenu("rh")}
              className={`w-full flex items-center justify-start px-4 py-3 rounded-xl text-xs sm:text-sm transition-all tracking-wider font-extrabold ${
                activeMenu === "rh"
                  ? "bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#997A2C] text-black shadow-[0_4px_20px_rgba(212,175,55,0.4)]"
                  : "bg-[#181820] text-white border border-[#2A2A38] hover:border-[#D4AF37]/60 hover:bg-[#20202C]"
              }`}
            >
              <span>RH</span>
            </button>

            <button
              onClick={() => setActiveMenu("administrations")}
              className={`w-full flex items-center justify-start px-4 py-3 rounded-xl text-xs sm:text-sm transition-all tracking-wider font-extrabold ${
                activeMenu === "administrations"
                  ? "bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#997A2C] text-black shadow-[0_4px_20px_rgba(212,175,55,0.4)]"
                  : "bg-[#181820] text-white border border-[#2A2A38] hover:border-[#D4AF37]/60 hover:bg-[#20202C]"
              }`}
            >
              <span>ADMINISTRATIONS</span>
            </button>
          </div>
        </div>

        <div className="p-3 border-t border-[#2A2A38] bg-[#0E0E12] sticky bottom-0 bg-[#121217]">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#181820] border border-[#D4AF37]/40 shadow-md">
            <div className="flex items-center space-x-2 min-w-0">
              <img
                src="/logogy.png"
                alt="GY"
                className="h-8 w-auto object-contain drop-shadow-md shrink-0"
              />
              <div className="text-left min-w-0">
                <div className="text-xs font-black text-white leading-tight truncate">Ghislaine LOKO</div>
                <div className="text-[10px] text-[#D4AF37] font-bold truncate">Directrice Générale</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Déconnexion"
              className="text-rose-400 hover:bg-rose-500 hover:text-white font-black text-[10px] px-2 py-1 border border-rose-500/40 rounded-lg transition-colors uppercase shrink-0"
            >
              SORTIR
            </button>
          </div>
          <div className="mt-2 text-center">
            <a
              href="https://www.saninovagc.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] sm:text-[11px] font-black text-emerald-400 hover:text-emerald-300 animate-pulse tracking-wider block drop-shadow-[0_0_10px_rgba(16,185,129,0.9)] transition-colors hover:underline"
            >
              By SaniNova Global Consulting
            </a>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto font-aptos">
        <header className="h-20 border-b border-[#2A2A38] bg-[#121217]/90 backdrop-blur-md sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 flex-1 max-w-lg">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden px-3.5 py-2.5 bg-[#181820] border-2 border-[#D4AF37]/60 text-[#F3E5AB] hover:bg-[#222230] rounded-xl font-black text-xs transition-all shadow-md uppercase tracking-wider shrink-0"
            >
              [ MENU ]
            </button>

            <div className="relative w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="RECHERCHER CLIENT, COMMANDE, REÇU..."
                className="w-full bg-[#181820] border border-[#2A2A38] rounded-2xl px-5 py-3 text-xs font-bold text-white placeholder-gy-textMuted focus:border-[#D4AF37] focus:outline-none transition-all shadow-inner"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white border border-rose-500/40 rounded-xl font-black text-xs transition-all uppercase tracking-wider shadow-md shrink-0 cursor-pointer"
            >
              DÉCONNEXION
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-8 space-y-6 sm:space-y-8 flex-1 max-w-7xl w-full mx-auto font-aptos">
          {/* DASHBOARD */}
          {activeMenu === "dashboard" && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Aujourd&apos;hui • Cotonou, Bénin</span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-1">DASHBOARD EXÉCUTIF</h2>
                </div>
                <button
                  onClick={() => setNewOrderModal(true)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FFE885] via-[#D4AF37] to-[#C5A059] text-black font-black text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(212,175,55,0.4)] border-2 border-[#FFF3B0] hover:scale-[1.02] transition-all"
                >
                  + NOUVELLE COMMANDE VIP
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                <div className="framed-card p-5 overflow-hidden">
                  <span className="text-[11px] font-extrabold text-gy-textMuted uppercase tracking-wider block">Chiffre d&apos;Affaires (Mois)</span>
                  <h3 className="font-serif text-xl sm:text-lg md:text-xl font-black text-white mt-2 truncate" title={formatFcfa(metrics?.totalRevenueMonth || 0)}>
                    {formatFcfa(metrics?.totalRevenueMonth || 0)}
                  </h3>
                </div>

                <div className="framed-card p-5 overflow-hidden">
                  <span className="text-[11px] font-extrabold text-gy-textMuted uppercase tracking-wider block">Montant Encaissé</span>
                  <h3 className="font-serif text-xl sm:text-lg md:text-xl font-black text-emerald-400 mt-2 truncate" title={formatFcfa(metrics?.totalCollected || 0)}>
                    {formatFcfa(metrics?.totalCollected || 0)}
                  </h3>
                </div>

                <div className="framed-card p-5 overflow-hidden">
                  <span className="text-[11px] font-extrabold text-gy-textMuted uppercase tracking-wider block">Créances Clients</span>
                  <h3 className="font-serif text-xl sm:text-lg md:text-xl font-black text-amber-400 mt-2 truncate" title={formatFcfa(metrics?.totalReceivables || 0)}>
                    {formatFcfa(metrics?.totalReceivables || 0)}
                  </h3>
                </div>

                <div className="framed-card p-5 overflow-hidden">
                  <span className="text-[11px] font-extrabold text-gy-textMuted uppercase tracking-wider block">Nombre de Clients VIP</span>
                  <h3 className="font-serif text-2xl font-black text-[#F3E5AB] mt-2">
                    {customers.length || 0}
                  </h3>
                </div>

                <div className="framed-card p-5 overflow-hidden">
                  <span className="text-[11px] font-extrabold text-gy-textMuted uppercase tracking-wider block">Commandes Actives</span>
                  <h3 className="font-serif text-2xl font-black text-white mt-2">
                    {metrics?.totalOrders || 0}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* CLIENTS MODULE FULL TABLE                                 */}
          {/* ========================================================= */}
          {activeMenu === "clients" && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">RÉPERTOIRE DES CLIENTS VIP</h2>
                  <p className="text-xs sm:text-sm text-gy-textMuted mt-1">Gestion complète des clients, mensurations et commandes associées</p>
                </div>
                <button
                  onClick={() => setNewCustomerModal(true)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FFE885] via-[#D4AF37] to-[#C5A059] text-black font-black text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(212,175,55,0.4)] border-2 border-[#FFF3B0] hover:scale-[1.02] transition-all"
                >
                  + CRÉER NOUVEAU CLIENT
                </button>
              </div>

              <div className="framed-card p-2 overflow-hidden border-2 border-gy-border">
                <div className="overflow-x-auto">
                  <table className="framed-table text-left text-sm text-gy-text font-aptos">
                    <thead>
                      <tr>
                        <th className="min-w-[110px]">CODE</th>
                        <th className="min-w-[180px]">NOM & PRÉNOM</th>
                        <th className="min-w-[160px]">TÉLÉPHONE</th>
                        <th className="min-w-[130px]">VILLE</th>
                        <th className="min-w-[140px]">CATÉGORIE</th>
                        <th className="min-w-[140px]">COMMANDES</th>
                        <th className="min-w-[180px] text-center">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map((c) => (
                        <tr key={c.id}>
                          <td className="font-bold text-gy-gold">{c.code}</td>
                          <td className="font-bold text-white text-base">
                            {c.firstName} {c.lastName}
                          </td>
                          <td className="font-semibold text-gy-text">{c.phone}</td>
                          <td className="text-gy-textMuted">{c.city}</td>
                          <td>
                            <span className="framed-badge-gold text-xs font-black">
                              {c.category}
                            </span>
                          </td>
                          <td className="font-bold text-white">
                            {c.orders?.length || 0} commande(s)
                          </td>
                          <td>
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => setViewCustomerModal(c)}
                                className="px-4 py-2 rounded-xl bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-white border border-sky-500/40 transition-colors text-xs font-black uppercase tracking-wider"
                              >
                                VOIR
                              </button>

                              <button
                                onClick={() => handleOpenEditCustomer(c)}
                                className="px-4 py-2 rounded-xl bg-gy-gold/20 text-gy-gold hover:bg-gy-gold hover:text-black border border-gy-gold/50 transition-colors text-xs font-black uppercase tracking-wider"
                              >
                                MODIFIER
                              </button>

                              <button
                                onClick={() => handleDeleteCustomer(c.id, `${c.firstName} ${c.lastName}`)}
                                className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/40 transition-colors text-xs font-black uppercase tracking-wider"
                              >
                                SUPPRIMER
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* COMMANDES MODULE FULL TABLE                               */}
          {/* ========================================================= */}
          {activeMenu === "commandes" && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">GESTION DES COMMANDES & TISSUS VOULUS</h2>
                  <p className="text-xs sm:text-sm text-gy-textMuted mt-1">Détails des matières, dates de commande et dates de retrait souhaité par les clients</p>
                </div>
                <button
                  onClick={() => setNewOrderModal(true)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FFE885] via-[#D4AF37] to-[#C5A059] text-black font-black text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(212,175,55,0.4)] border-2 border-[#FFF3B0] hover:scale-[1.02] transition-all"
                >
                  + ENREGISTRER UNE COMMANDE
                </button>
              </div>

              <div className="framed-card p-2 overflow-hidden border-2 border-gy-border">
                <div className="overflow-x-auto">
                  <table className="framed-table text-left text-sm text-gy-text font-aptos">
                    <thead>
                      <tr>
                        <th className="min-w-[130px]">REF</th>
                        <th className="min-w-[170px]">CLIENT</th>
                        <th className="min-w-[260px]">TENUE & TISSU VOULU</th>
                        <th className="min-w-[140px]">DATE COMMANDE</th>
                        <th className="min-w-[170px]">DATE RETRAIT SOUHAITÉ</th>
                        <th className="min-w-[150px]">MONTANT TOTAL</th>
                        <th className="min-w-[150px]">SOLDE RESTANT</th>
                        <th className="min-w-[180px]">STATUT ATELIER</th>
                        <th className="min-w-[160px] text-center">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((o) => {
                        const cust = customers.find((c) => c.id === o.customerId) || o.customer;
                        const custName = cust
                          ? `${cust.firstName || ""} ${cust.lastName || ""}`.trim() || cust.fullName || cust.name || "Client"
                          : o.customerName || (o.customer ? `${o.customer.firstName || ""} ${o.customer.lastName || ""}`.trim() : "Client");
                        return (
                          <tr key={o.id}>
                            <td className="font-bold text-white">
                              <span className="framed-badge-gold text-xs font-black">{o.reference}</span>
                            </td>
                            <td className="font-bold text-white text-base">
                              {custName}
                            </td>
                          <td>
                            <div className="p-2.5 rounded-xl bg-gy-dark/90 border border-gy-gold/30">
                              <strong className="text-gy-gold text-base block font-bold">{o.items[0]?.itemName || "Création Sur-Mesure"}</strong>
                              <span className="text-xs text-gy-textMuted block mt-1">
                                TISSU: {o.items[0]?.fabricDetails || "Non précisé"}
                              </span>
                            </div>
                          </td>
                          <td className="font-semibold text-gy-textMuted">{formatDate(o.orderDate || o.createdAt)}</td>
                          <td>
                            <span className="framed-badge-amber text-xs font-bold">
                              RETRAIT: {formatDate(o.promisedDate)}
                            </span>
                          </td>
                          <td>
                            <span className="framed-badge-emerald text-sm font-bold">
                              {formatFcfa(o.totalAmount)}
                            </span>
                          </td>
                          <td>
                            <span className="framed-badge-amber text-sm font-bold">
                              {formatFcfa(o.balanceDue)}
                            </span>
                          </td>
                          <td>
                            <select
                              value={o.status}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                              className="bg-gy-dark border border-gy-gold/50 text-xs rounded-xl p-2.5 text-gy-gold font-bold focus:outline-none w-full"
                            >
                              <option value="ACOMPTE_ATTENDU">ACOMPTE ATTENDU</option>
                              <option value="PRODUCTION">PRODUCTION EN ATELIER</option>
                              <option value="ESSAYAGE">ESSAYAGE CLIENT</option>
                              <option value="RETOUCHE">RETOUCHE</option>
                              <option value="CONTROLE_QUALITE">CONTRÔLE QUALITÉ</option>
                              <option value="SOLDE_A_PAYER">SOLDE À PAYER</option>
                              <option value="PRET">PRÊT À LIVRER</option>
                              <option value="CLOTURE">CLÔTURÉ</option>
                            </select>
                          </td>
                          <td>
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => setViewOrderModal(o)}
                                className="px-3 py-2 rounded-xl bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-white border border-sky-500/40 text-xs font-black uppercase tracking-wider"
                              >
                                FICHE
                              </button>
                              <button
                                onClick={() => handleOpenPaymentWizard(o.customer, o)}
                                className="px-3 py-2 bg-gy-gold/20 text-gy-gold hover:bg-gy-gold hover:text-black border border-gy-gold/40 rounded-xl text-xs font-black uppercase tracking-wider"
                              >
                                + REÇU
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* FINANCES MODULE */}
          {activeMenu === "finances" && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">GESTION FINANCIÈRE GY MAISON</h2>
                  <p className="text-xs sm:text-sm text-gy-textMuted mt-1">Suivi en FCFA des recettes d&apos;encaissements et dépenses de fonctionnement</p>
                </div>

                <div className="w-full sm:w-auto">
                  {financeSubTab === "recettes" ? (
                    <button
                      onClick={() => handleOpenPaymentWizard()}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:opacity-95"
                    >
                      + ENREGISTRER UN PAIEMENT CLIENT
                    </button>
                  ) : (
                    <button
                      onClick={() => setNewExpenseModal(true)}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-600 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:opacity-95"
                    >
                      + ENREGISTRER UNE DÉPENSE
                    </button>
                  )}
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="framed-card p-6 border-l-4 border-l-emerald-500">
                  <span className="text-xs font-bold text-gy-textMuted uppercase tracking-wider block">Total Recettes (Encaissements)</span>
                  <h3 className="font-serif text-3xl font-bold text-emerald-400 mt-2">{formatFcfa(financeMetrics?.totalRecettes || 0)}</h3>
                </div>

                <div className="framed-card p-6 border-l-4 border-l-rose-500">
                  <span className="text-xs font-bold text-gy-textMuted uppercase tracking-wider block">Total Dépenses & Achats</span>
                  <h3 className="font-serif text-3xl font-bold text-rose-400 mt-2">{formatFcfa(financeMetrics?.totalDepenses || 0)}</h3>
                </div>

                <div className="framed-card p-6 border-l-4 border-l-[#D4AF37]">
                  <span className="text-xs font-bold text-gy-textMuted uppercase tracking-wider block">Bénéfice Net en Caisse</span>
                  <h3 className="font-serif text-3xl font-bold text-[#F3E5AB] mt-2">{formatFcfa(financeMetrics?.netBalance || 0)}</h3>
                </div>
              </div>

              {/* Sub-menu Tabs Switcher Header */}
              <div className="flex border-b-2 border-[#2A2A38] space-x-4">
                <button
                  onClick={() => setFinanceSubTab("recettes")}
                  className={`py-3.5 px-6 font-black text-xs uppercase tracking-wider rounded-t-2xl transition-all border-t-2 border-x-2 ${
                    financeSubTab === "recettes"
                      ? "bg-[#141419] border-[#D4AF37] text-[#F3E5AB] shadow-md"
                      : "bg-[#0E0E12] border-transparent text-[#A3A3B3] hover:text-white"
                  }`}
                >
                  RECETTES (PAIEMENTS CLIENTS - {filteredRecettes.length})
                </button>

                <button
                  onClick={() => setFinanceSubTab("depenses")}
                  className={`py-3.5 px-6 font-black text-xs uppercase tracking-wider rounded-t-2xl transition-all border-t-2 border-x-2 ${
                    financeSubTab === "depenses"
                      ? "bg-[#141419] border-[#D4AF37] text-[#F3E5AB] shadow-md"
                      : "bg-[#0E0E12] border-transparent text-[#A3A3B3] hover:text-white"
                  }`}
                >
                  DÉPENSES (ACHATS TISSUS, SALAIRES, LOYER - {filteredDepenses.length})
                </button>
              </div>

              {/* SOUS-MENU 1: RECETTES */}
              {financeSubTab === "recettes" && (
                <div className="framed-card p-2 overflow-hidden border-2 border-gy-border">
                  <div className="overflow-x-auto">
                    <table className="framed-table text-left text-sm text-gy-text font-aptos">
                      <thead>
                        <tr>
                          <th className="min-w-[130px]">N° REÇU</th>
                          <th className="min-w-[140px]">REF COMMANDE</th>
                          <th className="min-w-[180px]">CLIENT</th>
                          <th className="min-w-[160px]">MONTANT ENCAISSÉ</th>
                          <th className="min-w-[160px]">MODE DE PAIEMENT</th>
                          <th className="min-w-[140px]">DATE ENCAISSÉ</th>
                          <th className="min-w-[160px]">REÇU PAR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecettes.map((r) => {
                          const cust = customers.find((c) => c.id === r.customerId) || r.customer;
                          const cName = cust
                            ? `${cust.firstName || ""} ${cust.lastName || ""}`.trim() || cust.fullName || cust.name || "Client"
                            : r.customer ? `${r.customer.firstName || ""} ${r.customer.lastName || ""}`.trim() : "Client";
                          return (
                            <tr key={r.id}>
                              <td className="font-bold text-white">
                                <span className="framed-badge-gold text-xs font-black">{r.receiptNumber}</span>
                              </td>
                              <td className="font-bold text-[#D4AF37]">{r.order?.reference || "ORD-2026-0001"}</td>
                              <td className="font-bold text-white text-base">
                                {cName}
                              </td>
                            <td>
                              <span className="framed-badge-emerald text-base font-bold">
                                {formatFcfa(r.amount)}
                              </span>
                            </td>
                            <td className="font-semibold text-gy-text">
                              <span className="px-3 py-1 bg-gy-dark border border-gy-border rounded-xl text-xs font-bold text-sky-400 uppercase">
                                {r.paymentMode}
                              </span>
                            </td>
                            <td className="font-semibold text-gy-textMuted">{formatDate(r.createdAt)}</td>
                            <td className="text-gy-textMuted text-xs font-bold">{r.receivedBy || "Administration GY"}</td>
                          </tr>
                        );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SOUS-MENU 2: DÉPENSES */}
              {financeSubTab === "depenses" && (
                <div className="framed-card p-2 overflow-hidden border-2 border-gy-border">
                  <div className="overflow-x-auto">
                    <table className="framed-table text-left text-sm text-gy-text font-aptos">
                      <thead>
                        <tr>
                          <th className="min-w-[130px]">N° DÉPENSE</th>
                          <th className="min-w-[170px]">CATÉGORIE DÉPENSE</th>
                          <th className="min-w-[260px]">DESCRIPTION / LIBELLÉ</th>
                          <th className="min-w-[160px]">MONTANT DÉPENSÉ</th>
                          <th className="min-w-[180px]">FOURNISSEUR / PRESTATAIRE</th>
                          <th className="min-w-[150px]">MODE DE PAIEMENT</th>
                          <th className="min-w-[140px]">DATE DÉPENSE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDepenses.map((d) => (
                          <tr key={d.id}>
                            <td className="font-bold text-white">
                              <span className="framed-badge-amber text-xs font-black">{d.reference}</span>
                            </td>
                            <td>
                              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                                {d.category}
                              </span>
                            </td>
                            <td className="font-bold text-white text-base">
                              {d.description}
                            </td>
                            <td>
                              <span className="px-3 py-1.5 rounded-xl text-base font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                                - {formatFcfa(d.amount)}
                              </span>
                            </td>
                            <td className="font-semibold text-gy-gold">{d.supplier}</td>
                            <td>
                              <span className="px-3 py-1 bg-gy-dark border border-gy-border rounded-xl text-xs font-bold text-gy-text uppercase">
                                {d.paymentMode}
                              </span>
                            </td>
                            <td className="font-semibold text-gy-textMuted">{formatDate(d.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* ESPACE CLIENT VIP MODULE                                  */}
          {/* ========================================================= */}
          {activeMenu === "espace-client" && (
            <div className="space-y-8">
              {customers.length === 0 ? (
                <div className="framed-card p-12 text-center text-gy-textMuted space-y-4 border-2 border-gy-border">
                  <div className="text-2xl font-black text-white font-serif">AUCUN CLIENT ENREGISTRÉ</div>
                  <p className="text-sm text-gy-textMuted max-w-md mx-auto">
                    La base de données est actuellement vide. Veuillez créer un premier client pour accéder à son espace privé VIP.
                  </p>
                  <button
                    onClick={() => {
                      setActiveMenu("clients");
                      setNewCustomerModal(true);
                    }}
                    className="px-6 py-3.5 rounded-2xl bg-gold-gradient text-black font-black text-xs uppercase tracking-wider shadow-gold hover:opacity-95"
                  >
                    + CRÉER UN CLIENT
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="font-serif text-4xl font-bold text-white">ESPACE PRIVÉ MEMBRE VIP</h2>
                      <p className="text-sm text-gy-textMuted mt-1">Suivi en temps réel des créations sur-mesure, rendez-vous d&apos;essayages et reçus clients</p>
                    </div>

                    <div className="flex items-center space-x-3 bg-gy-card p-2 rounded-2xl border border-gy-gold/40">
                      <span className="text-xs font-bold text-gy-gold uppercase px-2">SELECTIONNER CLIENT :</span>
                      <select
                        value={payCustomerId}
                        onChange={(e) => setPayCustomerId(e.target.value)}
                        className="bg-gy-dark border border-gy-border rounded-xl p-2.5 text-xs text-white font-bold focus:outline-none focus:border-gy-gold"
                      >
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.firstName} {c.lastName} ({c.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* VIP Client Hero Card */}
                  {(() => {
                    const selectedCust = customers.find((c) => c.id === payCustomerId) || customers[0];
                    const custOrders = orders.filter((o) => o.customerId === selectedCust?.id);
                    const totalPaid = custOrders.reduce((sum, o) => sum + (o.totalPaid || 0), 0);
                    const totalDue = custOrders.reduce((sum, o) => sum + (o.balanceDue || 0), 0);

                    return (
                      <div className="space-y-6">
                        <div className="framed-card p-8 border-2 border-gy-gold/50 bg-gradient-to-r from-[#181820] to-[#121217] relative overflow-hidden">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                              <span className="px-4 py-1 rounded-full text-xs font-black bg-gy-gold/20 text-gy-gold border border-gy-gold/40 uppercase tracking-wider">
                                MEMBRE {selectedCust?.category?.toUpperCase() || "VIP"}
                              </span>
                              <h3 className="font-serif text-3xl font-bold text-white mt-3">
                                {selectedCust?.firstName} {selectedCust?.lastName}
                              </h3>
                              <p className="text-xs text-gy-textMuted mt-1">
                                TÉL: {selectedCust?.phone || "-"} • VILLE: {selectedCust?.city || "Cotonou"}
                              </p>
                            </div>

                            <div className="flex space-x-4 text-center">
                              <div className="bg-gy-dark p-4 rounded-2xl border border-gy-border">
                                <span className="text-[10px] font-bold text-gy-textMuted uppercase block">Créations en cours</span>
                                <strong className="text-xl font-black text-white">{custOrders.length}</strong>
                              </div>
                              <div className="bg-gy-dark p-4 rounded-2xl border border-gy-border">
                                <span className="text-[10px] font-bold text-gy-textMuted uppercase block">Total Payé</span>
                                <strong className="text-xl font-black text-emerald-400">{formatFcfa(totalPaid)}</strong>
                              </div>
                              <div className="bg-gy-dark p-4 rounded-2xl border border-gy-border">
                                <span className="text-[10px] font-bold text-gy-textMuted uppercase block">Solde Restant</span>
                                <strong className="text-xl font-black text-amber-400">{formatFcfa(totalDue)}</strong>
                              </div>
                            </div>
                          </div>
                        </div>

                    {/* Timeline des Créations */}
                    <div className="space-y-4">
                      <h3 className="font-serif text-2xl font-bold text-white">SUIVI DE CONFECTION SUR-MESURE</h3>

                      {custOrders.length === 0 ? (
                        <div className="framed-card p-6 text-center text-gy-textMuted text-sm font-semibold">
                          Aucune commande enregistrée pour ce client.
                        </div>
                      ) : (
                        custOrders.map((o) => (
                          <div key={o.id} className="framed-card p-6 space-y-4 border border-gy-border">
                            <div className="flex justify-between items-center border-b border-gy-border pb-3">
                              <div>
                                <span className="text-xs font-bold text-gy-gold uppercase">{o.reference}</span>
                                <h4 className="font-serif text-xl font-bold text-white mt-0.5">
                                  {o.items?.[0]?.itemName || "Tenue Haute Couture"}
                                </h4>
                                <span className="text-xs text-gy-textMuted block mt-0.5">TISSU: {o.items?.[0]?.fabricDetails || "Sélectionné en boutique"}</span>
                              </div>
                              <span className="px-4 py-1.5 rounded-xl bg-gy-dark border border-gy-gold/40 text-xs font-black text-gy-gold uppercase">
                                RETRAIT PRÉVU: {formatDate(o.promisedDate)}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                              <div className={`p-3 rounded-xl border text-center text-xs font-bold ${o.status === "ACOMPTE_ATTENDU" ? "bg-amber-500/20 text-amber-400 border-amber-500/50" : "bg-gy-dark/50 text-gy-textMuted border-gy-border"}`}>
                                1. COMMANDE & MESURES
                              </div>
                              <div className={`p-3 rounded-xl border text-center text-xs font-bold ${o.status === "PRODUCTION" ? "bg-sky-500/20 text-sky-400 border-sky-500/50" : "bg-gy-dark/50 text-gy-textMuted border-gy-border"}`}>
                                2. CONFECTION ATELIER
                              </div>
                              <div className={`p-3 rounded-xl border text-center text-xs font-bold ${o.status === "ESSAYAGE" ? "bg-purple-500/20 text-purple-400 border-purple-500/50" : "bg-gy-dark/50 text-gy-textMuted border-gy-border"}`}>
                                3. ESSAYAGE & AJUSTEMENT
                              </div>
                              <div className={`p-3 rounded-xl border text-center text-xs font-bold ${o.status === "PRET" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50" : "bg-gy-dark/50 text-gy-textMuted border-gy-border"}`}>
                                4. PRÊT À LIVRER
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      )}

          {/* ========================================================= */}
          {/* ATELIER PRODUCTION WORKBENCH                              */}
          {/* ========================================================= */}
          {activeMenu === "atelier" && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-serif text-4xl font-bold text-white">WORKBENCH PRODUCTION ATELIER</h2>
                  <p className="text-sm text-gy-textMuted mt-1">Avancement en direct des travaux de coupe, assemblage, essayages et repassage</p>
                </div>
                <button
                  onClick={() => setActiveMenu("commandes")}
                  className="px-6 py-3.5 rounded-2xl bg-gold-gradient text-black font-black text-xs uppercase tracking-wider shadow-gold hover:opacity-95"
                >
                  + VOIR TOUTES LES COMMANDES
                </button>
              </div>

              {/* Atelier KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                <div className="framed-card p-5 border-l-4 border-l-amber-400">
                  <span className="text-xs font-extrabold text-gy-textMuted uppercase tracking-wider block">À Faire (En attente)</span>
                  <h3 className="font-serif text-3xl font-black text-amber-400 mt-2">
                    {orders.filter((o) => o.status === "ACOMPTE_ATTENDU").length}
                  </h3>
                </div>

                <div className="framed-card p-5 border-l-4 border-l-sky-400">
                  <span className="text-xs font-extrabold text-gy-textMuted uppercase tracking-wider block">En Confection</span>
                  <h3 className="font-serif text-3xl font-black text-sky-400 mt-2">
                    {orders.filter((o) => o.status === "PRODUCTION").length}
                  </h3>
                </div>

                <div className="framed-card p-5 border-l-4 border-l-purple-400">
                  <span className="text-xs font-extrabold text-gy-textMuted uppercase tracking-wider block">Essayages & Contrôle</span>
                  <h3 className="font-serif text-3xl font-black text-purple-400 mt-2">
                    {orders.filter((o) => o.status === "ESSAYAGE" || o.status === "CONTROLE_QUALITE").length}
                  </h3>
                </div>

                <div className="framed-card p-5 border-l-4 border-l-emerald-400">
                  <span className="text-xs font-extrabold text-gy-textMuted uppercase tracking-wider block">Prêts à Livrer</span>
                  <h3 className="font-serif text-3xl font-black text-emerald-400 mt-2">
                    {orders.filter((o) => o.status === "PRET").length}
                  </h3>
                </div>
              </div>

              {/* Table des Travaux d'Atelier */}
              <div className="framed-card p-2 overflow-hidden border-2 border-gy-border">
                <div className="overflow-x-auto">
                  <table className="framed-table text-left text-sm text-gy-text font-aptos">
                    <thead>
                      <tr>
                        <th className="min-w-[130px]">REF COMMANDE</th>
                        <th className="min-w-[170px]">CLIENT</th>
                        <th className="min-w-[240px]">TENUE & DÉTAILS TISSU</th>
                        <th className="min-w-[160px]">DATE RETRAIT SOUHAITÉ</th>
                        <th className="min-w-[180px]">ÉTAPE ACTUELLE</th>
                        <th className="min-w-[200px] text-center">ACTION RAPIDE ATELIER</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => {
                        const cust = customers.find((c) => c.id === o.customerId) || o.customer;
                        const cName = cust
                          ? `${cust.firstName || ""} ${cust.lastName || ""}`.trim() || cust.fullName || cust.name || "Client"
                          : o.customerName || (o.customer ? `${o.customer.firstName || ""} ${o.customer.lastName || ""}`.trim() : "Client");
                        return (
                          <tr key={o.id}>
                            <td className="font-bold text-white">
                              <span className="framed-badge-gold text-xs font-black">{o.reference}</span>
                            </td>
                            <td className="font-bold text-white text-base">
                              {cName}
                            </td>
                          <td>
                            <div className="p-2.5 rounded-xl bg-gy-dark/90 border border-gy-gold/30">
                              <strong className="text-gy-gold text-base block font-bold">{o.items?.[0]?.itemName || "Création Sur-Mesure"}</strong>
                              <span className="text-xs text-gy-textMuted block mt-1">TISSU: {o.items?.[0]?.fabricDetails || "Fourni par le client"}</span>
                            </div>
                          </td>
                          <td>
                            <span className="framed-badge-amber text-xs font-bold">
                              {formatDate(o.promisedDate)}
                            </span>
                          </td>
                          <td>
                            <select
                              value={o.status}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                              className="bg-gy-dark border border-gy-gold/50 text-xs rounded-xl p-2.5 text-gy-gold font-bold focus:outline-none w-full"
                            >
                              <option value="ACOMPTE_ATTENDU">ACOMPTE ATTENDU</option>
                              <option value="PRODUCTION">PRODUCTION EN ATELIER</option>
                              <option value="ESSAYAGE">ESSAYAGE CLIENT</option>
                              <option value="RETOUCHE">RETOUCHE</option>
                              <option value="CONTROLE_QUALITE">CONTRÔLE QUALITÉ</option>
                              <option value="SOLDE_A_PAYER">SOLDE À PAYER</option>
                              <option value="PRET">PRÊT À LIVRER</option>
                              <option value="CLOTURE">CLÔTURÉ</option>
                            </select>
                          </td>
                          <td>
                            <div className="flex items-center justify-center space-x-2">
                              {o.status === "ACOMPTE_ATTENDU" && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(o.id, "PRODUCTION")}
                                  className="px-3 py-2 bg-sky-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-md"
                                >
                                  DÉMARRER ATELIER
                                </button>
                              )}

                              {o.status === "PRODUCTION" && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(o.id, "ESSAYAGE")}
                                  className="px-3 py-2 bg-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md"
                                >
                                  PASSER EN ESSAYAGE
                                </button>
                              )}

                              {(o.status === "ESSAYAGE" || o.status === "RETOUCHE" || o.status === "CONTROLE_QUALITE") && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(o.id, "PRET")}
                                  className="px-3 py-2 bg-emerald-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-md"
                                >
                                  MARQUER PRÊT
                                </button>
                              )}

                              {o.status === "PRET" && (
                                <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-black uppercase">
                                  PRÊT À LIVRER
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeMenu === "rh" && (
            <div className="framed-card p-8">
              <h2 className="font-serif text-3xl font-bold text-white mb-4">RH & COMMISSIONS</h2>
            </div>
          )}

          {activeMenu === "administrations" && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="font-serif text-4xl font-bold text-white">ADMINISTRATION & ACCÈS SÉCURISÉS</h2>
                  <p className="text-sm text-gy-textMuted mt-1">Gestion centrale des comptes administrateurs, rôles et privilèges d&apos;accès</p>
                </div>
                <button
                  onClick={() => setNewAdminModal(true)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gold-gradient text-black font-black text-xs uppercase tracking-wider shadow-gold hover:opacity-95 transition-opacity"
                >
                  + CRÉER UN COMPTE ADMIN
                </button>
              </div>

              <div className="framed-card p-8 space-y-6">
                <h3 className="font-serif text-2xl font-bold text-white border-b border-gy-border pb-4">
                  COMPTES ADMINISTRATEURS AUTORISÉS
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 rounded-2xl bg-gy-dark border border-gy-gold/40 flex justify-between items-center">
                    <div>
                      <span className="px-3 py-1 rounded-full text-[10px] font-black bg-gy-gold/20 text-gy-gold border border-gy-gold/40 uppercase">
                        SUPER ADMIN (DIRECTION)
                      </span>
                      <h4 className="font-bold text-white text-lg mt-2">Direction Maison GY</h4>
                      <p className="text-xs text-gy-textMuted mt-0.5">admin@mygy.com</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-black uppercase">ACTIF</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* 1. MODAL: NOUVEAU CLIENT FORM                             */}
      {/* ========================================================= */}
      {newCustomerModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel max-w-lg w-full p-8 rounded-3xl border border-[#D4AF37]/50 shadow-2xl font-aptos my-8">
            <div className="flex justify-between items-center mb-6 border-b border-gy-border pb-4">
              <h3 className="font-serif text-2xl font-bold text-white">CRÉER UN NOUVEAU CLIENT VIP</h3>
              <button onClick={() => setNewCustomerModal(false)} className="text-gy-textMuted hover:text-white px-3 py-1 bg-gy-dark border border-gy-border rounded-lg text-xs font-bold">
                [ FERMER ]
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Prénom *</label>
                  <input
                    type="text"
                    value={newCustFirstName}
                    onChange={(e) => setNewCustFirstName(e.target.value)}
                    placeholder="Grace"
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:border-[#D4AF37] focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Nom *</label>
                  <input
                    type="text"
                    value={newCustLastName}
                    onChange={(e) => setNewCustLastName(e.target.value)}
                    placeholder="Adanlete"
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:border-[#D4AF37] focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Téléphone *</label>
                  <input
                    type="text"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    placeholder="+229 97 00 00 00"
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:border-[#D4AF37] focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Ville</label>
                  <input
                    type="text"
                    value={newCustCity}
                    onChange={(e) => setNewCustCity(e.target.value)}
                    placeholder="Cotonou"
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Catégorie Client</label>
                <select
                  value={newCustCategory}
                  onChange={(e) => setNewCustCategory(e.target.value)}
                  className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white font-bold focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                  <option value="VIP">VIP</option>
                  <option value="VVIP">VVIP</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setNewCustomerModal(false)}
                  className="w-1/2 py-3.5 rounded-xl bg-gy-dark border border-gy-border text-gy-text font-black text-xs uppercase"
                >
                  ANNULER
                </button>
                <button
                  onClick={handleCreateCustomer}
                  className="w-1/2 py-3.5 rounded-xl bg-gold-gradient text-black font-black text-xs uppercase shadow-gold hover:opacity-95"
                >
                  ENREGISTRER CLIENT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. MODAL: NOUVELLE COMMANDE FORM                          */}
      {/* ========================================================= */}
      {newOrderModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel max-w-xl w-full p-8 rounded-3xl border border-[#D4AF37]/50 shadow-2xl font-aptos my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b border-gy-border pb-4">
              <h3 className="font-serif text-2xl font-bold text-white">ENREGISTRER UNE NOUVELLE COMMANDE VIP</h3>
              <button onClick={() => setNewOrderModal(false)} className="text-gy-textMuted hover:text-white px-3 py-1 bg-gy-dark border border-gy-border rounded-lg text-xs font-bold">
                [ FERMER ]
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Sélectionner le Client *</label>
                <select
                  value={newOrderCustomerId}
                  onChange={(e) => setNewOrderCustomerId(e.target.value)}
                  className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white font-bold focus:border-[#D4AF37] focus:outline-none"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.firstName} {c.lastName} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Nom de la Tenue *</label>
                <input
                  type="text"
                  value={newOrderItemName}
                  onChange={(e) => setNewOrderItemName(e.target.value)}
                  placeholder="ex: Robe de Soirée Mikado Impérial"
                  className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:border-[#D4AF37] focus:outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Date de la Commande *</label>
                  <input
                    type="date"
                    value={newOrderOrderDate}
                    onChange={(e) => setNewOrderOrderDate(e.target.value)}
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#D4AF37] mb-1 font-bold text-xs">Date de Retrait Souhaité *</label>
                  <input
                    type="date"
                    value={newOrderPromisedDate}
                    onChange={(e) => setNewOrderPromisedDate(e.target.value)}
                    className="w-full bg-gy-dark border border-[#D4AF37] rounded-xl p-3 text-[#D4AF37] font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Informations sur le Tissu Voulu *</label>
                <textarea
                  value={newOrderFabricDetails}
                  onChange={(e) => setNewOrderFabricDetails(e.target.value)}
                  rows={2}
                  placeholder="ex: Mikado de Soie Ivoire (6 mètres), dentelle de Calais assortie, perles Swarovski 4mm..."
                  className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Montant Total (FCFA) *</label>
                  <input
                    type="number"
                    value={newOrderTotalAmount}
                    onChange={(e) => setNewOrderTotalAmount(Number(e.target.value))}
                    placeholder="1200000"
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-emerald-400 font-bold text-base focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Acompte Requis (FCFA)</label>
                  <input
                    type="number"
                    value={newOrderDepositRequired}
                    onChange={(e) => setNewOrderDepositRequired(Number(e.target.value))}
                    placeholder="600000"
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-gy-gold font-bold text-base focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setNewOrderModal(false)}
                  className="w-1/2 py-3.5 rounded-xl bg-gy-dark border border-gy-border text-gy-text font-black text-xs uppercase"
                >
                  ANNULER
                </button>
                <button
                  onClick={handleCreateOrder}
                  className="w-1/2 py-3.5 rounded-xl bg-gold-gradient text-black font-black text-xs uppercase shadow-gold hover:opacity-95"
                >
                  ENREGISTRER LA COMMANDE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. STEP-BY-STEP CLIENT PAYMENT ENCAISSEMENT WIZARD MODAL  */}
      {/* ========================================================= */}
      {paymentWizardModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel max-w-xl w-full p-8 rounded-3xl border border-emerald-500/50 shadow-2xl font-aptos my-8">
            <div className="flex justify-between items-center mb-6 border-b border-gy-border pb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-white">
                  {payStep === 1 ? "1. SAISIE DE L'ENCAISSEMENT CLIENT" : "2. PRÉVISUALISATION & CONFIRMATION REÇU"}
                </h3>
                <span className="text-xs text-emerald-400 font-bold uppercase">Étape {payStep} sur 2</span>
              </div>
              <button onClick={() => setPaymentWizardModal(false)} className="text-gy-textMuted hover:text-white px-3 py-1 bg-gy-dark border border-gy-border rounded-lg text-xs font-bold">
                [ FERMER ]
              </button>
            </div>

            {payStep === 1 && (
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Date du Paiement *</label>
                  <input
                    type="date"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">1. Choisir le Client VIP *</label>
                  <select
                    value={payCustomerId}
                    onChange={(e) => {
                      const cid = e.target.value;
                      setPayCustomerId(cid);
                      const userOrds = orders.filter((o) => o.customerId === cid);
                      if (userOrds.length > 0) setPayOrderId(userOrds[0].id);
                    }}
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white font-bold focus:border-emerald-500 focus:outline-none"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.firstName} {c.lastName} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">2. Choisir la Commande Associée *</label>
                  <select
                    value={payOrderId}
                    onChange={(e) => setPayOrderId(e.target.value)}
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-gy-gold font-bold focus:border-emerald-500 focus:outline-none"
                  >
                    {customerOrders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.reference} - {o.items[0]?.itemName || "Tenue Sur-Mesure"} (Total: {formatFcfa(o.totalAmount)})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedPayOrder && (
                  <div className="grid grid-cols-3 gap-3 bg-gy-dark p-4 rounded-2xl border border-gy-border text-center">
                    <div>
                      <span className="text-[10px] text-gy-textMuted uppercase font-bold block">Montant Total</span>
                      <strong className="text-white text-base">{formatFcfa(selectedPayOrder.totalAmount)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gy-textMuted uppercase font-bold block">Déjà Payé</span>
                      <strong className="text-emerald-400 text-base">{formatFcfa(selectedPayOrder.totalPaid)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-400 uppercase font-bold block">Solde Restant</span>
                      <strong className="text-amber-400 text-base font-bold">{formatFcfa(selectedPayOrder.balanceDue)}</strong>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-emerald-400 mb-1 font-bold text-xs">Montant à Encaisser (FCFA) *</label>
                    <input
                      type="number"
                      value={payAmount}
                      onChange={(e) => setPayAmount(Number(e.target.value))}
                      placeholder="ex: 300000"
                      className="w-full bg-gy-dark border-2 border-emerald-500 rounded-xl p-3 text-emerald-400 font-bold text-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Mode de Règlement</label>
                    <select
                      value={payMode}
                      onChange={(e) => setPayMode(e.target.value)}
                      className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white font-bold focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="MTN_MOBILE_MONEY">MTN Mobile Money</option>
                      <option value="MOOV_MONEY">Moov Money</option>
                      <option value="ESPECES">Espèces Caisse</option>
                      <option value="VIREMENT">Virement Bancaire</option>
                      <option value="CARTE">Carte Bancaire</option>
                    </select>
                  </div>
                </div>

                {selectedPayOrder && payAmount > 0 && (
                  <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/40 flex justify-between items-center text-sm">
                    <span>Nouveau Solde Restant Après Paiement :</span>
                    <strong className="text-emerald-400 text-lg font-black">
                      {formatFcfa(Math.max(0, selectedPayOrder.balanceDue - payAmount))}
                    </strong>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setPaymentWizardModal(false)}
                    className="w-1/2 py-3.5 rounded-xl bg-gy-dark border border-gy-border text-gy-text font-black text-xs uppercase"
                  >
                    ANNULER
                  </button>
                  <button
                    onClick={() => {
                      if (!selectedPayOrder || payAmount <= 0) {
                        alert("Veuillez choisir une commande et saisir un montant d'encaissement.");
                        return;
                      }
                      setPayStep(2);
                    }}
                    className="w-1/2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs uppercase shadow-lg hover:opacity-95"
                  >
                    PRÉVISUALISER LE REÇU →
                  </button>
                </div>
              </div>
            )}

            {payStep === 2 && selectedPayOrder && (
              <div className="space-y-6 text-sm font-aptos">
                <div className="bg-[#141419] p-6 rounded-2xl border-2 border-emerald-500/60 shadow-2xl space-y-4">
                  <div className="flex justify-between items-start border-b border-gy-border pb-4">
                    <div>
                      <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Maison GY Haute Couture</span>
                      <h4 className="font-serif text-2xl font-bold text-white mt-0.5">REÇU D&apos;ENCAISSEMENT PROVISOIRE</h4>
                    </div>
                    <span className="framed-badge-emerald text-xs font-bold">STATUT: VALIDE</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div><span className="text-gy-textMuted block">Client VIP :</span> <strong className="text-white text-sm font-bold">{selectedPayOrder.customer?.firstName} {selectedPayOrder.customer?.lastName}</strong></div>
                    <div><span className="text-gy-textMuted block">N° Commande :</span> <strong className="text-[#D4AF37] text-sm font-bold">{selectedPayOrder.reference}</strong></div>
                    <div><span className="text-gy-textMuted block">Date Paiement :</span> <strong className="text-white text-sm font-bold">{formatDate(payDate)}</strong></div>
                    <div><span className="text-gy-textMuted block">Mode Règlement :</span> <strong className="text-sky-400 text-sm font-bold">{payMode}</strong></div>
                  </div>

                  <div className="bg-gy-dark p-4 rounded-xl border border-gy-border space-y-2">
                    <div className="flex justify-between"><span>Montant Commande :</span> <strong className="text-white">{formatFcfa(selectedPayOrder.totalAmount)}</strong></div>
                    <div className="flex justify-between"><span>Ancien Solde Dû :</span> <strong className="text-amber-400">{formatFcfa(selectedPayOrder.balanceDue)}</strong></div>
                    <div className="flex justify-between text-base border-t border-gy-border/60 pt-2 font-bold">
                      <span className="text-emerald-400">MONTANT ENCAISSÉ AUJOURD&apos;HUI :</span>
                      <strong className="text-emerald-400 text-xl font-black">{formatFcfa(payAmount)}</strong>
                    </div>
                    <div className="flex justify-between border-t border-gy-border/60 pt-2 text-xs font-bold">
                      <span>NOUVEAU SOLDE RESTANT :</span>
                      <strong className="text-amber-400 text-sm">{formatFcfa(Math.max(0, selectedPayOrder.balanceDue - payAmount))}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => setPayStep(1)}
                    className="w-1/2 py-3.5 rounded-xl bg-gy-dark border border-gy-border text-gy-text font-black text-xs uppercase"
                  >
                    ← MODIFIER SAISIE
                  </button>
                  <button
                    onClick={handleConfirmFinalPayment}
                    className="w-1/2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-black text-xs uppercase shadow-xl hover:brightness-110"
                  >
                    VALIDER & GÉNÉRER REÇU
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL EXPENSE */}
      {newExpenseModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-8 rounded-3xl border border-rose-500/50 shadow-2xl font-aptos">
            <div className="flex justify-between items-center mb-6 border-b border-gy-border pb-4">
              <h3 className="font-serif text-2xl font-bold text-white">ENREGISTRER UNE DÉPENSE MAISON GY</h3>
              <button onClick={() => setNewExpenseModal(false)} className="text-gy-textMuted hover:text-white px-3 py-1 bg-gy-dark border border-gy-border rounded-lg text-xs font-bold">
                [ FERMER ]
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Catégorie de Dépense *</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white font-bold focus:border-rose-500 focus:outline-none"
                >
                  <option value="Achat Tissus">Achat Tissus & Pagnes</option>
                  <option value="Mercerie & Accessoires">Mercerie & Perles (Swarovski, Zips, Boutons)</option>
                  <option value="Salaires & Commissions">Salaires Artisans & Commissions</option>
                  <option value="Loyer Boutique & Atelier">Loyer Atelier / Boutique</option>
                  <option value="Électricité SBEE / SONEB">Électricité SBEE & Eau SONEB</option>
                  <option value="Transport & Packaging">Transport, Transit & Packaging VIP</option>
                  <option value="Maintenance & Divers">Maintenance Machines & Divers</option>
                </select>
              </div>

              <div>
                <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Description / Libellé *</label>
                <input
                  type="text"
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  placeholder="ex: Achat 20m Mikado de Soie Ivoire"
                  className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white font-bold focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Montant (FCFA) *</label>
                  <input
                    type="number"
                    value={expAmount}
                    onChange={(e) => setExpAmount(Number(e.target.value))}
                    placeholder="150000"
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-rose-400 font-bold text-base focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Mode de Paiement</label>
                  <select
                    value={expPaymentMode}
                    onChange={(e) => setExpPaymentMode(e.target.value)}
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white font-bold focus:border-rose-500 focus:outline-none"
                  >
                    <option value="ESPECES">Espèces Caisse</option>
                    <option value="MTN_MOBILE_MONEY">MTN Mobile Money</option>
                    <option value="MOOV_MONEY">Moov Money</option>
                    <option value="VIREMENT">Virement Bancaire</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Fournisseur / Prestataire / Bénéficiaire</label>
                <input
                  type="text"
                  value={expSupplier}
                  onChange={(e) => setExpSupplier(e.target.value)}
                  placeholder="ex: Textiles d'Orient Cotonou / SBEE"
                  className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setNewExpenseModal(false)}
                  className="w-1/2 py-3.5 rounded-xl bg-gy-dark border border-gy-border text-gy-text font-black text-xs uppercase"
                >
                  ANNULER
                </button>
                <button
                  onClick={handleCreateExpense}
                  className="w-1/2 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-600 text-white font-black text-xs uppercase shadow-lg"
                >
                  VALIDER DÉPENSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW ORDER MODAL */}
      {viewOrderModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-2xl w-full p-8 rounded-3xl border border-gy-gold/50 shadow-2xl font-aptos">
            <div className="flex justify-between items-start border-b border-gy-border pb-4">
              <div>
                <span className="text-xs font-bold text-gy-gold uppercase tracking-wider">{viewOrderModal.reference}</span>
                <h3 className="font-serif text-3xl font-bold text-white mt-1">
                  {viewOrderModal.items[0]?.itemName || "Commande Sur-Mesure"}
                </h3>
                <p className="text-sm text-gy-textMuted mt-1">
                  Client : <strong className="text-white">{viewOrderModal.customer?.firstName} {viewOrderModal.customer?.lastName}</strong> ({viewOrderModal.customer?.phone})
                </p>
              </div>
              <button onClick={() => setViewOrderModal(null)} className="text-gy-textMuted hover:text-white px-3 py-1 bg-gy-dark border border-gy-border rounded-lg text-xs font-bold">
                [ FERMER ]
              </button>
            </div>

            <div className="space-y-6 pt-6 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-gy-dark p-5 rounded-2xl border border-gy-border">
                <div>
                  <span className="text-xs text-gy-textMuted block">Date de la Commande</span>
                  <strong className="text-white text-base">{formatDate(viewOrderModal.orderDate || viewOrderModal.createdAt)}</strong>
                </div>
                <div>
                  <span className="text-xs text-gy-gold font-bold block">Date de Retrait Souhaité</span>
                  <strong className="text-amber-400 text-base">{formatDate(viewOrderModal.promisedDate)}</strong>
                </div>
              </div>

              <div>
                <h4 className="font-serif text-lg font-bold text-white mb-2">Informations sur le Tissu Voulu :</h4>
                <div className="bg-gy-dark p-4 rounded-xl border border-gy-border text-gy-text leading-relaxed font-semibold">
                  {viewOrderModal.items[0]?.fabricDetails || "Tissu fourni par la cliente."}
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-gy-border pt-4 text-base">
                <div><span>Montant Total :</span> <strong className="text-white text-lg font-bold ml-2">{formatFcfa(viewOrderModal.totalAmount)}</strong></div>
                <div><span>Solde Restant :</span> <strong className="text-amber-400 text-lg font-bold ml-2">{formatFcfa(viewOrderModal.balanceDue)}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW CUSTOMER MODAL */}
      {viewCustomerModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel max-w-3xl w-full p-8 rounded-3xl border border-sky-500/40 shadow-2xl font-aptos my-8">
            <div className="flex justify-between items-start border-b border-gy-border pb-6">
              <div>
                <span className="text-xs font-bold text-gy-gold uppercase tracking-wider">{viewCustomerModal.code}</span>
                <h3 className="font-serif text-3xl font-bold text-white mt-1">
                  {viewCustomerModal.firstName} {viewCustomerModal.lastName}
                </h3>
                <p className="text-sm text-gy-textMuted mt-1">
                  {viewCustomerModal.profession || "Client Privé"} • Tel : {viewCustomerModal.phone} • {viewCustomerModal.city}
                </p>
              </div>
              <button onClick={() => setViewCustomerModal(null)} className="text-gy-textMuted hover:text-white px-3 py-1 bg-gy-dark border border-gy-border rounded-lg text-xs font-bold">
                [ FERMER ]
              </button>
            </div>

            <div className="space-y-6 pt-6 text-sm">
              <div>
                <h4 className="font-serif text-xl font-bold text-white mb-3">
                  HISTORIQUE & COMMANDES EN COURS ({viewCustomerModal.orders?.length || 0})
                </h4>
                {viewCustomerModal.orders && viewCustomerModal.orders.length > 0 ? (
                  <div className="space-y-3">
                    {viewCustomerModal.orders.map((o: any) => (
                      <div key={o.id} className="bg-gy-dark p-5 rounded-2xl border border-gy-border flex justify-between items-center">
                        <div>
                          <span className="font-bold text-white text-base">{o.reference}</span>
                          <div className="text-xs text-gy-gold font-bold mt-1">Statut Atelier: {o.status}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-base font-bold text-emerald-400">{formatFcfa(o.totalAmount)}</div>
                          <div className="text-xs text-amber-400 font-bold mt-0.5">Solde: {formatFcfa(o.balanceDue)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gy-textMuted bg-gy-dark p-4 rounded-xl border border-gy-border italic">
                    Aucune commande enregistrée.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CUSTOMER MODAL */}
      {editCustomerModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel max-w-2xl w-full p-8 rounded-3xl border border-gy-gold/50 shadow-2xl font-aptos my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b border-gy-border pb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-white">MODIFIER CLIENT & PRISE DE MESURES</h3>
                <span className="text-xs text-gy-gold font-bold">{editCustomerModal.code}</span>
              </div>
              <button onClick={() => setEditCustomerModal(null)} className="text-gy-textMuted hover:text-white px-3 py-1 bg-gy-dark border border-gy-border rounded-lg text-xs font-bold">
                [ FERMER ]
              </button>
            </div>

            <div className="space-y-6 text-sm">
              <div>
                <h4 className="font-serif text-lg font-bold text-white mb-3">1. Informations Personnelles</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Prénom</label>
                    <input
                      type="text"
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                      className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:border-gy-gold focus:outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Nom</label>
                    <input
                      type="text"
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                      className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:border-gy-gold focus:outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Téléphone</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:border-gy-gold focus:outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Ville</label>
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:border-gy-gold focus:outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Catégorie Client *</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white font-bold focus:border-gy-gold focus:outline-none"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="VIP">VIP</option>
                    <option value="VVIP">VVIP</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setEditCustomerModal(null)}
                  className="w-1/2 py-3.5 rounded-xl bg-gy-dark border border-gy-border text-gy-text font-black text-xs uppercase"
                >
                  ANNULER
                </button>
                <button
                  onClick={handleSaveCustomerEdits}
                  className="w-1/2 py-3.5 rounded-xl bg-gold-gradient text-black font-black text-xs uppercase shadow-gold hover:opacity-95"
                >
                  ENREGISTRER
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CRÉER UN COMPTE ADMIN */}
      {newAdminModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel max-w-md w-full p-8 rounded-3xl border border-[#D4AF37]/50 shadow-2xl font-aptos my-8">
            <div className="flex justify-between items-center mb-6 border-b border-gy-border pb-4">
              <h3 className="font-serif text-2xl font-bold text-white">CRÉER UN COMPTE ADMIN</h3>
              <button onClick={() => setNewAdminModal(false)} className="text-gy-textMuted hover:text-white px-3 py-1 bg-gy-dark border border-gy-border rounded-lg text-xs font-bold">
                [ FERMER ]
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Nom & Prénom *</label>
                <input
                  type="text"
                  value={adminFullName}
                  onChange={(e) => setAdminFullName(e.target.value)}
                  placeholder="ex: Direction GY / Arafath Imorou"
                  className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:border-[#D4AF37] focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Adresse Email de Connexion *</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@mygy.com"
                  className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:border-[#D4AF37] focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Mot de Passe *</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:border-[#D4AF37] focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Rôle / Privilèges</label>
                <select
                  value={adminRole}
                  onChange={(e) => setAdminRole(e.target.value)}
                  className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white font-bold focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="SUPER_ADMIN">SUPER ADMIN (Accès Total)</option>
                  <option value="DIRECTION">DIRECTION GÉNÉRALE</option>
                  <option value="ADMINISTRATION">ADMINISTRATION & CAISSE</option>
                  <option value="RESPONSABLE_COMMERCIAL">RESPONSABLE COMMERCIAL</option>
                  <option value="COMPTABILITE">COMPTABILITÉ & FINANCES</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gy-border">
                <button
                  type="button"
                  onClick={() => setNewAdminModal(false)}
                  className="w-1/2 py-3.5 rounded-xl bg-gy-dark border border-gy-border text-gy-text font-bold text-xs uppercase hover:bg-gy-border"
                >
                  ANNULER
                </button>

                <button
                  type="button"
                  onClick={handleCreateAdminUser}
                  className="w-1/2 py-3.5 rounded-xl bg-gold-gradient text-black font-black text-xs uppercase shadow-gold hover:opacity-95"
                >
                  CRÉER COMPTE ADMIN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
