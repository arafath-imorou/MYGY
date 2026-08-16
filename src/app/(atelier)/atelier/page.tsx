"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AtelierPortal() {
  const [activeTab, setActiveTab] = useState<"tasks" | "qc" | "issues">("tasks");
  const [jobs, setJobs] = useState<any[]>([]);
  const [qrQuery, setQrQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Issue reporting modal
  const [issueModalJob, setIssueModalJob] = useState<any>(null);
  const [issueType, setIssueType] = useState("Tissu insuffisant");
  const [issueDesc, setIssueDesc] = useState("");

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/atelier/tasks");
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleScanQr = async () => {
    if (!qrQuery) return;
    try {
      const res = await fetch(`/api/atelier/tasks?qrCode=${encodeURIComponent(qrQuery)}`);
      if (res.ok) {
        const jobData = await res.json();
        setSelectedJob(jobData);
      } else {
        alert("QR Code non trouvé ! Ex: QR-JOB-001-COUPE");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleJobAction = async (jobId: string, action: "START" | "COMPLETE") => {
    try {
      const res = await fetch("/api/atelier/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, action }),
      });
      if (res.ok) {
        fetchJobs();
        if (selectedJob?.id === jobId) {
          const updated = await res.json();
          setSelectedJob({ ...selectedJob, ...updated });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReportIssue = async () => {
    if (!issueModalJob) return;
    try {
      const res = await fetch("/api/atelier/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: issueModalJob.id,
          action: "REPORT_ISSUE",
          issueType,
          issueDescription: issueDesc,
          reportedBy: "Koffi Mensah (Atelier)",
        }),
      });
      if (res.ok) {
        setIssueModalJob(null);
        setIssueDesc("");
        fetchJobs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-gy-dark text-gy-text flex overflow-hidden font-aptos text-base select-none">
      {/* SIDEBAR NAVIGATION (NO ICONS, UPPERCASE BUTTONS) */}
      <aside className="w-72 bg-gy-card border-r border-gy-border/80 flex flex-col justify-between z-30 shrink-0">
        <div>
          <div className="p-6 border-b border-gy-border/60 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-11 h-11 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black text-xl shadow-lg">
                GY
              </div>
              <div>
                <h1 className="font-serif text-lg font-bold text-white tracking-wide leading-tight">
                  GY ATELIER
                </h1>
                <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block">
                  Production & Confection
                </span>
              </div>
            </Link>
          </div>

          <div className="px-4 py-6 space-y-3">
            <div className="px-3 mb-2 text-[10px] font-extrabold text-gy-textMuted uppercase tracking-wider">
              ESPACE ARTISAN ATELIER
            </div>

            <button
              onClick={() => setActiveTab("tasks")}
              className={`w-full text-left px-5 py-4 rounded-xl text-xs font-black transition-all uppercase tracking-wider ${
                activeTab === "tasks"
                  ? "bg-amber-500 text-black shadow-lg"
                  : "bg-gy-dark text-white border border-gy-border hover:border-amber-400"
              }`}
            >
              MES TÂCHES DU JOUR
            </button>

            <button
              onClick={() => setActiveTab("qc")}
              className={`w-full text-left px-5 py-4 rounded-xl text-xs font-black transition-all uppercase tracking-wider ${
                activeTab === "qc"
                  ? "bg-amber-500 text-black shadow-lg"
                  : "bg-gy-dark text-white border border-gy-border hover:border-amber-400"
              }`}
            >
              CONTRÔLE QUALITÉ TACTILE
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-gy-border/60 bg-gy-dark/40">
          <div className="flex items-center justify-between p-3 rounded-xl bg-gy-card border border-amber-500/30">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                KM
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white leading-tight">Koffi Mensah</div>
                <div className="text-[10px] text-amber-400 font-semibold">Responsable Atelier</div>
              </div>
            </div>
            <Link href="/" title="Quitter Atelier" className="text-gy-textMuted hover:text-rose-400 font-bold text-xs px-2 py-1 border border-gy-border rounded-lg">
              QUITTER
            </Link>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSHOP TOUCH AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-gy-border/80 bg-gy-card/80 backdrop-blur-md sticky top-0 z-20 px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={qrQuery}
              onChange={(e) => setQrQuery(e.target.value)}
              placeholder="SCANNER QR CODE (EX: QR-JOB-001-COUPE)..."
              className="bg-gy-dark border border-gy-border rounded-xl text-xs font-bold text-white placeholder-gy-textMuted px-4 py-2 focus:outline-none focus:border-amber-400 w-80 uppercase tracking-wider"
            />
            <button
              onClick={handleScanQr}
              className="px-4 py-2 bg-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-amber-400 shadow-md"
            >
              SCAN QR
            </button>
          </div>

          <button
            onClick={fetchJobs}
            className="px-4 py-2 rounded-xl bg-gy-dark border border-gy-border text-amber-400 hover:bg-gy-card text-xs font-black uppercase tracking-wider"
          >
            ACTUALISER
          </button>
        </header>

        <main className="p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {activeTab === "tasks" && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Interface Tablette Tactile</span>
                  <h2 className="font-serif text-3xl font-bold text-white mt-1">Bonjour Koffi ! Vos travaux en cours</h2>
                </div>
                <div className="flex space-x-3 text-center">
                  <div className="bg-gy-dark px-4 py-2.5 rounded-xl border border-gy-border">
                    <span className="text-[10px] text-gy-textMuted uppercase block font-bold">À Faire</span>
                    <strong className="text-xl font-bold text-amber-400">{jobs.filter((j) => j.status === "A_FAIRE").length}</strong>
                  </div>
                  <div className="bg-gy-dark px-4 py-2.5 rounded-xl border border-gy-border">
                    <span className="text-[10px] text-gy-textMuted uppercase block font-bold">En Cours</span>
                    <strong className="text-xl font-bold text-sky-400">{jobs.filter((j) => j.status === "EN_COURS").length}</strong>
                  </div>
                  <div className="bg-gy-dark px-4 py-2.5 rounded-xl border border-gy-border">
                    <span className="text-[10px] text-gy-textMuted uppercase block font-bold">Terminées</span>
                    <strong className="text-xl font-bold text-emerald-400">{jobs.filter((j) => j.status === "TERMINE").length}</strong>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((j) => (
                  <div
                    key={j.id}
                    className={`glass-panel p-6 rounded-2xl border transition-all ${
                      j.status === "EN_COURS"
                        ? "border-sky-500 shadow-lg bg-sky-950/20"
                        : j.status === "BLOQUE"
                        ? "border-rose-500 bg-rose-950/20"
                        : "border-gy-border"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">ÉTAPE : {j.stage}</span>
                        <h3 className="font-serif text-xl font-bold text-white mt-0.5">
                          {j.orderItem?.itemName || "Tenue Sur-Mesure"}
                        </h3>
                        <span className="text-xs text-gy-textMuted block font-semibold">QR: {j.qrCode}</span>
                      </div>
                      <span className="px-3 py-1 bg-gy-dark border border-gy-border rounded-xl text-xs font-bold text-amber-400 uppercase">
                        {j.status}
                      </span>
                    </div>

                    <div className="space-y-3 pt-2">
                      {j.status === "A_FAIRE" && (
                        <button
                          onClick={() => handleJobAction(j.id, "START")}
                          className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg"
                        >
                          DÉMARRER LA TÂCHE
                        </button>
                      )}

                      {j.status === "EN_COURS" && (
                        <button
                          onClick={() => handleJobAction(j.id, "COMPLETE")}
                          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg"
                        >
                          TERMINER ET VALIDER
                        </button>
                      )}

                      <button
                        onClick={() => setIssueModalJob(j)}
                        className="w-full py-2 bg-gy-dark border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 font-bold text-xs uppercase tracking-wider rounded-xl"
                      >
                        SIGNALER UN PROBLÈME
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
