const { calculateStockAvailable, calculateProfitability, formatCurrencyXOF } = require("../src/lib/calculations");
const { mapOrderStatusToClientStep, getClientTimelineSteps } = require("../src/lib/workflows");
const { canAccessAdmin, canAccessAtelier, canAccessClient, canViewFinancials } = require("../src/lib/auth");

async function runTests() {
  console.log("🧪 DEMARRAGE DES TESTS END-TO-END GY MAISON COUTURE ERP...\n");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // TEST 1: STOCK ARITHMETIC (Requirement 82)
  console.log("--- TEST 1: ARITHMÉTIQUE DES STOCKS (Physique / Réservé / Disponible) ---");
  const physical = 10;
  const reserved = 6;
  const available = calculateStockAvailable(physical, reserved);
  assert(available === 4, `Stock disponible pour 10m physique et 6m réservés doit être 4m (obtenu: ${available})`);

  // TEST 2: CLIENT ISOLATION & PERMISSIONS RBAC (Requirement 74, 80, 81)
  console.log("\n--- TEST 2: SÉCURITÉ RBAC & ACCÈS PORTAIL ---");
  assert(canAccessAdmin("SUPER_ADMIN") === true, "SUPER_ADMIN a accès à GY ADMIN");
  assert(canAccessAdmin("COUTURIER") === false, "COUTURIER N'A PAS accès au portail GY ADMIN");
  assert(canAccessAtelier("COUTURIER") === true, "COUTURIER a accès au portail GY ATELIER");
  assert(canViewFinancials("COUTURIER") === false, "COUTURIER ne peut PAS consulter les marges financières");
  assert(canAccessClient("CLIENT") === true, "Membre CLIENT a accès au portail MY GY");

  // TEST 3: WORKFLOW STATE TRANSFORMATION (Requirement 48 & 49)
  console.log("\n--- TEST 3: WORKFLOW COMMANDE & TIMELINE CLIENT ELEGANTE ---");
  const clientStep1 = mapOrderStatusToClientStep("PRODUCTION");
  assert(clientStep1 === "CONFECTION_EN_COURS", "OrderStatus PRODUCTION doit afficher 'CONFECTION_EN_COURS' sur MY GY");

  const clientStep2 = mapOrderStatusToClientStep("SOLDE_A_PAYER");
  assert(clientStep2 === "PRETE", "OrderStatus SOLDE_A_PAYER doit afficher 'PRETE' sur MY GY");

  const timeline = getClientTimelineSteps("CONFECTION_EN_COURS");
  assert(timeline.length === 8, "La timeline client doit comporter 8 étapes élégantes");
  const currentStep = timeline.find((s: any) => s.state === "current");
  assert(currentStep?.key === "CONFECTION_EN_COURS", "L'étape actuelle de la timeline doit être CONFECTION_EN_COURS");

  // TEST 4: PROFITABILITY & FINANCIAL FORMULAS (Requirement 26)
  console.log("\n--- TEST 4: MARGES & RENTABILITÉ RÉELLE ---");
  const profit = calculateProfitability(1200000, 410000);
  assert(profit.marginFcfa === 790000, `Marge FCFA attendue 790 000 FCFA (obtenu: ${profit.marginFcfa})`);
  assert(profit.marginPercent === 65.8, `Marge % attendue 65.8% (obtenu: ${profit.marginPercent}%)`);

  console.log(`\n==================================================`);
  console.log(`📊 RÉSULTATS DES TESTS: ${passed} PASSÉS, ${failed} ÉCHOUÉS`);
  console.log(`==================================================\n`);

  if (failed > 0) process.exit(1);
}

runTests();
