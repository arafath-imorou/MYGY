export function mapOrderStatusToClientStep(orderStatus: string): string {
  switch (orderStatus) {
    case "DEVIS":
    case "DEVIS_ACCEPTE":
    case "ACOMPTE_ATTENDU":
      return "COMMANDE_CONFIRMEE";

    case "ACOMPTE_RECEU":
    case "VERIFICATION_MATIERES":
    case "MATIERES_RESERVEES":
    case "PLANIFICATION":
      return "PREPARATION_MATIERES";

    case "PRODUCTION":
      return "CONFECTION_EN_COURS";

    case "ESSAYAGE":
      return "ESSAYAGE";

    case "RETOUCHE":
    case "FINITION":
      return "FINITIONS";

    case "CONTROLE_QUALITE":
      return "CONTROLE_QUALITE";

    case "SOLDE_A_PAYER":
    case "PRET":
      return "PRETE";

    case "LIVRAISON":
    case "CLOTURE":
      return "LIVREE";

    default:
      return "COMMANDE_CONFIRMEE";
  }
}

export function getClientTimelineSteps(currentStep: string) {
  const steps = [
    { key: "COMMANDE_CONFIRMEE", label: "Commande confirmée" },
    { key: "PREPARATION_MATIERES", label: "Préparation des matières" },
    { key: "CONFECTION_EN_COURS", label: "Confection en atelier" },
    { key: "ESSAYAGE", label: "Essayage & Ajustements" },
    { key: "FINITIONS", label: "Finitions de haute couture" },
    { key: "CONTROLE_QUALITE", label: "Contrôle Qualité GY" },
    { key: "PRETE", label: "Création prête" },
    { key: "LIVRAISON", label: "Livrée" },
  ];

  const stepKeys = steps.map((s) => s.key);
  const currentIndex = stepKeys.indexOf(currentStep);

  return steps.map((s, index) => {
    let state: "completed" | "current" | "upcoming" = "upcoming";
    if (index < currentIndex) state = "completed";
    else if (index === currentIndex) state = "current";

    return {
      ...s,
      state,
    };
  });
}
