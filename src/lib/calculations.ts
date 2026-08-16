export function calculateProfitability(price: number, realCost: number) {
  const marginFcfa = price - realCost;
  const marginPercent = price > 0 ? (marginFcfa / price) * 100 : 0;
  return {
    price,
    realCost,
    marginFcfa,
    marginPercent: Number(marginPercent.toFixed(1)),
  };
}

export function formatCurrencyXOF(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(amount).replace("XOF", "FCFA");
}

export function calculateStockAvailable(physicalStock: number, reservedStock: number): number {
  return Math.max(0, physicalStock - reservedStock);
}
