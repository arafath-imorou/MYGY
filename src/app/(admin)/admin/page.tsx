"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState<
    "dashboard" | "clients" | "espace-client" | "commandes" | "atelier" | "finances" | "rh" | "administrations"
  >("dashboard");

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
  const [currentUser, setCurrentUser] = useState<any>(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("gy_user_email");
      const savedName = localStorage.getItem("gy_user_name");
      const savedRole = localStorage.getItem("gy_user_role");
      const isFatia = savedEmail === "teeadjao@gmail.com" || savedName?.includes("ADJAO");
      if (savedName || savedEmail) {
        return {
          fullName: isFatia ? "Fatia ADJAO MOUFTAOU" : (savedName || "Ghislaine LOKO DJIDJOHO"),
          email: savedEmail || "gymaisoncouture@gmail.com",
          role: isFatia ? "Assistante" : (savedRole === "ADMINISTRATION" ? "Assistante" : "Directrice Générale"),
        };
      }
    }
    return {
      fullName: "Ghislaine LOKO DJIDJOHO",
      email: "gymaisoncouture@gmail.com",
      role: "Directrice Générale",
    };
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
        const isFatia = data.user.email === "teeadjao@gmail.com" || data.user.fullName?.includes("ADJAO");
        const uName = isFatia ? "Fatia ADJAO MOUFTAOU" : (data.user.fullName || "Ghislaine LOKO DJIDJOHO");
        const uRole = isFatia ? "Assistante" : (data.user.role === "ADMINISTRATION" ? "Assistante" : "Directrice Générale");

        setCurrentUser({
          fullName: uName,
          email: data.user.email,
          role: uRole,
        });
        setPayAgent(isFatia ? "Fatia ADJAO MOUFTAOU (Assistante)" : "Ghislaine LOKO DJIDJOHO (Direction)");

        if (typeof window !== "undefined") {
          localStorage.setItem("gy_logged_in", "true");
          localStorage.setItem("gy_user_email", data.user.email);
          localStorage.setItem("gy_user_name", uName);
          localStorage.setItem("gy_user_role", uRole);
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
      localStorage.removeItem("gy_user_name");
      localStorage.removeItem("gy_user_role");
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
  const [successReceiptModal, setSuccessReceiptModal] = useState<any>(null);

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
  const [newCustCity, setNewCustCity] = useState("");
  const [newCustCategory, setNewCustCategory] = useState("Standard");
  const [newCustProfession, setNewCustProfession] = useState("");
  const [newCustNotes, setNewCustNotes] = useState("");

  // Order Creation Form Modal
  const [newOrderModal, setNewOrderModal] = useState(false);
  const [newOrderCustomerId, setNewOrderCustomerId] = useState("");
  const [newOrderItemName, setNewOrderItemName] = useState("");
  const [newOrderItemsList, setNewOrderItemsList] = useState<any[]>([
    { id: "1", itemName: "", price: "", fabricDetails: "" },
  ]);
  const [newOrderOrderDate, setNewOrderOrderDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [newOrderPromisedDate, setNewOrderPromisedDate] = useState(
    new Date(Date.now() + 14 * 86400 * 1000).toISOString().split("T")[0]
  );
  const [newOrderFabricDetails, setNewOrderFabricDetails] = useState("");
  const [newOrderCustomNotes, setNewOrderCustomNotes] = useState("");
  const [newOrderTotalAmount, setNewOrderTotalAmount] = useState<number | "">("");
  const [newOrderDepositRequired, setNewOrderDepositRequired] = useState<number | "">("");
  const [newOrderPriority, setNewOrderPriority] = useState("VIP");

  // Edit Order State
  const [editOrderModal, setEditOrderModal] = useState(false);
  const [editOrderObj, setEditOrderObj] = useState<any>(null);
  const [editOrderTotalAmount, setEditOrderTotalAmount] = useState<number | "">("");
  const [editOrderPromisedDate, setEditOrderPromisedDate] = useState("");
  const [editOrderFabricDetails, setEditOrderFabricDetails] = useState("");
  const [editOrderCustomNotes, setEditOrderCustomNotes] = useState("");
  const [editOrderPriority, setEditOrderPriority] = useState("VIP");
  const [editOrderStatus, setEditOrderStatus] = useState("PRODUCTION");
  const [editOrderItemsList, setEditOrderItemsList] = useState<any[]>([]);

  // RH & Personnel State
  const DEFAULT_EMPLOYEES = [
    {
      id: "emp_1",
      code: "EMP-001",
      firstName: "Ghislaine",
      lastName: "LOKO DJIDJOHO",
      role: "Directrice Générale",
      department: "Direction Générale",
      phone: "+229 97 00 00 01",
      email: "gymaisoncouture@gmail.com",
      contractType: "CDI",
      salary: 800000,
      hireDate: "2024-01-15",
      status: "ACTIF",
    },
    {
      id: "emp_2",
      code: "EMP-002",
      firstName: "Fatia",
      lastName: "ADJAO MOUFTAOU",
      role: "Assistante",
      department: "Administration & Accueil",
      phone: "+229 97 00 00 02",
      email: "teeadjao@gmail.com",
      contractType: "CDI",
      salary: 200000,
      hireDate: "2024-03-01",
      status: "ACTIF",
    },
    {
      id: "emp_3",
      code: "EMP-003",
      firstName: "Dossou",
      lastName: "KPADONOU",
      role: "Tailleur",
      department: "Atelier Confection & Coupe",
      phone: "+229 95 44 33 22",
      email: "tailleur.coupe@mygy.com",
      contractType: "CDI",
      salary: 250000,
      hireDate: "2024-02-10",
      status: "ACTIF",
    },
    {
      id: "emp_4",
      code: "EMP-004",
      firstName: "Mathieu",
      lastName: "SOGLO",
      role: "Tailleur",
      department: "Atelier Confection & Broderie",
      phone: "+229 67 88 99 00",
      email: "tailleur.broderie@mygy.com",
      contractType: "CDI",
      salary: 220000,
      hireDate: "2024-04-15",
      status: "ACTIF",
    },
    {
      id: "emp_5",
      code: "EMP-005",
      firstName: "Koffi",
      lastName: "AGBOSSA",
      role: "Agent d'entretien",
      department: "Entretien Atelier & Showroom",
      phone: "+229 94 11 22 33",
      email: "entretien@mygy.com",
      contractType: "CDI",
      salary: 100000,
      hireDate: "2024-05-01",
      status: "ACTIF",
    },
    {
      id: "emp_6",
      code: "EMP-006",
      firstName: "Rodrigue",
      lastName: "ADANHO",
      role: "Agent de liaison",
      department: "Logistique & Livraisons VIP",
      phone: "+229 66 55 44 33",
      email: "liaison@mygy.com",
      contractType: "CDI",
      salary: 130000,
      hireDate: "2024-06-01",
      status: "ACTIF",
    },
  ];

  const DEFAULT_ADMIN_USERS = [
    {
      id: "usr_admin_gy_2026",
      fullName: "Ghislaine LOKO DJIDJOHO",
      email: "gymaisoncouture@gmail.com",
      role: "SUPER_ADMIN",
      roleLabel: "SUPER ADMIN (DIRECTION)",
      status: "ACTIF",
      phone: "+229 97 00 00 01",
      createdAt: "2024-01-01",
    },
    {
      id: "usr_assistante_fatia",
      fullName: "Fatia ADJAO MOUFTAOU",
      email: "teeadjao@gmail.com",
      role: "ADMINISTRATION",
      roleLabel: "ASSISTANTE (ADMINISTRATION)",
      status: "ACTIF",
      phone: "+229 97 00 00 02",
      createdAt: "2024-03-01",
    },
  ];

  const DEFAULT_EXPENSE_CATEGORIES = [
    { id: "exp_cat_1", code: "LIGNE-001", label: "Achat Tissus & Pagnes", category: "MATIERES_PREMIERES" },
    { id: "exp_cat_2", code: "LIGNE-002", label: "Mercerie & Perles (Swarovski, Zips, Boutons)", category: "FOURNITURES" },
    { id: "exp_cat_3", code: "LIGNE-003", label: "Salaires Artisans & Commissions", category: "PERSONNEL" },
    { id: "exp_cat_4", code: "LIGNE-004", label: "Loyer Atelier / Boutique", category: "LOYER_CHARGES" },
    { id: "exp_cat_5", code: "LIGNE-005", label: "Électricité SBEE & Eau SONEB", category: "UTILITIES" },
    { id: "exp_cat_6", code: "LIGNE-006", label: "Transport, Transit & Packaging VIP", category: "LOGISTIQUE" },
    { id: "exp_cat_7", code: "LIGNE-007", label: "Maintenance Machines & Divers", category: "ENTRETIEN" },
  ];

  const DEFAULT_CUSTOMERS: any[] = [];
  const DEFAULT_ORDERS: any[] = [];

  const [employeesList, setEmployeesList] = useState<any[]>(DEFAULT_EMPLOYEES);
  const [adminUsersList, setAdminUsersList] = useState<any[]>(DEFAULT_ADMIN_USERS);
  const [expenseCategories, setExpenseCategories] = useState<any[]>(DEFAULT_EXPENSE_CATEGORIES);
  const [adminSubTab, setAdminSubTab] = useState<"comptes" | "lignes">("comptes");
  const [newExpenseCategoryModal, setNewExpenseCategoryModal] = useState(false);
  const [newExpCatLabel, setNewExpCatLabel] = useState("");
  const [newExpCatCode, setNewExpCatCode] = useState("");
  const [newExpCatDesc, setNewExpCatDesc] = useState("");

  // CLIENT ACCOUNT CREATION STATE
  const [clientAccountModal, setClientAccountModal] = useState<any>(null); // holds the customer
  const [clientAccountEmail, setClientAccountEmail] = useState("");
  const [clientAccountLoading, setClientAccountLoading] = useState(false);
  const [clientAccountCredentials, setClientAccountCredentials] = useState<any>(null);

  // ORDER IMAGE GALLERY STATE
  const [orderImagesModal, setOrderImagesModal] = useState<any>(null); // holds the order
  const [uploadingImage, setUploadingImage] = useState(false);

  // STOCK MODULE STATE
  const [stockList, setStockList] = useState<any[]>([]);
  const [stockSubTab, setStockSubTab] = useState<"catalogue" | "mouvements">("catalogue");
  const [newStockModal, setNewStockModal] = useState(false);
  const [stockMvtModal, setStockMvtModal] = useState<any>(null);
  const [stockSearch, setStockSearch] = useState("");
  // New stock article form
  const [stkName, setStkName] = useState("");
  const [stkCategory, setStkCategory] = useState("TISSU");
  const [stkType, setStkType] = useState("CONSOMMABLE");
  const [stkUnit, setStkUnit] = useState("m");
  const [stkQuantity, setStkQuantity] = useState<number | "">("");
  const [stkMinQty, setStkMinQty] = useState<number | "">("");
  const [stkSupplier, setStkSupplier] = useState("");
  // New movement form
  const [mvtType, setMvtType] = useState("ENTREE");
  const [mvtQty, setMvtQty] = useState<number | "">("");
  const [mvtReason, setMvtReason] = useState("");

  const [rhRoleFilter, setRhRoleFilter] = useState("TOUS");
  const [newEmployeeModal, setNewEmployeeModal] = useState(false);
  const [editEmployeeModal, setEditEmployeeModal] = useState(false);
  const [editingEmpId, setEditingEmpId] = useState("");
  const [empFirstName, setEmpFirstName] = useState("");
  const [empLastName, setEmpLastName] = useState("");
  const [empRole, setEmpRole] = useState("Tailleur");
  const [empDepartment, setEmpDepartment] = useState("Atelier Confection");
  const [empPhone, setEmpPhone] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empContractType, setEmpContractType] = useState("CDI");
  const [empSalary, setEmpSalary] = useState<number>(150000);
  const [empHireDate, setEmpHireDate] = useState(new Date().toISOString().split("T")[0]);

  const [editExpenseCategoryModal, setEditExpenseCategoryModal] = useState(false);
  const [editingExpCatId, setEditingExpCatId] = useState("");

  const handleCreateExpenseCategory = () => {
    if (!newExpCatLabel) {
      alert("Veuillez entrer le libellé de la ligne de dépense.");
      return;
    }
    const newCat = {
      id: `exp_cat_${Date.now()}`,
      code: newExpCatCode ? newExpCatCode.toUpperCase() : `LIGNE-${String(expenseCategories.length + 1).padStart(3, "0")}`,
      label: newExpCatLabel.toUpperCase(),
      description: newExpCatDesc || "Ligne de dépense personnalisée",
    };

    setExpenseCategories((prev) => {
      const updated = [...prev, newCat];
      setStoredLocal("gy_expense_categories", updated);
      return updated;
    });

    setExpCategory(newCat.label);
    setNewExpenseCategoryModal(false);
    setNewExpCatLabel("");
    setNewExpCatCode("");
    setNewExpCatDesc("");
  };

  const handleResetPlatform = async () => {
    if (!confirm("⚠️ ATTENTION : Voulez-vous vraiment RÉINITIALISER toute la plateforme à ZÉRO (suppression de tous les clients, commandes, reçus, chiffres) ? Cette action est irréversible.")) {
      return;
    }
    try {
      localStorage.removeItem("gy_customers");
      localStorage.removeItem("gy_orders");
      localStorage.removeItem("gy_recettes");
      localStorage.removeItem("gy_depenses");

      setCustomers([]);
      setOrders([]);
      setRecettesList([]);
      setDepensesList([]);

      await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetAll: true }),
      });

      alert("La plateforme a été réinitialisée à ZÉRO avec succès !");
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenEditExpenseCategory = (cat: any) => {
    setEditingExpCatId(cat.id);
    setNewExpCatLabel(cat.label || "");
    setNewExpCatCode(cat.code || "");
    setNewExpCatDesc(cat.description || "");
    setEditExpenseCategoryModal(true);
  };

  const handleSaveEditExpenseCategory = () => {
    if (!newExpCatLabel || !editingExpCatId) {
      alert("Veuillez entrer le libellé de la ligne de dépense.");
      return;
    }
    setExpenseCategories((prev) => {
      const updated = prev.map((cat) => {
        if (cat.id === editingExpCatId) {
          return {
            ...cat,
            label: newExpCatLabel.toUpperCase(),
            code: newExpCatCode ? newExpCatCode.toUpperCase() : cat.code,
            description: newExpCatDesc || cat.description,
          };
        }
        return cat;
      });
      setStoredLocal("gy_expense_categories", updated);
      return updated;
    });

    setEditExpenseCategoryModal(false);
    setEditingExpCatId("");
    setNewExpCatLabel("");
    setNewExpCatCode("");
    setNewExpCatDesc("");
  };

  const handleDeleteExpenseCategory = (cat: any) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la ligne de dépense "${cat.label}" ?`)) {
      return;
    }
    setExpenseCategories((prev) => {
      const updated = prev.filter((c) => c.id !== cat.id);
      setStoredLocal("gy_expense_categories", updated);
      return updated;
    });
  };

  const handleAddItemToOrder = () => {
    setNewOrderItemsList((prev) => [
      ...prev,
      { id: String(Date.now()), itemName: "", price: "", fabricDetails: "" },
    ]);
  };

  const handleRemoveItemFromOrder = (id: string) => {
    if (newOrderItemsList.length <= 1) return;
    setNewOrderItemsList((prev) => {
      const updated = prev.filter((it) => it.id !== id);
      const total = updated.reduce((acc, it) => acc + Number(it.price || 0), 0);
      setNewOrderTotalAmount(total > 0 ? total : "");
      return updated;
    });
  };

  const handleItemChange = (id: string, field: string, val: any) => {
    setNewOrderItemsList((prev) => {
      const updated = prev.map((it) => (it.id === id ? { ...it, [field]: val } : it));
      const total = updated.reduce((acc, it) => acc + Number(it.price || 0), 0);
      setNewOrderTotalAmount(total > 0 ? total : "");
      return updated;
    });
  };

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
      const [dashRes, ordersRes, custRes, finRes, empRes, usersRes, stockRes] = await Promise.all([
        fetch("/api/admin/dashboard", noCacheOpts),
        fetch("/api/admin/orders", noCacheOpts),
        fetch("/api/admin/customers", noCacheOpts),
        fetch("/api/admin/finances", noCacheOpts),
        fetch("/api/admin/employees", noCacheOpts).catch(() => null),
        fetch("/api/admin/users", noCacheOpts).catch(() => null),
        fetch("/api/admin/stock", noCacheOpts).catch(() => null),
      ]);

      const dashData = dashRes.ok ? await dashRes.json() : {};
      const ordersData = ordersRes.ok ? await ordersRes.json() : [];
      const custData = custRes.ok ? await custRes.json() : [];
      const finData = finRes.ok ? await finRes.json() : {};
      const empData = empRes && empRes.ok ? await empRes.json() : [];
      const usersData = usersRes && usersRes.ok ? await usersRes.json() : [];
      const stockData = stockRes && stockRes.ok ? await stockRes.json() : [];
      if (Array.isArray(stockData)) setStockList(stockData);

      const serverEmps = Array.isArray(empData) ? empData : [];
      const localEmps = getStoredLocal("gy_employees");
      const mergedEmps = serverEmps.length > 0
        ? [...serverEmps, ...localEmps.filter((l: any) => !serverEmps.some((s: any) => s.id === l.id))]
        : (localEmps.length > 0 ? localEmps : DEFAULT_EMPLOYEES);

      setEmployeesList(mergedEmps);
      setStoredLocal("gy_employees", mergedEmps);

      const localCategories = getStoredLocal("gy_expense_categories");
      if (localCategories && localCategories.length > 0) {
        setExpenseCategories(localCategories);
      }

      const serverUsers = Array.isArray(usersData) ? usersData : [];
      const mergedUsers = [...DEFAULT_ADMIN_USERS];
      serverUsers.forEach((su: any) => {
        if (!mergedUsers.some((mu) => mu.email === su.email)) {
          mergedUsers.push({
            id: su.id,
            fullName: su.fullName,
            email: su.email,
            role: su.role,
            roleLabel: su.role === "SUPER_ADMIN" ? "SUPER ADMIN (DIRECTION)" : (su.role === "ADMINISTRATION" ? "ASSISTANTE (ADMINISTRATION)" : su.role),
            status: "ACTIF",
            phone: "+229 97 00 00 00",
            createdAt: su.createdAt ? su.createdAt.split("T")[0] : "2026-08-17",
          });
        }
      });
      setAdminUsersList(mergedUsers);
      setStoredLocal("gy_admin_users", mergedUsers);

      const localCusts = getStoredLocal("gy_customers");
      const localOrders = getStoredLocal("gy_orders");
      const localRecettes = getStoredLocal("gy_recettes");
      const localDepenses = getStoredLocal("gy_depenses");
      const serverCusts = Array.isArray(custData) ? custData : [];
      const serverOrders = Array.isArray(ordersData) ? ordersData : [];
      const serverRecettes = Array.isArray(finData.recettes) ? finData.recettes : [];
      const serverDepenses = Array.isArray(finData.depenses) ? finData.depenses : [];

      const mergedOrders: any[] = serverOrders;
      const mergedCusts: any[] = serverCusts.map((c: any) => {
        const cOrders = mergedOrders.filter((o: any) => o.customerId === c.id || o.customerId === c.code || o.customer?.id === c.id || o.customer?.code === c.code);
        return {
          ...c,
          orders: cOrders.length > 0 ? cOrders : (c.orders || []),
        };
      });

      // Extract payments embedded inside mergedOrders
      const embeddedPayments: any[] = [];
      mergedOrders.forEach((o: any) => {
        if (o.payments && Array.isArray(o.payments) && o.payments.length > 0) {
          o.payments.forEach((p: any) => {
            embeddedPayments.push({
              id: p.id || `pay_${o.id}`,
              receiptNumber: p.receiptNumber || `REC-2026-${String(embeddedPayments.length + 1).padStart(4, "0")}`,
              orderId: o.id,
              customerId: o.customerId,
              amount: Number(p.amount || 0),
              paymentMode: p.paymentMode || "ESPECES",
              createdAt: p.createdAt || o.createdAt || new Date().toISOString(),
              receivedBy: p.receivedBy || "Ghislaine LOKO DJIDJOHO",
              order: o,
              customer: mergedCusts.find((c: any) => c.id === o.customerId) || o.customer,
            });
          });
        } else if (Number(o.totalPaid || 0) > 0) {
          embeddedPayments.push({
            id: `pay_${o.id}`,
            receiptNumber: `REC-2026-0001`,
            orderId: o.id,
            customerId: o.customerId,
            amount: Number(o.totalPaid),
            paymentMode: "ESPECES",
            createdAt: o.createdAt || new Date().toISOString(),
            receivedBy: "Ghislaine LOKO DJIDJOHO",
            order: o,
            customer: mergedCusts.find((c: any) => c.id === o.customerId) || o.customer,
          });
        }
      });

      const finalRecettes = [...serverRecettes];
      embeddedPayments.forEach((ep) => {
        if (!finalRecettes.some((r: any) => r.id === ep.id || r.receiptNumber === ep.receiptNumber || (r.orderId === ep.orderId && r.amount === ep.amount))) {
          finalRecettes.push(ep);
        }
      });

      const mergedDepenses = [...serverDepenses];

      setStoredLocal("gy_customers", mergedCusts);
      setStoredLocal("gy_orders", mergedOrders);
      setStoredLocal("gy_recettes", finalRecettes);
      setStoredLocal("gy_depenses", mergedDepenses);

      // Compute Executive Dashboard metrics dynamically from mergedOrders & finalRecettes
      const dynamicTotalRevenue = mergedOrders.reduce((acc: number, o: any) => acc + Number(o.totalAmount || 0), 0);
      const dynamicTotalCollected = finalRecettes.reduce((acc: number, r: any) => acc + Number(r.amount || 0), 0);
      const dynamicTotalReceivables = mergedOrders.reduce((acc: number, o: any) => acc + Number(o.balanceDue || 0), 0);

      setMetrics({
        totalRevenueMonth: dynamicTotalRevenue,
        totalCollected: dynamicTotalCollected,
        totalReceivables: dynamicTotalReceivables,
        totalOrders: mergedOrders.length,
        lowStockCount: dashData.metrics?.lowStockCount || 0,
      });

      setOrders(mergedOrders);
      setCustomers(mergedCusts);

      setRecettesList(finalRecettes);
      setDepensesList(mergedDepenses);

      setFinanceMetrics({
        ...(finData.metrics || {}),
        totalRecettes: dynamicTotalCollected,
        netBalance: dynamicTotalCollected - (finData.metrics?.totalDepenses || 0),
      });

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

        // 1. Update Orders state & local cache
        setOrders((prev) => {
          const updated = prev.map((o) => (o.id === targetOrder.id || o.reference === targetOrder.reference ? { ...o, ...updatedOrd } : o));
          setStoredLocal("gy_orders", updated);
          return updated;
        });

        // 2. Update Customers state so ESPACE CLIENT & customer view reflects payment instantly
        setCustomers((prev) => {
          const updated = prev.map((c) => {
            if (c.id === targetOrder.customerId || c.id === updatedOrd.customerId) {
              const existingOrders = c.orders || [];
              const updatedCustOrders = existingOrders.map((o: any) =>
                o.id === targetOrder.id || o.reference === targetOrder.reference ? { ...o, ...updatedOrd } : o
              );
              return { ...c, orders: updatedCustOrders };
            }
            return c;
          });
          setStoredLocal("gy_customers", updated);
          return updated;
        });

        const newPay = updatedOrd.payments && updatedOrd.payments.length > 0 ? updatedOrd.payments[updatedOrd.payments.length - 1] : null;
        const custObj = customers.find((c) => c.id === targetOrder.customerId) || targetOrder.customer;
        const custName = custObj ? `${custObj.firstName || ""} ${custObj.lastName || ""}`.trim() : "Client VIP";
        const recNumber = newPay?.receiptNumber || `REC-2026-${String(Date.now()).slice(-4)}`;

        // 3. Update Receipts List state & local cache
        const newReceipt = {
          id: newPay?.id || `rec_${Date.now()}`,
          receiptNumber: recNumber,
          amount: payAmount,
          paymentMode: payMode,
          createdAt: newPay?.createdAt || new Date().toISOString(),
          customer: custObj,
          customerId: targetOrder.customerId,
          order: targetOrder,
          receivedBy: payAgent,
        };

        setRecettesList((prev) => {
          const updatedRec = [newReceipt, ...prev.filter((r) => r.id !== newReceipt.id)];
          setStoredLocal("gy_recettes", updatedRec);
          return updatedRec;
        });

        setPaymentWizardModal(false);

        // 4. Pop up Success Notification Modal
        setSuccessReceiptModal({
          receiptNumber: recNumber,
          amount: payAmount,
          customerName: custName,
          orderRef: targetOrder.reference || "ORD-2026-3719",
          balanceDue: updatedOrd.balanceDue ?? Math.max(0, (targetOrder.totalAmount || 50000) - payAmount),
        });

        setPayAmount(0);
        setPayRef("");

        // 5. Instant re-fetch to sync all Executive Dashboard metrics across tabs
        await fetchData();

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
    if (!confirm(`Voulez-vous vraiment supprimer définitivement le client "${customerName}" et toutes ses commandes ?`)) {
      return;
    }
    try {
      setCustomers((prev) => {
        const updated = prev.filter((c) => c.id !== customerId && c.code !== customerId);
        setStoredLocal("gy_customers", updated);
        return updated;
      });
      setOrders((prev) => {
        const updated = prev.filter((o) => o.customerId !== customerId);
        setStoredLocal("gy_orders", updated);
        return updated;
      });
      await fetch(`/api/admin/customers?id=${customerId}`, { method: "DELETE" });
      await fetchData();
    } catch (e) {
      console.error("Error deleting customer:", e);
    }
  };

  const handleDeleteRecette = async (recetteId: string, receiptNum: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer cet encaissement / reçu "${receiptNum}" ?`)) {
      return;
    }
    try {
      setRecettesList((prev) => {
        const updated = prev.filter((r) => r.id !== recetteId && r.receiptNumber !== receiptNum);
        setStoredLocal("gy_recettes", updated);
        return updated;
      });
      await fetch(`/api/admin/finances?id=${recetteId}&type=recette`, { method: "DELETE" });
      await fetchData();
    } catch (e) {
      console.error("Error deleting recette:", e);
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
    const validItems = newOrderItemsList.filter((it) => it.itemName && it.itemName.trim().length > 0);
    const mainItemName = validItems.length > 0
      ? validItems.map((it) => it.itemName.trim()).join(" + ")
      : newOrderItemName;
    const computedTotal = validItems.length > 0
      ? validItems.reduce((acc, it) => acc + Number(it.price || 0), 0)
      : Number(newOrderTotalAmount);

    if (!targetCustomerId || (!newOrderItemName && validItems.length === 0) || computedTotal <= 0) {
      alert("Veuillez choisir un client, saisir au moins une tenue et un montant total valide.");
      return;
    }

    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: targetCustomerId,
          itemName: mainItemName,
          items: validItems.length > 0 ? validItems : [{ itemName: newOrderItemName, price: computedTotal, fabricDetails: newOrderFabricDetails }],
          orderDate: newOrderOrderDate,
          promisedDate: newOrderPromisedDate,
          fabricDetails: newOrderFabricDetails || (validItems.length > 0 ? validItems.map(it => `${it.itemName}: ${it.fabricDetails || 'Tissu fourni'}`).join(" | ") : ""),
          customNotes: newOrderCustomNotes,
          totalAmount: computedTotal,
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
        setNewOrderItemsList([{ id: "1", itemName: "", price: "", fabricDetails: "" }]);
        setNewOrderFabricDetails("");
        setNewOrderCustomNotes("");
        setNewOrderTotalAmount("");
        setNewOrderDepositRequired("");
        setActiveMenu("commandes");
        await fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Erreur lors de la création de la commande");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenEditOrder = (o: any) => {
    setEditOrderObj(o);
    setEditOrderTotalAmount(o.totalAmount || "");
    setEditOrderPromisedDate(o.promisedDate ? new Date(o.promisedDate).toISOString().split("T")[0] : "");
    setEditOrderFabricDetails(o.fabricDetails || "");
    setEditOrderCustomNotes(o.customNotes || "");
    setEditOrderPriority(o.priority || "VIP");
    setEditOrderStatus(o.status || "PRODUCTION");
    setEditOrderItemsList(
      o.items && o.items.length > 0
        ? o.items.map((it: any, idx: number) => ({ id: it.id || String(idx + 1), itemName: it.itemName || "", price: it.price || "", fabricDetails: it.fabricDetails || "" }))
        : [{ id: "1", itemName: o.itemName || "Tenue Sur-Mesure", price: o.totalAmount || "", fabricDetails: o.fabricDetails || "" }]
    );
    setEditOrderModal(true);
  };

  const handleDeleteOrder = async (o: any) => {
    if (!window.confirm(`Supprimer la commande ${o.reference} ? Cette action est irréversible.`)) return;
    try {
      const res = await fetch(`/api/admin/orders?id=${o.id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchData();
        alert(`Commande ${o.reference} supprimée.`);
      } else {
        const err = await res.json();
        alert("Erreur : " + (err.error || "Suppression impossible"));
      }
    } catch (e) {
      alert("Erreur réseau lors de la suppression.");
    }
  };

  // ============================================================
  // CLIENT ACCOUNT HANDLERS
  // ============================================================
  const handleCreateClientAccount = async () => {
    if (!clientAccountModal || !clientAccountEmail) {
      alert("Veuillez saisir un email pour la cliente.");
      return;
    }
    setClientAccountLoading(true);
    try {
      const res = await fetch("/api/admin/client-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: clientAccountModal.id,
          email: clientAccountEmail,
          fullName: `${clientAccountModal.firstName} ${clientAccountModal.lastName}`,
          phone: clientAccountModal.phone || "",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setClientAccountCredentials(data.credentials);
      } else if (res.status === 409) {
        alert("Un compte existe déjà pour cette cliente : " + (data.existingEmail || data.error));
      } else {
        alert("Erreur : " + (data.error || "Impossible de créer le compte."));
      }
    } catch (e) {
      alert("Erreur réseau.");
    } finally {
      setClientAccountLoading(false);
    }
  };

  // ============================================================
  // IMAGE UPLOAD HANDLERS
  // ============================================================

  /** Convertit n'importe quelle image en WebP via Canvas API (côté navigateur) */
  const convertToWebP = (file: File, quality = 0.85): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(file); return; }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (!blob) { resolve(file); return; }
            const webpFile = new File(
              [blob],
              file.name.replace(/\.[^.]+$/, "") + ".webp",
              { type: "image/webp" }
            );
            resolve(webpFile);
          },
          "image/webp",
          quality
        );
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  };

  const handleUploadOrderImage = async (file: File, imageType: "fabric" | "delivery") => {
    if (!orderImagesModal) return;
    setUploadingImage(true);
    try {
      // Convertir en WebP avant l'upload
      const webpFile = await convertToWebP(file);

      const formData = new FormData();
      formData.append("file", webpFile);
      formData.append("orderId", orderImagesModal.id);
      formData.append("imageType", imageType);

      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok && data.url) {
        // Update order in cloud with new image URL
        const currentImages: string[] = orderImagesModal.images || [];
        const updateBody: any = { orderId: orderImagesModal.id };
        if (imageType === "delivery") {
          updateBody.deliveryImage = data.url;
        } else {
          updateBody.images = [...currentImages, data.url];
        }
        const updateRes = await fetch("/api/admin/orders", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateBody),
        });
        if (updateRes.ok) {
          const updated = await updateRes.json();
          setOrderImagesModal(updated);
          await fetchData();
        }
      } else {
        alert("Erreur upload : " + (data.error || "inconnu"));
      }
    } catch (e) {
      alert("Erreur réseau lors de l'upload.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveOrderImage = async (imageUrl: string) => {
    if (!orderImagesModal) return;
    const updatedImages = (orderImagesModal.images || []).filter((img: string) => img !== imageUrl);
    const res = await fetch("/api/admin/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: orderImagesModal.id, images: updatedImages }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrderImagesModal(updated);
      await fetchData();
    }
  };

  // ============================================================
  // STOCK HANDLERS
  // ============================================================
  const handleCreateStockItem = async () => {
    if (!stkName) { alert("Veuillez saisir le nom de l'article."); return; }
    try {
      const res = await fetch("/api/admin/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: stkName, category: stkCategory, type: stkType,
          unit: stkUnit, quantity: stkQuantity, minQuantity: stkMinQty,
          supplierInfo: stkSupplier,
        }),
      });
      if (res.ok) {
        const item = await res.json();
        setStockList((prev) => [item, ...prev]);
        setNewStockModal(false);
        setStkName(""); setStkCategory("TISSU"); setStkType("CONSOMMABLE");
        setStkUnit("m"); setStkQuantity(""); setStkMinQty(""); setStkSupplier("");
      }
    } catch (e) { alert("Erreur réseau."); }
  };

  const handleStockMovement = async () => {
    if (!stockMvtModal || !mvtQty) { alert("Quantité requise."); return; }
    try {
      const res = await fetch("/api/admin/stock", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: stockMvtModal.id,
          movement: { type: mvtType, quantity: mvtQty, reason: mvtReason, by: currentUser?.fullName || "Admin" },
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setStockList((prev) => prev.map((s) => s.id === updated.id ? updated : s));
        setStockMvtModal(null);
        setMvtType("ENTREE"); setMvtQty(""); setMvtReason("");
      }
    } catch (e) { alert("Erreur réseau."); }
  };

  const handleDeleteStockItem = async (id: string, name: string) => {
    if (!window.confirm(`Supprimer l'article "${name}" du stock ?`)) return;
    try {
      const res = await fetch(`/api/admin/stock?id=${id}`, { method: "DELETE" });
      if (res.ok) setStockList((prev) => prev.filter((s) => s.id !== id));
    } catch (e) { alert("Erreur réseau."); }
  };

  const handleEditAddItem = () => {
    setEditOrderItemsList((prev) => [
      ...prev,
      { id: String(Date.now()), itemName: "", price: "", fabricDetails: "" },
    ]);
  };

  const handleEditRemoveItem = (id: string) => {
    if (editOrderItemsList.length <= 1) return;
    setEditOrderItemsList((prev) => {
      const updated = prev.filter((it) => it.id !== id);
      const total = updated.reduce((acc, it) => acc + Number(it.price || 0), 0);
      setEditOrderTotalAmount(total > 0 ? total : "");
      return updated;
    });
  };

  const handleEditItemChange = (id: string, field: string, val: any) => {
    setEditOrderItemsList((prev) => {
      const updated = prev.map((it) => (it.id === id ? { ...it, [field]: val } : it));
      const total = updated.reduce((acc, it) => acc + Number(it.price || 0), 0);
      setEditOrderTotalAmount(total > 0 ? total : "");
      return updated;
    });
  };

  const handleSaveEditedOrder = async () => {
    if (!editOrderObj) return;
    const validItems = editOrderItemsList.filter((it) => it.itemName && it.itemName.trim().length > 0);
    const computedTotal = validItems.length > 0
      ? validItems.reduce((acc, it) => acc + Number(it.price || 0), 0)
      : Number(editOrderTotalAmount || 0);

    if (computedTotal <= 0) {
      alert("Veuillez saisir un montant total valide pour la commande.");
      return;
    }

    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: editOrderObj.id,
          newStatus: editOrderStatus,
          totalAmount: computedTotal,
          promisedDate: editOrderPromisedDate,
          fabricDetails: editOrderFabricDetails,
          customNotes: editOrderCustomNotes,
          priority: editOrderPriority,
          items: validItems,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) =>
          prev.map((o) => (o.id === editOrderObj.id || o.reference === editOrderObj.reference ? { ...o, ...updated } : o))
        );
        setEditOrderModal(false);
        await fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Erreur lors de la modification de la commande");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateEmployee = async () => {
    if (!empFirstName || !empLastName || !empRole) {
      alert("Veuillez remplir le prénom, le nom et le rôle du membre du personnel.");
      return;
    }
    try {
      const res = await fetch("/api/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: empFirstName,
          lastName: empLastName,
          role: empRole,
          department: empDepartment,
          phone: empPhone,
          email: empEmail,
          contractType: empContractType,
          salary: Number(empSalary || 150000),
          hireDate: empHireDate,
        }),
      });

      if (res.ok) {
        const createdEmp = await res.json();
        setEmployeesList((prev) => {
          const updated = [createdEmp, ...prev.filter((e) => e.id !== createdEmp.id)];
          setStoredLocal("gy_employees", updated);
          return updated;
        });
        setNewEmployeeModal(false);
        setEmpFirstName("");
        setEmpLastName("");
        setEmpPhone("");
        setEmpEmail("");
        setEmpSalary(150000);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Erreur lors de la création du membre du personnel.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenEditEmployee = (emp: any) => {
    setEditingEmpId(emp.id);
    setEmpFirstName(emp.firstName || "");
    setEmpLastName(emp.lastName || "");
    setEmpRole(emp.role || "Tailleur");
    setEmpDepartment(emp.department || "Atelier Confection");
    setEmpPhone(emp.phone || "");
    setEmpEmail(emp.email || "");
    setEmpContractType(emp.contractType || "CDI");
    setEmpSalary(emp.salary || 150000);
    setEmpHireDate(emp.hireDate || new Date().toISOString().split("T")[0]);
    setEditEmployeeModal(true);
  };

  const handleSaveEditEmployee = async () => {
    if (!editingEmpId || !empFirstName || !empLastName || !empRole) {
      alert("Veuillez remplir le prénom, le nom et le rôle du membre du personnel.");
      return;
    }
    try {
      const res = await fetch("/api/admin/employees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingEmpId,
          firstName: empFirstName,
          lastName: empLastName,
          role: empRole,
          department: empDepartment,
          phone: empPhone,
          email: empEmail,
          contractType: empContractType,
          salary: Number(empSalary || 150000),
          hireDate: empHireDate,
        }),
      });

      if (res.ok) {
        const updatedEmp = await res.json();
        setEmployeesList((prev) => {
          const updated = prev.map((e) => (e.id === editingEmpId ? { ...e, ...updatedEmp } : e));
          setStoredLocal("gy_employees", updated);
          return updated;
        });
        setEditEmployeeModal(false);
        setEditingEmpId("");
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Erreur lors de la modification de l'employé.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteEmployee = async (emp: any) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${emp.firstName} ${emp.lastName} (${emp.role}) du personnel ?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/employees?id=${emp.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setEmployeesList((prev) => {
          const updated = prev.filter((e) => e.id !== emp.id);
          setStoredLocal("gy_employees", updated);
          return updated;
        });
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Erreur lors de la suppression de l'employé.");
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
                className="w-full bg-[#181820] border border-[#2A2A38] rounded-xl p-3.5 text-white font-bold text-sm focus:border-[#D4AF37] focus:outline-none normal-case"
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
                  className="w-full bg-[#181820] border border-[#2A2A38] rounded-xl p-3.5 pr-24 text-white font-bold text-sm focus:border-[#D4AF37] focus:outline-none normal-case"
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
                  onClick={() => { setActiveMenu("stock" as any); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-start px-5 py-4 rounded-2xl text-sm transition-all tracking-wider font-extrabold ${
                    activeMenu === ("stock" as any)
                      ? "bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#997A2C] text-black shadow-[0_4px_20px_rgba(212,175,55,0.4)]"
                      : "bg-[#181820] text-white border border-[#2A2A38] hover:border-[#D4AF37]/60 hover:bg-[#20202C]"
                  }`}
                >
                  <span>STOCK & MATIÈRES</span>
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
              onClick={() => setActiveMenu("stock" as any)}
              className={`w-full flex items-center justify-start px-4 py-3 rounded-xl text-xs sm:text-sm transition-all tracking-wider font-extrabold ${
                activeMenu === ("stock" as any)
                  ? "bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#997A2C] text-black shadow-[0_4px_20px_rgba(212,175,55,0.4)]"
                  : "bg-[#181820] text-white border border-[#2A2A38] hover:border-[#D4AF37]/60 hover:bg-[#20202C]"
              }`}
            >
              <span>STOCK & MATIÈRES</span>
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
                <div className="text-xs font-black text-white leading-tight truncate">{currentUser?.fullName || "Ghislaine LOKO"}</div>
                <div className="text-[10px] text-[#D4AF37] font-bold truncate">{currentUser?.role || "Directrice Générale"}</div>
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
                        <th className="min-w-[220px]">NOM & PRÉNOM</th>
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
                          <td>
                            <span className="framed-badge-gold text-xs font-black">
                              {c.category}
                            </span>
                          </td>
                          <td className="font-bold text-white">
                            {(() => {
                              const custOrders = orders.filter((o) => o.customerId === c.id || o.customerId === c.code || o.customer?.id === c.id || o.customer?.code === c.code);
                              const totalCount = Math.max(c.orders?.length || 0, custOrders.length);
                              return `${totalCount} commande(s)`;
                            })()}
                          </td>
                          <td>
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => setViewCustomerModal(c)}
                                className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-white border border-sky-500/40 transition-all text-sm font-bold flex items-center justify-center shadow-sm"
                                title="Voir la fiche client"
                              >
                                👁️
                              </button>

                              <button
                                onClick={() => handleOpenEditCustomer(c)}
                                className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black border border-amber-500/40 transition-all text-sm font-bold flex items-center justify-center shadow-sm"
                                title="Modifier (Crayon)"
                              >
                                ✏️
                              </button>

                              <button
                                onClick={() => handleDeleteCustomer(c.id, `${c.firstName} ${c.lastName}`)}
                                className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/40 transition-all text-sm font-bold flex items-center justify-center shadow-sm"
                                title="Supprimer (Panier)"
                              >
                                🗑️
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
                            <div className="flex items-center justify-center space-x-1.5">
                              <button
                                onClick={() => setViewOrderModal(o)}
                                className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-white border border-sky-500/40 text-xs font-black flex items-center justify-center transition-all shadow-sm"
                                title="Voir la fiche commande"
                              >
                                👁️
                              </button>
                              <button
                                onClick={() => setOrderImagesModal(o)}
                                className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-300 hover:bg-violet-500 hover:text-white border border-violet-500/40 text-xs font-black flex items-center justify-center transition-all shadow-sm"
                                title="Photos tissus et produit fini"
                              >
                                📸
                              </button>
                              <button
                                onClick={() => handleOpenEditOrder(o)}
                                className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black border border-amber-500/40 text-xs font-black flex items-center justify-center transition-all shadow-sm"
                                title="Modifier la commande (Crayon)"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleOpenPaymentWizard(o.customer, o)}
                                className="px-2.5 py-1.5 bg-gy-gold/20 text-gy-gold hover:bg-gy-gold hover:text-black border border-gy-gold/40 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all"
                                title="Ajouter un paiement / reçu"
                              >
                                + REÇU
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(o)}
                                className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/40 text-xs font-black flex items-center justify-center transition-all shadow-sm"
                                title="Supprimer la commande (Panier)"
                              >
                                🗑️
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
                          <th className="min-w-[120px] text-center">ACTION</th>
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
                            <td className="text-center">
                              <button
                                onClick={() => handleDeleteRecette(r.id, r.receiptNumber)}
                                className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-extrabold uppercase hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                              >
                                [ SUPPRIMER ]
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

                    {/* Historique Détaillé des Paiements et Reçus du Client */}
                    <div className="space-y-4 pt-6 border-t border-[#2A2A38]">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <h3 className="font-serif text-2xl font-bold text-white">HISTORIQUE DÉTAILLÉ DES PAIEMENTS & REÇUS</h3>
                          <p className="text-xs text-gy-textMuted mt-0.5">Tous les versements et reçus officiels enregistrés pour {selectedCust?.firstName} {selectedCust?.lastName}</p>
                        </div>
                        <button
                          onClick={() => handleOpenPaymentWizard(selectedCust)}
                          className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-black uppercase hover:bg-emerald-500 hover:text-white transition-all shadow-md shrink-0 cursor-pointer"
                        >
                          + ENREGISTRER UN PAIEMENT
                        </button>
                      </div>

                      {(() => {
                        const custRecettes = recettesList.filter((r) => r.customerId === selectedCust?.id || r.customer?.id === selectedCust?.id || (r.order && custOrders.some((o) => o.id === r.orderId || o.reference === r.order?.reference)));
                        return custRecettes.length === 0 ? (
                          <div className="framed-card p-6 text-center text-gy-textMuted text-sm font-semibold border border-[#2A2A38]">
                            Aucun reçu de paiement enregistré pour ce client pour le moment.
                          </div>
                        ) : (
                          <div className="framed-card p-2 overflow-hidden border-2 border-emerald-500/40 bg-[#121217]">
                            <div className="overflow-x-auto">
                              <table className="framed-table text-left text-sm text-gy-text font-aptos">
                                <thead>
                                  <tr>
                                    <th className="min-w-[130px]">N° REÇU</th>
                                    <th className="min-w-[150px]">N° COMMANDE</th>
                                    <th className="min-w-[160px]">MONTANT ENCAISSÉ</th>
                                    <th className="min-w-[150px]">MODE RÈGLEMENT</th>
                                    <th className="min-w-[140px]">DATE PAIEMENT</th>
                                    <th className="min-w-[180px]">AGENT RÉCEPTEUR</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {custRecettes.map((r) => (
                                    <tr key={r.id}>
                                      <td className="font-bold text-white">
                                        <span className="framed-badge-gold text-xs font-black">{r.receiptNumber}</span>
                                      </td>
                                      <td className="font-bold text-[#D4AF37]">{r.order?.reference || "ORD-2026-3719"}</td>
                                      <td>
                                        <span className="framed-badge-emerald text-base font-bold">
                                          {formatFcfa(r.amount)}
                                        </span>
                                      </td>
                                      <td>
                                        <span className="px-3 py-1 bg-[#181820] border border-[#2A2A38] rounded-xl text-xs font-bold text-sky-400 uppercase">
                                          {r.paymentMode}
                                        </span>
                                      </td>
                                      <td className="font-semibold text-gy-textMuted">{formatDate(r.createdAt)}</td>
                                      <td className="text-gy-textMuted text-xs font-bold">{r.receivedBy || "Administration GY"}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })()}
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
            <div className="space-y-8 font-aptos">
              {/* Header Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="font-serif text-4xl font-bold text-white">RH & MANAGEMENT DU PERSONNEL</h2>
                  <p className="text-sm text-gy-textMuted mt-1">Gestion des effectifs, rôles, contrats, masse salariale et affectations atelier</p>
                </div>
                <button
                  onClick={() => setNewEmployeeModal(true)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gold-gradient text-black font-black text-xs uppercase tracking-wider shadow-gold hover:opacity-95 transition-all cursor-pointer"
                >
                  + AJOUTER UN MEMBRE DU PERSONNEL
                </button>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="framed-card p-5 border-l-4 border-l-[#D4AF37]">
                  <span className="text-xs font-extrabold text-gy-textMuted uppercase tracking-wider block">Effectif Total</span>
                  <h3 className="font-serif text-3xl font-black text-white mt-2">{employeesList.length} Employés</h3>
                </div>
                <div className="framed-card p-5 border-l-4 border-l-sky-400">
                  <span className="text-xs font-extrabold text-gy-textMuted uppercase tracking-wider block">Tailleurs & Artisans</span>
                  <h3 className="font-serif text-3xl font-black text-sky-400 mt-2">
                    {employeesList.filter((e) => e.role === "Tailleur" || e.department?.includes("Atelier")).length} Membres
                  </h3>
                </div>
                <div className="framed-card p-5 border-l-4 border-l-emerald-400">
                  <span className="text-xs font-extrabold text-gy-textMuted uppercase tracking-wider block">Masse Salariale Mensuelle</span>
                  <h3 className="font-serif text-2xl font-black text-emerald-400 mt-2">
                    {formatFcfa(employeesList.reduce((acc, e) => acc + Number(e.salary || 0), 0))}
                  </h3>
                </div>
                <div className="framed-card p-5 border-l-4 border-l-purple-400">
                  <span className="text-xs font-extrabold text-gy-textMuted uppercase tracking-wider block">Statut Présence</span>
                  <h3 className="font-serif text-3xl font-black text-purple-400 mt-2">100% ACTIFS</h3>
                </div>
              </div>

              {/* Role Filters */}
              <div className="flex flex-wrap gap-2 border-b border-[#2A2A38] pb-4">
                {[
                  { key: "TOUS", label: "TOUT LE PERSONNEL" },
                  { key: "Directrice Générale", label: "DIRECTION" },
                  { key: "Assistante", label: "ADMINISTRATION & ACCUEIL" },
                  { key: "Tailleur", label: "TAILLEURS & ARTISANS" },
                  { key: "Agent d'entretien", label: "ENTRETIEN" },
                  { key: "Agent de liaison", label: "LIAISON & LIVRAISON" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setRhRoleFilter(f.key)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      rhRoleFilter === f.key
                        ? "bg-[#D4AF37] text-black font-black shadow-md"
                        : "bg-gy-dark border border-gy-border text-gy-textMuted hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Staff Table */}
              <div className="framed-card p-2 overflow-hidden border-2 border-gy-border">
                <div className="overflow-x-auto">
                  <table className="framed-table text-left text-sm text-gy-text font-aptos">
                    <thead>
                      <tr>
                        <th className="min-w-[110px]">CODE EMP</th>
                        <th className="min-w-[200px]">NOM & PRÉNOM</th>
                        <th className="min-w-[180px]">POSTE / RÔLE OFFICIEL</th>
                        <th className="min-w-[200px]">DÉPARTEMENT</th>
                        <th className="min-w-[160px]">CONTACTS (TÉL / EMAIL)</th>
                        <th className="min-w-[120px]">CONTRAT</th>
                        <th className="min-w-[150px]">SALAIRE MENSUEL</th>
                        <th className="min-w-[110px]">STATUT</th>
                        <th className="min-w-[180px] text-center">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeesList
                        .filter((e) => rhRoleFilter === "TOUS" || e.role === rhRoleFilter)
                        .map((emp) => (
                          <tr key={emp.id}>
                            <td className="font-bold text-white">
                              <span className="framed-badge-gold text-xs font-black">{emp.code || "EMP-000"}</span>
                            </td>
                            <td>
                              <div className="font-bold text-white text-base">
                                {emp.firstName} {emp.lastName}
                              </div>
                              <span className="text-[11px] text-gy-textMuted font-semibold">Embauché le {emp.hireDate || "01/01/2024"}</span>
                            </td>
                            <td>
                              <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase inline-block ${
                                emp.role === "Directrice Générale"
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                  : emp.role === "Assistante"
                                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/40"
                                  : emp.role === "Tailleur"
                                  ? "bg-sky-500/20 text-sky-400 border border-sky-500/40"
                                  : emp.role === "Agent d'entretien"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                  : "bg-teal-500/20 text-teal-400 border border-teal-500/40"
                              }`}>
                                {emp.role}
                              </span>
                            </td>
                            <td className="font-semibold text-gy-textMuted text-xs">{emp.department}</td>
                            <td className="text-xs">
                              <div className="font-bold text-white">{emp.phone}</div>
                              <div className="text-gy-textMuted truncate max-w-[180px]">{emp.email}</div>
                            </td>
                            <td>
                              <span className="px-2.5 py-1 bg-gy-dark border border-gy-border rounded-lg text-xs font-bold text-gy-gold uppercase">
                                {emp.contractType || "CDI"}
                              </span>
                            </td>
                            <td className="font-black text-emerald-400 text-base">
                              {formatFcfa(emp.salary || 150000)}
                            </td>
                            <td>
                              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-black uppercase">
                                {emp.status || "ACTIF"}
                              </span>
                            </td>
                            <td className="text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => handleOpenEditEmployee(emp)}
                                  className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black border border-amber-500/40 text-xs font-black flex items-center justify-center transition-all cursor-pointer shadow-sm"
                                  title="Modifier l'employé (Crayon)"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteEmployee(emp)}
                                  className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/40 text-xs font-black flex items-center justify-center transition-all cursor-pointer shadow-sm"
                                  title="Supprimer l'employé (Panier)"
                                >
                                  🗑️
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

          {(activeMenu as any) === "stock" && (
            <div className="space-y-8 font-aptos">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="font-serif text-4xl font-bold text-white">STOCK & MATIÈRES PREMIÈRES</h2>
                  <p className="text-sm text-gy-textMuted mt-1">Catalogue des matériels, tissus, fils et équipements — mouvements d&apos;entrée, de sortie et mises à disposition</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      if (stockList.length === 0) {
                        alert("Veuillez d'abord créer au moins un article dans le catalogue.");
                        return;
                      }
                      setStockMvtModal(stockList[0]);
                      setMvtType("ENTREE");
                      setMvtQty("");
                      setMvtReason("");
                    }}
                    className="px-5 py-3.5 rounded-2xl bg-gy-gold/20 text-gy-gold border border-gy-gold/40 font-black text-xs uppercase tracking-wider hover:bg-gy-gold hover:text-black transition-all cursor-pointer shadow-lg"
                  >
                    + NOUVEAU MOUVEMENT
                  </button>
                  <button
                    onClick={() => setNewStockModal(true)}
                    className="px-5 py-3.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-black text-xs uppercase tracking-wider hover:bg-emerald-500 hover:text-black transition-all cursor-pointer shadow-lg"
                  >
                    + NOUVEL ARTICLE
                  </button>
                </div>
              </div>

              {/* Sub tabs */}
              <div className="flex gap-3">
                {(["catalogue", "mouvements"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStockSubTab(tab)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                      stockSubTab === tab
                        ? "bg-gy-gold text-black shadow-gold"
                        : "bg-gy-dark text-gy-textMuted border border-gy-border hover:border-gy-gold/50"
                    }`}
                  >
                    {tab === "catalogue" ? "CATALOGUE" : "MOUVEMENTS"}
                  </button>
                ))}
              </div>

              {/* Search */}
              <input
                type="text"
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                placeholder="Rechercher un article..."
                className="w-full max-w-md bg-gy-dark border border-gy-border rounded-xl px-4 py-2.5 text-white text-sm focus:border-gy-gold focus:outline-none"
              />

              {stockSubTab === "catalogue" && (
                <div className="glass-panel rounded-3xl border border-gy-border overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gy-border bg-gy-dark/50">
                        <th className="p-4 text-gy-gold font-bold uppercase tracking-wider text-xs">Référence</th>
                        <th className="p-4 text-gy-gold font-bold uppercase tracking-wider text-xs">Article</th>
                        <th className="p-4 text-gy-gold font-bold uppercase tracking-wider text-xs">Catégorie</th>
                        <th className="p-4 text-gy-gold font-bold uppercase tracking-wider text-xs">Type</th>
                        <th className="p-4 text-gy-gold font-bold uppercase tracking-wider text-xs">Quantité</th>
                        <th className="p-4 text-gy-gold font-bold uppercase tracking-wider text-xs">Unité</th>
                        <th className="p-4 text-gy-gold font-bold uppercase tracking-wider text-xs">Seuil Min.</th>
                        <th className="p-4 text-gy-gold font-bold uppercase tracking-wider text-xs">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockList.filter((s) => !stockSearch || s.name?.toLowerCase().includes(stockSearch.toLowerCase()) || s.category?.toLowerCase().includes(stockSearch.toLowerCase())).map((item) => (
                        <tr key={item.id} className="border-b border-gy-border/30 hover:bg-gy-dark/40">
                          <td className="p-4 text-gy-gold font-bold text-xs">{item.reference}</td>
                          <td className="p-4 font-bold text-white">{item.name}</td>
                          <td className="p-4 text-gy-textMuted text-xs">{item.category}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-lg text-xs font-black ${item.type === "EQUIPEMENT" ? "bg-blue-500/20 text-blue-400" : "bg-amber-500/20 text-amber-400"}`}>
                              {item.type}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`font-black text-base ${Number(item.quantity) <= Number(item.minQuantity || 0) ? "text-rose-400" : "text-emerald-400"}`}>
                              {item.quantity}
                            </span>
                          </td>
                          <td className="p-4 text-gy-textMuted text-xs">{item.unit}</td>
                          <td className="p-4 text-gy-textMuted text-xs">{item.minQuantity || 0}</td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setStockMvtModal(item); setMvtType("ENTREE"); setMvtQty(""); setMvtReason(""); }}
                                className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-black hover:bg-emerald-500 hover:text-black transition-all"
                              >
                                MOUVEMENT
                              </button>
                              <button
                                onClick={() => handleDeleteStockItem(item.id, item.name)}
                                className="px-3 py-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-lg text-xs font-black hover:bg-rose-500 hover:text-white transition-all"
                              >
                                ✕
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {stockList.length === 0 && (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-gy-textMuted italic">
                            Aucun article en stock. Cliquez sur &quot;+ NOUVEL ARTICLE&quot; pour commencer.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {stockSubTab === "mouvements" && (
                <div className="space-y-4">
                  {stockList.flatMap((item) =>
                    (item.movements || []).map((mv: any) => ({ ...mv, itemName: item.name, itemRef: item.reference, unit: item.unit }))
                  ).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 50).map((mv: any) => (
                    <div key={mv.id} className="glass-panel p-4 rounded-2xl border border-gy-border flex justify-between items-center">
                      <div>
                        <span className={`px-2 py-1 rounded-lg text-xs font-black mr-3 ${
                          mv.type === "ENTREE" ? "bg-emerald-500/20 text-emerald-400" :
                          mv.type === "SORTIE" ? "bg-rose-500/20 text-rose-400" :
                          "bg-blue-500/20 text-blue-400"
                        }`}>{mv.type}</span>
                        <span className="font-bold text-white">{mv.itemName}</span>
                        {mv.reason && <span className="text-gy-textMuted text-xs ml-2">— {mv.reason}</span>}
                      </div>
                      <div className="text-right">
                        <div className="font-black text-lg text-white">{mv.quantity} {mv.unit}</div>
                        <div className="text-xs text-gy-textMuted">{new Date(mv.date).toLocaleDateString("fr-FR")} • {mv.by}</div>
                      </div>
                    </div>
                  ))}
                  {stockList.every((s) => !s.movements || s.movements.length === 0) && (
                    <div className="text-center text-gy-textMuted italic p-8">Aucun mouvement enregistré.</div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeMenu === "administrations" && (
            <div className="space-y-8 font-aptos">
              {/* Header Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="font-serif text-4xl font-bold text-white">ADMINISTRATION CENTRALISÉE</h2>
                  <p className="text-sm text-gy-textMuted mt-1">Gestion des comptes utilisateurs autorisés, privilèges d&apos;accès et postes de dépenses</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleResetPlatform}
                    className="px-5 py-3.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 font-black text-xs uppercase tracking-wider hover:bg-rose-500 hover:text-white transition-all cursor-pointer shadow-lg"
                  >
                    [ RÉINITIALISER LA PLATEFORME À ZÉRO ]
                  </button>
                  {adminSubTab === "comptes" ? (
                    <button
                      onClick={() => setNewAdminModal(true)}
                      className="px-6 py-3.5 rounded-2xl bg-gold-gradient text-black font-black text-xs uppercase tracking-wider shadow-gold hover:opacity-95 transition-all cursor-pointer"
                    >
                      + CRÉER UN COMPTE ADMIN
                    </button>
                  ) : (
                    <button
                      onClick={() => setNewExpenseCategoryModal(true)}
                      className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-600 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:opacity-95 transition-all cursor-pointer"
                    >
                      + NOUVELLE LIGNE DE DÉPENSE
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-Tab Navigation Header */}
              <div className="flex border-b-2 border-[#2A2A38] space-x-3">
                <button
                  onClick={() => setAdminSubTab("comptes")}
                  className={`py-3.5 px-6 font-black text-xs uppercase tracking-wider rounded-t-2xl transition-all border-t-2 border-x-2 ${
                    adminSubTab === "comptes"
                      ? "bg-[#141419] border-[#D4AF37] text-[#F3E5AB] shadow-md"
                      : "bg-[#0E0E12] border-transparent text-[#A3A3B3] hover:text-white"
                  }`}
                >
                  COMPTES UTILISATEURS ({adminUsersList.length})
                </button>

                <button
                  onClick={() => setAdminSubTab("lignes")}
                  className={`py-3.5 px-6 font-black text-xs uppercase tracking-wider rounded-t-2xl transition-all border-t-2 border-x-2 ${
                    adminSubTab === "lignes"
                      ? "bg-[#141419] border-[#D4AF37] text-[#F3E5AB] shadow-md"
                      : "bg-[#0E0E12] border-transparent text-[#A3A3B3] hover:text-white"
                  }`}
                >
                  LIGNES DE DÉPENSES ({expenseCategories.length})
                </button>
              </div>

              {/* SUB-TAB 1: COMPTES UTILISATEURS */}
              {adminSubTab === "comptes" && (
                <div className="space-y-6">
                  <div className="framed-card p-8 space-y-6">
                    <div className="flex justify-between items-center border-b border-gy-border pb-4">
                      <div>
                        <h3 className="font-serif text-2xl font-bold text-white">
                          COMPTES AUTORISÉS AU PORTAIL MAISON GY
                        </h3>
                        <p className="text-xs text-gy-textMuted mt-0.5">Identifiants d&apos;accès et privilèges attribués à l&apos;équipe administrative</p>
                      </div>
                      <span className="px-3 py-1 bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 rounded-xl text-xs font-black uppercase">
                        {adminUsersList.length} ACTIFS
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="framed-table text-left text-sm text-gy-text font-aptos">
                        <thead>
                          <tr>
                            <th className="min-w-[180px]">UTILISATEUR</th>
                            <th className="min-w-[200px]">EMAIL DE CONNEXION</th>
                            <th className="min-w-[180px]">RÔLE / PRIVILÈGES</th>
                            <th className="min-w-[130px]">DATE CRÉATION</th>
                            <th className="min-w-[100px]">STATUT</th>
                            <th className="min-w-[120px] text-center">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminUsersList.map((usr, idx) => (
                            <tr key={usr.id || idx}>
                              <td className="font-bold text-white text-base">{usr.fullName}</td>
                              <td className="text-gy-gold font-semibold">{usr.email}</td>
                              <td>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                                  usr.role === "SUPER_ADMIN"
                                    ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                                    : "bg-purple-500/20 text-purple-400 border-purple-500/40"
                                }`}>
                                  {usr.roleLabel || (usr.role === "SUPER_ADMIN" ? "SUPER ADMIN (DIRECTION)" : "ASSISTANTE (ADMINISTRATION)")}
                                </span>
                              </td>
                              <td className="text-gy-textMuted text-xs">{usr.createdAt || "01/01/2024"}</td>
                              <td>
                                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-black uppercase">
                                  {usr.status || "ACTIF"}
                                </span>
                              </td>
                              <td className="text-center">
                                <button
                                  onClick={() => alert(`Informations du compte ${usr.fullName}:\nEmail: ${usr.email}\nRôle ERP: ${usr.roleLabel || usr.role}`)}
                                  className="px-3 py-1.5 bg-[#181820] border border-[#2A2A38] text-white hover:border-[#D4AF37] hover:text-[#D4AF37] rounded-xl text-xs font-bold transition-all cursor-pointer"
                                >
                                  DÉTAILS
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB 2: LIGNES DE DÉPENSES */}
              {adminSubTab === "lignes" && (
                <div className="space-y-6">
                  <div className="framed-card p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gy-border pb-4 gap-4">
                      <div>
                        <h3 className="font-serif text-2xl font-bold text-white">
                          POSTES BUDGÉTAIRES DE DÉPENSES MAISON GY
                        </h3>
                        <p className="text-xs text-gy-textMuted mt-0.5">Ces lignes apparaissent automatiquement dans le formulaire de saisie des dépenses</p>
                      </div>
                      <button
                        onClick={() => setNewExpenseCategoryModal(true)}
                        className="px-5 py-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 font-black text-xs uppercase hover:bg-rose-500 hover:text-white transition-all cursor-pointer shrink-0"
                      >
                        + CRÉER UNE LIGNE DE DÉPENSE
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="framed-table text-left text-sm text-gy-text font-aptos">
                        <thead>
                          <tr>
                            <th className="min-w-[120px]">CODE</th>
                            <th className="min-w-[280px]">INTITULÉ DU POSTE DE DÉPENSE</th>
                            <th className="min-w-[240px]">DESCRIPTION / DÉTAILS</th>
                            <th className="min-w-[100px]">STATUT</th>
                            <th className="min-w-[120px] text-center">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expenseCategories.map((cat) => (
                            <tr key={cat.id}>
                              <td className="font-bold text-gy-gold">
                                <span className="framed-badge-gold text-xs font-black">{cat.code}</span>
                              </td>
                              <td className="font-bold text-white text-base">{cat.label}</td>
                              <td className="text-gy-textMuted text-xs">{cat.description || "—"}</td>
                              <td>
                                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 rounded-lg">
                                  ACTIF
                                </span>
                              </td>
                              <td className="text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  <button
                                    onClick={() => handleOpenEditExpenseCategory(cat)}
                                    className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black border border-amber-500/40 text-xs font-black flex items-center justify-center transition-all cursor-pointer shadow-sm"
                                    title="Modifier le poste"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleDeleteExpenseCategory(cat)}
                                    className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/40 text-xs font-black flex items-center justify-center transition-all cursor-pointer shadow-sm"
                                    title="Supprimer le poste"
                                  >
                                    🗑️
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
            </div>
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* 0. MODAL: NOUVEAU MEMBRE DU PERSONNEL RH                   */}
      {/* ========================================================= */}
      {newEmployeeModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel max-w-lg w-full p-8 rounded-3xl border border-[#D4AF37]/50 shadow-2xl font-aptos my-8">
            <div className="flex justify-between items-center mb-6 border-b border-gy-border pb-4">
              <h3 className="font-serif text-2xl font-bold text-white">AJOUTER UN MEMBRE DU PERSONNEL</h3>
              <button onClick={() => setNewEmployeeModal(false)} className="text-gy-textMuted hover:text-white px-3 py-1 bg-gy-dark border border-gy-border rounded-lg text-xs font-bold">
                [ FERMER ]
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Prénom *</label>
                  <input
                    type="text"
                    value={empFirstName}
                    onChange={(e) => setEmpFirstName(e.target.value)}
                    placeholder="ex: Bernice"
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:border-[#D4AF37] focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Nom *</label>
                  <input
                    type="text"
                    value={empLastName}
                    onChange={(e) => setEmpLastName(e.target.value)}
                    placeholder="ex: HOUNNOU"
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:border-[#D4AF37] focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Poste / Rôle Officiel *</label>
                  <select
                    value={empRole}
                    onChange={(e) => {
                      setEmpRole(e.target.value);
                      if (e.target.value === "Directrice Générale") setEmpDepartment("Direction Générale");
                      else if (e.target.value === "Assistante") setEmpDepartment("Administration & Accueil");
                      else if (e.target.value === "Tailleur") setEmpDepartment("Atelier Confection & Coupe");
                      else if (e.target.value === "Agent d'entretien") setEmpDepartment("Entretien Atelier & Showroom");
                      else if (e.target.value === "Agent de liaison") setEmpDepartment("Logistique & Livraisons VIP");
                    }}
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white font-bold focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="Directrice Générale">Directrice Générale</option>
                    <option value="Assistante">Assistante</option>
                    <option value="Tailleur">Tailleur / Couturier</option>
                    <option value="Agent d'entretien">Agent d'entretien</option>
                    <option value="Agent de liaison">Agent de liaison</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Département *</label>
                  <input
                    type="text"
                    value={empDepartment}
                    onChange={(e) => setEmpDepartment(e.target.value)}
                    placeholder="ex: Atelier Confection"
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:border-[#D4AF37] focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Téléphone</label>
                  <input
                    type="text"
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    placeholder="+229 97 00 00 00"
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Email</label>
                  <input
                    type="email"
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    placeholder="employe@mygy.com"
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Type de Contrat</label>
                  <select
                    value={empContractType}
                    onChange={(e) => setEmpContractType(e.target.value)}
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white font-bold focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Prestataire">Prestataire</option>
                    <option value="Stagiaire">Stagiaire</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Salaire Mensuel (FCFA) *</label>
                  <input
                    type="number"
                    value={empSalary}
                    onChange={(e) => setEmpSalary(Number(e.target.value))}
                    placeholder="150000"
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-emerald-400 font-bold text-base focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setNewEmployeeModal(false)}
                  className="w-1/2 py-3.5 rounded-xl bg-gy-dark border border-gy-border text-gy-text font-black text-xs uppercase"
                >
                  ANNULER
                </button>
                <button
                  onClick={handleCreateEmployee}
                  className="w-1/2 py-3.5 rounded-xl bg-gold-gradient text-black font-black text-xs uppercase shadow-gold hover:opacity-95"
                >
                  ENREGISTRER EMPLOYÉ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: MODIFIER UN MEMBRE DU PERSONNEL                     */}
      {/* ========================================================= */}
      {editEmployeeModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel max-w-lg w-full p-8 rounded-3xl border border-[#D4AF37]/50 shadow-2xl font-aptos my-8">
            <div className="flex justify-between items-center mb-6 border-b border-gy-border pb-4">
              <h3 className="font-serif text-2xl font-bold text-white">MODIFIER LES INFORMATIONS DU PERSONNEL</h3>
              <button onClick={() => setEditEmployeeModal(false)} className="text-gy-textMuted hover:text-white px-3 py-1 bg-gy-dark border border-gy-border rounded-lg text-xs font-bold">
                [ FERMER ]
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Prénom *</label>
                  <input
                    type="text"
                    value={empFirstName}
                    onChange={(e) => setEmpFirstName(e.target.value)}
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:border-[#D4AF37] focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Nom *</label>
                  <input
                    type="text"
                    value={empLastName}
                    onChange={(e) => setEmpLastName(e.target.value)}
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:border-[#D4AF37] focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Poste / Rôle Officiel *</label>
                  <select
                    value={empRole}
                    onChange={(e) => {
                      setEmpRole(e.target.value);
                      if (e.target.value === "Directrice Générale") setEmpDepartment("Direction Générale");
                      else if (e.target.value === "Assistante") setEmpDepartment("Administration & Accueil");
                      else if (e.target.value === "Tailleur") setEmpDepartment("Atelier Confection & Coupe");
                      else if (e.target.value === "Agent d'entretien") setEmpDepartment("Entretien Atelier & Showroom");
                      else if (e.target.value === "Agent de liaison") setEmpDepartment("Logistique & Livraisons VIP");
                    }}
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white font-bold focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="Directrice Générale">Directrice Générale</option>
                    <option value="Assistante">Assistante</option>
                    <option value="Tailleur">Tailleur / Couturier</option>
                    <option value="Agent d'entretien">Agent d'entretien</option>
                    <option value="Agent de liaison">Agent de liaison</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Département *</label>
                  <input
                    type="text"
                    value={empDepartment}
                    onChange={(e) => setEmpDepartment(e.target.value)}
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:border-[#D4AF37] focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Téléphone</label>
                  <input
                    type="text"
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Email</label>
                  <input
                    type="email"
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Type de Contrat</label>
                  <select
                    value={empContractType}
                    onChange={(e) => setEmpContractType(e.target.value)}
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white font-bold focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Prestataire">Prestataire</option>
                    <option value="Stagiaire">Stagiaire</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Salaire Mensuel (FCFA) *</label>
                  <input
                    type="number"
                    value={empSalary}
                    onChange={(e) => setEmpSalary(Number(e.target.value))}
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-emerald-400 font-bold text-base focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setEditEmployeeModal(false)}
                  className="w-1/2 py-3.5 rounded-xl bg-gy-dark border border-gy-border text-gy-text font-black text-xs uppercase"
                >
                  ANNULER
                </button>
                <button
                  onClick={handleSaveEditEmployee}
                  className="w-1/2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs uppercase shadow-lg hover:opacity-95"
                >
                  ENREGISTRER MODIFICATIONS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:border-[#D4AF37] focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Nom *</label>
                  <input
                    type="text"
                    value={newCustLastName}
                    onChange={(e) => setNewCustLastName(e.target.value)}
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
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:border-[#D4AF37] focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Ville</label>
                  <input
                    type="text"
                    value={newCustCity}
                    onChange={(e) => setNewCustCity(e.target.value)}
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

              {/* Dynamic Tenues / Outfits List */}
              <div className="space-y-3 p-4 bg-[#14141a] rounded-2xl border border-gy-border">
                <div className="flex justify-between items-center">
                  <label className="block text-[#D4AF37] font-bold text-xs uppercase tracking-wider">
                    TENUES & ARTICLES DE LA COMMANDE ({newOrderItemsList.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItemToOrder}
                    className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-black uppercase hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
                  >
                    + AJOUTER UNE TENUE
                  </button>
                </div>

                {newOrderItemsList.map((item, idx) => (
                  <div key={item.id} className="p-3 bg-[#181820] border border-[#2A2A38] rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gy-textMuted">Tenue N° {idx + 1}</span>
                      {newOrderItemsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemFromOrder(item.id)}
                          className="text-rose-400 text-xs font-bold hover:underline"
                        >
                          [ SUPPRIMER ]
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-gy-textMuted mb-1 font-semibold text-[11px]">Nom de la Tenue *</label>
                        <input
                          type="text"
                          value={item.itemName}
                          onChange={(e) => {
                            handleItemChange(item.id, "itemName", e.target.value);
                            if (idx === 0) setNewOrderItemName(e.target.value);
                          }}
                          className="w-full bg-gy-dark border border-gy-border rounded-lg p-2 text-white font-bold text-xs focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gy-textMuted mb-1 font-semibold text-[11px]">Prix de cette Tenue (FCFA)</label>
                        <input
                          type="number"
                          value={item.price || ""}
                          onChange={(e) => handleItemChange(item.id, "price", e.target.value === "" ? "" : Number(e.target.value))}
                          className="w-full bg-gy-dark border border-gy-border rounded-lg p-2 text-emerald-400 font-bold text-xs focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gy-textMuted mb-1 font-semibold text-[11px]">Détails & Tissu Spécifique</label>
                      <input
                        type="text"
                        value={item.fabricDetails}
                        onChange={(e) => handleItemChange(item.id, "fabricDetails", e.target.value)}
                        className="w-full bg-gy-dark border border-gy-border rounded-lg p-2 text-gy-textMuted text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
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
                  className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Montant Total de la Commande (FCFA) *</label>
                <input
                  type="number"
                  value={newOrderTotalAmount || ""}
                  onChange={(e) => setNewOrderTotalAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-emerald-400 font-bold text-base focus:border-[#D4AF37] focus:outline-none"
                />
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
      {/* MODAL: MODIFIER LA COMMANDE                               */}
      {/* ========================================================= */}
      {editOrderModal && editOrderObj && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel max-w-xl w-full p-8 rounded-3xl border border-amber-500/50 shadow-2xl font-aptos my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b border-gy-border pb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-white">MODIFIER LA COMMANDE</h3>
                <p className="text-xs text-amber-400 font-bold tracking-widest uppercase mt-1">
                  RÉF : {editOrderObj.reference}
                </p>
              </div>
              <button
                onClick={() => setEditOrderModal(false)}
                className="text-gy-textMuted hover:text-white px-3 py-1 bg-gy-dark border border-gy-border rounded-lg text-xs font-bold"
              >
                [ FERMER ]
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Statut de la Commande</label>
                  <select
                    value={editOrderStatus}
                    onChange={(e) => setEditOrderStatus(e.target.value)}
                    className="w-full bg-gy-dark border border-gy-gold/50 rounded-xl p-3 text-gy-gold font-bold focus:outline-none"
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
                </div>
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Priorité</label>
                  <select
                    value={editOrderPriority}
                    onChange={(e) => setEditOrderPriority(e.target.value)}
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white font-bold focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="STANDARD">STANDARD</option>
                    <option value="HAUTE">HAUTE</option>
                    <option value="URGENTE">URGENTE</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Tenues List for Edit */}
              <div className="space-y-3 p-4 bg-[#14141a] rounded-2xl border border-gy-border">
                <div className="flex justify-between items-center">
                  <label className="block text-[#D4AF37] font-bold text-xs uppercase tracking-wider">
                    TENUES & ARTICLES ({editOrderItemsList.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleEditAddItem}
                    className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-black uppercase hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
                  >
                    + AJOUTER UNE TENUE
                  </button>
                </div>

                {editOrderItemsList.map((item, idx) => (
                  <div key={item.id || idx} className="p-3 bg-[#181820] border border-[#2A2A38] rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gy-textMuted">Tenue N° {idx + 1}</span>
                      {editOrderItemsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleEditRemoveItem(item.id)}
                          className="text-rose-400 text-xs font-bold hover:underline"
                        >
                          [ SUPPRIMER ]
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-gy-textMuted mb-1 font-semibold text-[11px]">Nom de la Tenue *</label>
                        <input
                          type="text"
                          value={item.itemName}
                          onChange={(e) => handleEditItemChange(item.id, "itemName", e.target.value)}
                          className="w-full bg-gy-dark border border-gy-border rounded-lg p-2 text-white font-bold text-xs focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gy-textMuted mb-1 font-semibold text-[11px]">Prix de cette Tenue (FCFA)</label>
                        <input
                          type="number"
                          value={item.price || ""}
                          onChange={(e) => handleEditItemChange(item.id, "price", e.target.value === "" ? "" : Number(e.target.value))}
                          className="w-full bg-gy-dark border border-gy-border rounded-lg p-2 text-emerald-400 font-bold text-xs focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gy-textMuted mb-1 font-semibold text-[11px]">Détails & Tissu Spécifique</label>
                      <input
                        type="text"
                        value={item.fabricDetails}
                        onChange={(e) => handleEditItemChange(item.id, "fabricDetails", e.target.value)}
                        className="w-full bg-gy-dark border border-gy-border rounded-lg p-2 text-gy-textMuted text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[#D4AF37] mb-1 font-bold text-xs">Date de Retrait Souhaité *</label>
                <input
                  type="date"
                  value={editOrderPromisedDate}
                  onChange={(e) => setEditOrderPromisedDate(e.target.value)}
                  className="w-full bg-gy-dark border border-[#D4AF37] rounded-xl p-3 text-[#D4AF37] font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Informations sur le Tissu Voulu</label>
                <textarea
                  value={editOrderFabricDetails}
                  onChange={(e) => setEditOrderFabricDetails(e.target.value)}
                  rows={2}
                  className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Montant Total de la Commande (FCFA) *</label>
                <input
                  type="number"
                  value={editOrderTotalAmount || ""}
                  onChange={(e) => setEditOrderTotalAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-emerald-400 font-bold text-base focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setEditOrderModal(false)}
                  className="w-1/2 py-3.5 rounded-xl bg-gy-dark border border-gy-border text-gy-text font-black text-xs uppercase"
                >
                  ANNULER
                </button>
                <button
                  onClick={handleSaveEditedOrder}
                  className="w-1/2 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase shadow-lg transition-all"
                >
                  ENREGISTRER MODIFICATIONS
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

      {/* SUCCESS PAYMENT NOTIFICATION MODAL */}
      {successReceiptModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#121217] border-2 border-emerald-500/80 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-[0_0_60px_rgba(16,185,129,0.5)] font-aptos">
            <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-400 rounded-full flex items-center justify-center mx-auto text-emerald-400 font-black text-3xl shadow-[0_0_20px_rgba(16,185,129,0.8)]">
              ✓
            </div>
            <div>
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block">CONFIRMATION OFFICIELLE</span>
              <h3 className="font-serif text-2xl font-bold text-white mt-1">PAIEMENT ENREGISTRÉ AVEC SUCCÈS !</h3>
              <p className="text-xs text-gy-textMuted mt-2">
                Le reçu N° <strong className="text-emerald-400">{successReceiptModal.receiptNumber}</strong> de <strong className="text-[#D4AF37]">{formatFcfa(successReceiptModal.amount)}</strong> a été généré et classé dans les paiements.
              </p>
            </div>
            <div className="p-4 bg-[#181820] border border-[#2A2A38] rounded-2xl text-left space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gy-textMuted font-bold">Client :</span>
                <span className="text-white font-black">{successReceiptModal.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gy-textMuted font-bold">N° Commande :</span>
                <span className="text-[#D4AF37] font-black">{successReceiptModal.orderRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gy-textMuted font-bold">Montant Encaissé :</span>
                <span className="text-emerald-400 font-black text-sm">{formatFcfa(successReceiptModal.amount)}</span>
              </div>
              <div className="flex justify-between border-t border-[#2A2A38] pt-2">
                <span className="text-gy-textMuted font-bold">Nouveau Solde Restant :</span>
                <span className="text-amber-400 font-black text-sm">{formatFcfa(successReceiptModal.balanceDue)}</span>
              </div>
            </div>
            <button
              onClick={() => {
                setSuccessReceiptModal(null);
                setActiveMenu("finances");
                setFinanceSubTab("recettes");
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all cursor-pointer"
            >
              VOIR DANS LES PAIEMENTS & REÇUS →
            </button>
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
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.label}>
                      {c.label}
                    </option>
                  ))}
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

      {/* MODAL CRÉER LIGNE DE DÉPENSE */}
      {newExpenseCategoryModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 font-aptos">
          <div className="glass-panel max-w-lg w-full p-8 rounded-3xl border border-rose-500/50 shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-gy-border pb-4">
              <h3 className="font-serif text-2xl font-bold text-white">CRÉER UNE LIGNE DE DÉPENSE</h3>
              <button onClick={() => setNewExpenseCategoryModal(false)} className="text-gy-textMuted hover:text-white px-3 py-1 bg-gy-dark border border-gy-border rounded-lg text-xs font-bold">
                [ FERMER ]
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Libellé / Intitulé de la Ligne *</label>
                <input
                  type="text"
                  value={newExpCatLabel}
                  onChange={(e) => setNewExpCatLabel(e.target.value)}
                  placeholder="ex: FRAIS DE TRANSIT & DOUANE"
                  className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white font-bold focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Code Ligne (Optionnel)</label>
                <input
                  type="text"
                  value={newExpCatCode}
                  onChange={(e) => setNewExpCatCode(e.target.value)}
                  placeholder="ex: LIGNE-008"
                  className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white font-bold focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Description & Usage</label>
                <textarea
                  value={newExpCatDesc}
                  onChange={(e) => setNewExpCatDesc(e.target.value)}
                  placeholder="ex: Postes de charges liées au dédouanement des tissus VIP"
                  rows={3}
                  className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white font-bold focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setNewExpenseCategoryModal(false)}
                  className="w-1/2 py-3.5 rounded-xl bg-gy-dark border border-gy-border text-gy-text font-black text-xs uppercase"
                >
                  ANNULER
                </button>
                <button
                  onClick={handleCreateExpenseCategory}
                  className="w-1/2 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-600 text-white font-black text-xs uppercase shadow-lg hover:opacity-95"
                >
                  ENREGISTRER LIGNE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MODIFIER LIGNE DE DÉPENSE */}
      {editExpenseCategoryModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 font-aptos">
          <div className="glass-panel max-w-lg w-full p-8 rounded-3xl border border-rose-500/50 shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-gy-border pb-4">
              <h3 className="font-serif text-2xl font-bold text-white">MODIFIER LA LIGNE DE DÉPENSE</h3>
              <button onClick={() => setEditExpenseCategoryModal(false)} className="text-gy-textMuted hover:text-white px-3 py-1 bg-gy-dark border border-gy-border rounded-lg text-xs font-bold">
                [ FERMER ]
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Libellé / Intitulé de la Ligne *</label>
                <input
                  type="text"
                  value={newExpCatLabel}
                  onChange={(e) => setNewExpCatLabel(e.target.value)}
                  placeholder="ex: FRAIS DE TRANSIT & DOUANE"
                  className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white font-bold focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Code Ligne (Optionnel)</label>
                <input
                  type="text"
                  value={newExpCatCode}
                  onChange={(e) => setNewExpCatCode(e.target.value)}
                  placeholder="ex: LIGNE-008"
                  className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white font-bold focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Description & Usage</label>
                <textarea
                  value={newExpCatDesc}
                  onChange={(e) => setNewExpCatDesc(e.target.value)}
                  placeholder="ex: Postes de charges liées au dédouanement des tissus VIP"
                  rows={3}
                  className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white font-bold focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setEditExpenseCategoryModal(false)}
                  className="w-1/2 py-3.5 rounded-xl bg-gy-dark border border-gy-border text-gy-text font-black text-xs uppercase"
                >
                  ANNULER
                </button>
                <button
                  onClick={handleSaveEditExpenseCategory}
                  className="w-1/2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs uppercase shadow-lg hover:opacity-95"
                >
                  ENREGISTRER MODIFICATIONS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW ORDER MODAL */}
      {viewOrderModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel max-w-2xl w-full p-8 rounded-3xl border border-gy-gold/50 shadow-2xl font-aptos my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gy-border pb-4">
              <div>
                <span className="text-xs font-bold text-gy-gold uppercase tracking-wider">{viewOrderModal.reference}</span>
                <h3 className="font-serif text-3xl font-bold text-white mt-1">
                  {viewOrderModal.items?.[0]?.itemName || "Commande Sur-Mesure"}
                </h3>
                <p className="text-sm text-gy-textMuted mt-1">
                  Client : <strong className="text-white">{viewOrderModal.customer?.firstName} {viewOrderModal.customer?.lastName}</strong> ({viewOrderModal.customer?.phone})
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setOrderImagesModal(viewOrderModal); setViewOrderModal(null); }}
                  className="px-3 py-1.5 bg-violet-500/20 text-violet-300 border border-violet-500/40 rounded-lg text-xs font-black hover:bg-violet-500 hover:text-white transition-all"
                >
                  PHOTOS
                </button>
                <button onClick={() => setViewOrderModal(null)} className="text-gy-textMuted hover:text-white px-3 py-1 bg-gy-dark border border-gy-border rounded-lg text-xs font-bold">
                  [ FERMER ]
                </button>
              </div>
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
                  {viewOrderModal.items?.[0]?.fabricDetails || "Tissu fourni par la cliente."}
                </div>
              </div>

              {/* Image gallery preview */}
              {((viewOrderModal.images && viewOrderModal.images.length > 0) || viewOrderModal.deliveryImage) && (
                <div>
                  <h4 className="font-serif text-lg font-bold text-white mb-3">Photos de la Commande</h4>
                  <div className="flex flex-wrap gap-3">
                    {(viewOrderModal.images || []).map((img: string, idx: number) => (
                      <img key={idx} src={img} alt={`Tissu ${idx + 1}`} className="w-24 h-24 object-cover rounded-xl border border-gy-border" />
                    ))}
                    {viewOrderModal.deliveryImage && (
                      <div className="relative">
                        <img src={viewOrderModal.deliveryImage} alt="Produit fini" className="w-24 h-24 object-cover rounded-xl border-2 border-gy-gold" />
                        <span className="absolute -top-2 -right-2 bg-gy-gold text-black text-xs font-black px-1 rounded">FINI</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-gy-gold/20 text-gy-gold text-xs font-black">
                  {viewCustomerModal.category || "VIP Standard"}
                </span>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <button onClick={() => setViewCustomerModal(null)} className="text-gy-textMuted hover:text-white px-3 py-1 bg-gy-dark border border-gy-border rounded-lg text-xs font-bold">
                  [ FERMER ]
                </button>
                <button
                  onClick={() => {
                    setClientAccountModal(viewCustomerModal);
                    setClientAccountEmail(viewCustomerModal.email || "");
                    setClientAccountCredentials(null);
                    setViewCustomerModal(null);
                  }}
                  className="px-3 py-1.5 bg-violet-500/20 text-violet-300 border border-violet-500/40 rounded-lg text-xs font-black hover:bg-violet-500 hover:text-white transition-all"
                >
                  CRÉER ACCÈS CLIENT
                </button>
              </div>
            </div>

            <div className="space-y-6 pt-6 text-sm">
              {/* Informations Client & Coordonnées */}
              <div className="bg-gy-dark p-5 rounded-2xl border border-gy-border space-y-3">
                <h4 className="text-xs font-black text-gy-gold uppercase tracking-wider">Coordonnées & Informations</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="text-xs text-gy-textMuted block">Téléphone</span>
                    <strong className="text-white text-sm">{viewCustomerModal.phone || "Non renseigné"}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-gy-textMuted block">Ville</span>
                    <strong className="text-white text-sm">{viewCustomerModal.city || "Cotonou"}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-gy-textMuted block">Profession</span>
                    <strong className="text-white text-sm">{viewCustomerModal.profession || "Client Privé"}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-gy-textMuted block">Email</span>
                    <strong className="text-white text-sm">{viewCustomerModal.email || "Non renseigné"}</strong>
                  </div>
                </div>
                {viewCustomerModal.notes && (
                  <div className="pt-2 border-t border-gy-border/40 text-xs text-gy-textMuted">
                    <span className="font-bold text-white">Notes : </span>{viewCustomerModal.notes}
                  </div>
                )}
              </div>
              <div>
                {(() => {
                  const custOrders = orders.filter(
                    (o) => o.customerId === viewCustomerModal.id || o.customerId === viewCustomerModal.code || o.customer?.id === viewCustomerModal.id || o.customer?.code === viewCustomerModal.code
                  );
                  const displayOrders = custOrders.length > 0 ? custOrders : (viewCustomerModal.orders || []);
                  return (
                    <>
                      <h4 className="font-serif text-xl font-bold text-white mb-3">
                        HISTORIQUE & COMMANDES EN COURS ({displayOrders.length})
                      </h4>
                      {displayOrders.length > 0 ? (
                        <div className="space-y-3">
                          {displayOrders.map((o: any) => (
                            <div key={o.id} className="bg-gy-dark p-5 rounded-2xl border border-gy-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <div>
                                <span className="font-bold text-white text-base">{o.reference}</span>
                                <div className="text-xs text-gy-gold font-bold mt-1">Statut Atelier: {o.status}</div>
                              </div>
                              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                <div className="text-right">
                                  <div className="text-base font-bold text-emerald-400">{formatFcfa(o.totalAmount)}</div>
                                  <div className="text-xs text-amber-400 font-bold mt-0.5">Solde: {formatFcfa(o.balanceDue)}</div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => { setViewOrderModal(o); setViewCustomerModal(null); }}
                                    className="px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-white border border-sky-500/40 text-xs font-black uppercase"
                                  >
                                    FICHE
                                  </button>
                                  <button
                                    onClick={() => { setOrderImagesModal(o); setViewCustomerModal(null); }}
                                    className="px-3 py-1.5 rounded-xl bg-violet-500/20 text-violet-300 hover:bg-violet-500 hover:text-white border border-violet-500/40 text-xs font-black uppercase"
                                  >
                                    PHOTOS
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gy-textMuted bg-gy-dark p-4 rounded-xl border border-gy-border italic">
                          Aucune commande enregistrée.
                        </div>
                      )}
                    </>
                  );
                })()}
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

      {/* ================================================================= */}
      {/* MODAL: CRÉER ACCÈS CLIENT                                         */}
      {/* ================================================================= */}
      {clientAccountModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-8 rounded-3xl border border-violet-500/50 shadow-2xl font-aptos">
            <div className="flex justify-between items-center mb-6 border-b border-gy-border pb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-white">ACCÈS ESPACE CLIENT</h3>
                <p className="text-xs text-violet-400 font-bold mt-1">{clientAccountModal.firstName} {clientAccountModal.lastName}</p>
              </div>
              <button onClick={() => { setClientAccountModal(null); setClientAccountCredentials(null); }} className="text-gy-textMuted hover:text-white px-3 py-1 bg-gy-dark border border-gy-border rounded-lg text-xs font-bold">[ FERMER ]</button>
            </div>

            {!clientAccountCredentials ? (
              <div className="space-y-4">
                <p className="text-sm text-gy-textMuted">Créer un compte pour que cette cliente puisse accéder à son espace en ligne et suivre ses commandes.</p>
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Email de connexion *</label>
                  <input
                    type="email"
                    value={clientAccountEmail}
                    onChange={(e) => setClientAccountEmail(e.target.value)}
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button onClick={() => { setClientAccountModal(null); }} className="w-1/2 py-3 rounded-xl bg-gy-dark border border-gy-border text-gy-text font-black text-xs uppercase">ANNULER</button>
                  <button
                    onClick={handleCreateClientAccount}
                    disabled={clientAccountLoading}
                    className="w-1/2 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black text-xs uppercase shadow-lg transition-all disabled:opacity-50"
                  >
                    {clientAccountLoading ? "CRÉATION..." : "CRÉER LE COMPTE"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl">
                  <p className="text-emerald-400 font-black text-sm mb-3">COMPTE CRÉÉ AVEC SUCCÈS</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gy-textMuted">Email :</span>
                      <span className="font-bold text-white">{clientAccountCredentials.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gy-textMuted">Mot de passe temporaire :</span>
                      <span className="font-black text-gy-gold text-lg tracking-widest">{clientAccountCredentials.tempPassword}</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-400">
                  Note : Transmettez ces identifiants par WhatsApp ou email à la cliente. Elle pourra changer son mot de passe depuis son espace.
                </div>
                <button
                  onClick={() => {
                    const text = `Bonjour ${clientAccountCredentials.fullName},\n\nVoici vos accès à votre espace client GY Maison Couture :\n\n🌐 Lien : ${window.location.origin}/client\n📧 Email : ${clientAccountCredentials.email}\n🔑 Mot de passe : ${clientAccountCredentials.tempPassword}\n\nMerci de changer votre mot de passe lors de votre première connexion.`;
                    navigator.clipboard.writeText(text).then(() => alert("Message copié dans le presse-papiers !"));
                  }}
                  className="w-full py-3 rounded-xl bg-gy-gold/20 text-gy-gold border border-gy-gold/40 font-black text-xs uppercase hover:bg-gy-gold hover:text-black transition-all"
                >
                  COPIER LE MESSAGE À ENVOYER
                </button>
                <button onClick={() => { setClientAccountModal(null); setClientAccountCredentials(null); }} className="w-full py-2 rounded-xl bg-gy-dark border border-gy-border text-gy-textMuted font-black text-xs uppercase">FERMER</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: GALERIE D'IMAGES DE LA COMMANDE                            */}
      {/* ================================================================= */}
      {orderImagesModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel max-w-2xl w-full p-8 rounded-3xl border border-violet-500/50 shadow-2xl font-aptos my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b border-gy-border pb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-white">PHOTOS — COMMANDE</h3>
                <p className="text-xs text-violet-400 font-bold mt-1">{orderImagesModal.reference}</p>
              </div>
              <button onClick={() => setOrderImagesModal(null)} className="text-gy-textMuted hover:text-white px-3 py-1 bg-gy-dark border border-gy-border rounded-lg text-xs font-bold">[ FERMER ]</button>
            </div>

            <div className="space-y-6 text-sm">
              {/* Fabric images */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-white">Photos des Tissus ({(orderImagesModal.images || []).length})</h4>
                  <label className={`px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black uppercase cursor-pointer hover:bg-emerald-500 hover:text-black transition-all ${uploadingImage ? "opacity-50 pointer-events-none" : ""}`}>
                    {uploadingImage ? "CHARGEMENT..." : "+ AJOUTER TISSU"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleUploadOrderImage(e.target.files[0], "fabric"); }} />
                  </label>
                </div>
                <div className="flex flex-wrap gap-3">
                  {(orderImagesModal.images || []).map((img: string, idx: number) => (
                    <div key={idx} className="relative group">
                      <img src={img} alt={`Tissu ${idx + 1}`} className="w-32 h-32 object-cover rounded-xl border border-gy-border" />
                      <button
                        onClick={() => handleRemoveOrderImage(img)}
                        className="absolute top-1 right-1 bg-rose-600 text-white rounded-full w-5 h-5 text-xs font-black opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                      >✕</button>
                    </div>
                  ))}
                  {(!orderImagesModal.images || orderImagesModal.images.length === 0) && (
                    <p className="text-gy-textMuted italic text-xs">Aucune photo de tissu. Ajoutez-en avec le bouton ci-dessus.</p>
                  )}
                </div>
              </div>

              {/* Delivery / finished product image */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-white">Photo du Produit Fini (Livraison)</h4>
                  <label className={`px-4 py-2 rounded-xl bg-gy-gold/20 text-gy-gold border border-gy-gold/40 text-xs font-black uppercase cursor-pointer hover:bg-gy-gold hover:text-black transition-all ${uploadingImage ? "opacity-50 pointer-events-none" : ""}`}>
                    {uploadingImage ? "CHARGEMENT..." : (orderImagesModal.deliveryImage ? "CHANGER" : "+ PHOTO LIVRAISON")}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleUploadOrderImage(e.target.files[0], "delivery"); }} />
                  </label>
                </div>
                {orderImagesModal.deliveryImage ? (
                  <img src={orderImagesModal.deliveryImage} alt="Produit fini" className="w-48 h-48 object-cover rounded-2xl border-2 border-gy-gold shadow-gold" />
                ) : (
                  <p className="text-gy-textMuted italic text-xs">Aucune photo du produit fini. Ajoutez-la à la livraison.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: NOUVEL ARTICLE EN STOCK                                     */}
      {/* ================================================================= */}
      {newStockModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel max-w-lg w-full p-8 rounded-3xl border border-emerald-500/50 shadow-2xl font-aptos my-8">
            <div className="flex justify-between items-center mb-6 border-b border-gy-border pb-4">
              <h3 className="font-serif text-2xl font-bold text-white">NOUVEL ARTICLE EN STOCK</h3>
              <button onClick={() => setNewStockModal(false)} className="text-gy-textMuted hover:text-white px-3 py-1 bg-gy-dark border border-gy-border rounded-lg text-xs font-bold">[ FERMER ]</button>
            </div>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Catégorie</label>
                  <select value={stkCategory} onChange={(e) => setStkCategory(e.target.value)} className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white font-bold focus:outline-none">
                    <option value="TISSU">TISSU</option>
                    <option value="FIL">FIL</option>
                    <option value="AIGUILLE">AIGUILLE</option>
                    <option value="ACCESSOIRE">ACCESSOIRE</option>
                    <option value="EQUIPEMENT">ÉQUIPEMENT</option>
                    <option value="AUTRE">AUTRE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Type</label>
                  <select value={stkType} onChange={(e) => setStkType(e.target.value)} className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white font-bold focus:outline-none">
                    <option value="CONSOMMABLE">CONSOMMABLE</option>
                    <option value="EQUIPEMENT">ÉQUIPEMENT</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Nom de l&apos;article *</label>
                <input type="text" value={stkName} onChange={(e) => setStkName(e.target.value)} className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white font-bold focus:border-emerald-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Quantité initiale</label>
                  <input type="number" value={stkQuantity} onChange={(e) => setStkQuantity(e.target.value === "" ? "" : Number(e.target.value))} className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-emerald-400 font-bold focus:outline-none" />
                </div>
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Unité</label>
                  <select value={stkUnit} onChange={(e) => setStkUnit(e.target.value)} className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white font-bold focus:outline-none">
                    <option value="m">mètre (m)</option>
                    <option value="kg">kg</option>
                    <option value="pce">pièce</option>
                    <option value="bobine">bobine</option>
                    <option value="paquet">paquet</option>
                    <option value="unité">unité</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Seuil min.</label>
                  <input type="number" value={stkMinQty} onChange={(e) => setStkMinQty(e.target.value === "" ? "" : Number(e.target.value))} className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-amber-400 font-bold focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Fournisseur / Informations</label>
                <input type="text" value={stkSupplier} onChange={(e) => setStkSupplier(e.target.value)} className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:outline-none" />
              </div>
              <div className="flex space-x-3 pt-2">
                <button onClick={() => setNewStockModal(false)} className="w-1/2 py-3.5 rounded-xl bg-gy-dark border border-gy-border text-gy-text font-black text-xs uppercase">ANNULER</button>
                <button onClick={handleCreateStockItem} className="w-1/2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase shadow-lg transition-all">ENREGISTRER</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: MOUVEMENT DE STOCK                                          */}
      {/* ================================================================= */}
      {/* ================================================================= */}
      {/* MODAL: MOUVEMENT DE STOCK                                          */}
      {/* ================================================================= */}
      {stockMvtModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel max-w-lg w-full p-8 rounded-3xl border border-gy-gold/50 shadow-2xl font-aptos my-8">
            <div className="flex justify-between items-center mb-6 border-b border-gy-border pb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-white">ENREGISTRER UN MOUVEMENT</h3>
                <p className="text-xs text-gy-gold font-bold mt-1">
                  {stockMvtModal.name ? `${stockMvtModal.name} — Stock actuel : ${stockMvtModal.quantity} ${stockMvtModal.unit}` : "Sélectionnez un article"}
                </p>
              </div>
              <button onClick={() => setStockMvtModal(null)} className="text-gy-textMuted hover:text-white px-3 py-1 bg-gy-dark border border-gy-border rounded-lg text-xs font-bold">[ FERMER ]</button>
            </div>
            <div className="space-y-5 text-sm">
              <div>
                <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Article concerné *</label>
                <select
                  value={stockMvtModal?.id || ""}
                  onChange={(e) => {
                    const sel = stockList.find((s) => s.id === e.target.value);
                    if (sel) setStockMvtModal(sel);
                  }}
                  className="w-full bg-gy-dark border border-gy-gold/50 rounded-xl p-3 text-white font-bold text-sm focus:outline-none"
                >
                  {stockList.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.reference} — {item.name} ({item.category}) | Stock: {item.quantity} {item.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Type de mouvement</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["ENTREE", "SORTIE", "MISE_A_DISPO", "RETOUR"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setMvtType(t)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-black uppercase transition-all text-center ${
                        mvtType === t
                          ? t === "ENTREE" || t === "RETOUR"
                            ? "bg-emerald-500 text-black shadow-lg"
                            : t === "SORTIE"
                            ? "bg-rose-500 text-white shadow-lg"
                            : "bg-blue-500 text-white shadow-lg"
                          : "bg-gy-dark border border-gy-border text-gy-textMuted hover:border-gy-gold/50"
                      }`}
                    >
                      {t === "ENTREE" ? "ENTRÉE" : t === "SORTIE" ? "SORTIE" : t === "MISE_A_DISPO" ? "MISE À DISPO" : "RETOUR"}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gy-textMuted mt-1.5 italic">
                  {mvtType === "ENTREE" && "Ajoute de la quantité au stock (réception, achat fournisseur)."}
                  {mvtType === "SORTIE" && "Déduit de la quantité du stock (consommation commande, confection)."}
                  {mvtType === "MISE_A_DISPO" && "Trace la mise à disposition d'un équipement ou matériel sans le consommer."}
                  {mvtType === "RETOUR" && "Réintègre un article ou surplus dans le stock disponible."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Quantité ({stockMvtModal.unit || "unité"}) *</label>
                  <input
                    type="number"
                    value={mvtQty}
                    onChange={(e) => setMvtQty(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="0"
                    className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white font-black text-xl focus:border-gy-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Stock résultant</label>
                  <div className="p-3 bg-gy-dark/70 rounded-xl border border-gy-border/60 text-lg font-black">
                    {(() => {
                      const cur = Number(stockMvtModal.quantity || 0);
                      const q = Number(mvtQty || 0);
                      let res = cur;
                      if (mvtType === "ENTREE" || mvtType === "RETOUR") res = cur + q;
                      if (mvtType === "SORTIE") res = Math.max(0, cur - q);
                      return (
                        <span className={res <= Number(stockMvtModal.minQuantity || 0) ? "text-rose-400" : "text-emerald-400"}>
                          {res} {stockMvtModal.unit}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gy-textMuted mb-1 font-semibold text-xs">Motif / Justification</label>
                <input
                  type="text"
                  value={mvtReason}
                  onChange={(e) => setMvtReason(e.target.value)}
                  placeholder="ex: Confection commande ORD-2026-7158, Achat marché Dantokpa..."
                  className="w-full bg-gy-dark border border-gy-border rounded-xl p-3 text-white focus:border-gy-gold focus:outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button onClick={() => setStockMvtModal(null)} className="w-1/2 py-3.5 rounded-xl bg-gy-dark border border-gy-border text-gy-text font-black text-xs uppercase">
                  ANNULER
                </button>
                <button
                  onClick={handleStockMovement}
                  className="w-1/2 py-3.5 rounded-xl bg-gy-gold text-black font-black text-xs uppercase shadow-gold hover:opacity-90 transition-all"
                >
                  VALIDER LE MOUVEMENT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
