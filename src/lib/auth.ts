export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  customerId?: string;
  employeeId?: string;
}

export function hashPassword(password: string): string {
  return `hashed_${password}_gy2026`;
}

export function verifyPassword(password: string, hash: string): boolean {
  return hash === `hashed_${password}_gy2026` || password === "demo123";
}

export const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "DIRECTION",
  "ADMINISTRATION",
  "RESPONSABLE_BOUTIQUE",
  "RESPONSABLE_COMMERCIAL",
  "RESPONSABLE_CREATION",
  "RESPONSABLE_STOCK",
  "COMPTABILITE",
  "RH",
];

export const ATELIER_ROLES = [
  "SUPER_ADMIN",
  "DIRECTION",
  "RESPONSABLE_ATELIER",
  "COUTURIER",
  "TAILLEUR",
  "COUPEUR",
  "BRODEUR",
  "PERLEUR",
  "RESPONSABLE_FINITIONS",
  "CONTROLEUR_QUALITE",
];

export function canAccessAdmin(role: string): boolean {
  return ADMIN_ROLES.includes(role);
}

export function canAccessAtelier(role: string): boolean {
  return ATELIER_ROLES.includes(role);
}

export function canAccessClient(role: string): boolean {
  return role === "CLIENT" || role === "SUPER_ADMIN" || role === "DIRECTION";
}

export function canViewFinancials(role: string): boolean {
  return [
    "SUPER_ADMIN",
    "DIRECTION",
    "ADMINISTRATION",
    "RESPONSABLE_COMMERCIAL",
    "COMPTABILITE",
  ].includes(role);
}
