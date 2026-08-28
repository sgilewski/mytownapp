import type { AppRole } from "@mytownapp/types";

type MembershipLike = { role: AppRole | string };

const businessRoles = new Set<AppRole>(["business_admin", "business_editor"]);
const chamberRoles = new Set<AppRole>(["chamber_admin", "chamber_editor"]);

export function getWorkspaceAccess(memberships: MembershipLike[]) {
  const roles = memberships.map((membership) => membership.role as AppRole);
  const isPlatformAdmin = roles.includes("platform_admin");

  return {
    hasBusiness: isPlatformAdmin || roles.some((role) => businessRoles.has(role)),
    hasChamber: isPlatformAdmin || roles.some((role) => chamberRoles.has(role)),
  };
}

export function getPostAuthDestination(memberships: MembershipLike[]) {
  const { hasBusiness, hasChamber } = getWorkspaceAccess(memberships);

  if (hasBusiness && hasChamber) return "/choose-workspace";
  if (hasBusiness) return "/business";
  if (hasChamber) return "/chamber";
  return "/unauthorized";
}
