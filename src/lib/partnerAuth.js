import Cookies from "js-cookie";

/** Login UI id → API routes, storage keys, and normalized display role */
export const PARTNER_ROLE_CONFIG = {
  "project-partner": {
    id: "project-partner",
    label: "Project Partner",
    displayRole: "Project Partner",
    loginEndpoint: "/project-partner/login",
    logoutEndpoint: "/project-partner/logout",
    forgotPasswordEndpoint: "/project-partner/login/forgot-password",
    sessionEndpoint: "/project-partner/session-data",
    userKey: "projectPartnerUser",
    cookieKey: "projectPartnerToken",
    apiPrefix: "/project-partner",
    subscriptionSlug: "project",
  },
  "sales-partner": {
    id: "sales-partner",
    label: "Sales Partner",
    displayRole: "Sales Partner",
    loginEndpoint: "/sales/login",
    logoutEndpoint: "/sales/logout",
    forgotPasswordEndpoint: "/sales/login/forgot-password",
    sessionEndpoint: "/sales/session-data",
    userKey: "salesUser",
    cookieKey: "salesToken",
    apiPrefix: "/sales",
    subscriptionSlug: "sales",
  },
  "territory-partner": {
    id: "territory-partner",
    label: "Territory Partner",
    displayRole: "Territory Partner",
    loginEndpoint: "/territory-partner/login",
    logoutEndpoint: "/territory-partner/logout",
    forgotPasswordEndpoint: "/territory-partner/login/forgot-password",
    sessionEndpoint: "/territory-partner/session-data",
    userKey: "territoryUser",
    cookieKey: "territoryToken",
    apiPrefix: "/territory-partner",
    subscriptionSlug: "territory",
  },
};

export const ACTIVE_ROLE_STORAGE_KEY = "partnerActiveRole";

/** Server / legacy role strings → canonical display role */
const ROLE_ALIASES = {
  "Sales Person": "Sales Partner",
  "sales person": "Sales Partner",
  "sales partner": "Sales Partner",
  "project partner": "Project Partner",
  "territory partner": "Territory Partner",
};

export function normalizePartnerRole(role) {
  if (!role) return null;
  const trimmed = String(role).trim();
  return ROLE_ALIASES[trimmed] || trimmed;
}

export function getRoleConfigById(roleId) {
  return PARTNER_ROLE_CONFIG[roleId] || null;
}

export function getRoleConfigByDisplayRole(role) {
  const normalized = normalizePartnerRole(role);
  return (
    Object.values(PARTNER_ROLE_CONFIG).find((c) => c.displayRole === normalized) ||
    null
  );
}

export function getRoleIdFromUser(user) {
  const stored = localStorage.getItem(ACTIVE_ROLE_STORAGE_KEY);
  if (stored && PARTNER_ROLE_CONFIG[stored]) return stored;
  const config = getRoleConfigByDisplayRole(user?.role);
  return config?.id || null;
}

/** API path prefix from display role (dashboard, customers, etc.) */
export function getApiPrefixForRole(role) {
  const normalized = normalizePartnerRole(role);
  if (normalized === "Project Partner") return "/project-partner";
  if (normalized === "Territory Partner") return "/territory-partner";
  if (normalized === "Sales Partner") return "/sales";
  return "/project-partner";
}

/** Label for GET /api/subscription/partner-plans/:partnerType */
export function getPartnerPlansLabel(userOrRole) {
  if (userOrRole && typeof userOrRole === "object") {
    const config = getRoleConfigById(getRoleIdFromUser(userOrRole));
    if (config?.displayRole) return config.displayRole;
    userOrRole = userOrRole.role;
  }

  const normalized = normalizePartnerRole(userOrRole);
  if (normalized === "Territory Partner") return "Territory Partner";
  if (normalized === "Sales Partner") return "Sales Partner";
  return "Project Partner";
}

/** API slug for subscription checkout and user subscription routes */
export function getSubscriptionSlugForUser(user) {
  const config = getRoleConfigById(getRoleIdFromUser(user));
  if (config?.subscriptionSlug) return config.subscriptionSlug;

  const normalized = normalizePartnerRole(user?.role);
  if (normalized === "Territory Partner") return "territory";
  if (normalized === "Sales Partner") return "sales";
  return "project";
}

export function getLogoutEndpointForUser(user) {
  const roleId = getRoleIdFromUser(user);
  const config = roleId ? getRoleConfigById(roleId) : null;
  return config?.logoutEndpoint || "/project-partner/logout";
}

/**
 * Resolve stored session: prefers `partnerActiveRole`, not first key in list.
 */
export function getStoredPartnerSession() {
  const activeRoleId = localStorage.getItem(ACTIVE_ROLE_STORAGE_KEY);
  if (activeRoleId) {
    const config = getRoleConfigById(activeRoleId);
    if (config) {
      const raw = localStorage.getItem(config.userKey);
      if (raw) {
        try {
          const user = JSON.parse(raw);
          return {
            roleId: activeRoleId,
            user: {
              ...user,
              role: normalizePartnerRole(user.role) || config.displayRole,
            },
          };
        } catch {
          /* fall through */
        }
      }
    }
  }

  for (const config of Object.values(PARTNER_ROLE_CONFIG)) {
    const raw = localStorage.getItem(config.userKey);
    if (!raw) continue;
    try {
      const user = JSON.parse(raw);
      return {
        roleId: config.id,
        user: {
          ...user,
          role: normalizePartnerRole(user.role) || config.displayRole,
        },
      };
    } catch {
      continue;
    }
  }

  return null;
}

/** Remove all partner local session data and non-httpOnly cookie echoes */
export function clearPartnerSession() {
  localStorage.removeItem(ACTIVE_ROLE_STORAGE_KEY);
  for (const config of Object.values(PARTNER_ROLE_CONFIG)) {
    localStorage.removeItem(config.userKey);
  }

  const cookieNames = [
    "accessToken",
    "projectPartnerToken",
    "salesToken",
    "territoryToken",
  ];
  for (const name of cookieNames) {
    Cookies.remove(name, { path: "/" });
  }
}

/**
 * Persist user after login. Server sets httpOnly auth cookies; we only store profile locally.
 */
export function persistPartnerSession(roleId, user) {
  const config = getRoleConfigById(roleId);
  if (!config || !user) return null;

  clearPartnerSession();

  const normalizedUser = {
    ...user,
    role: normalizePartnerRole(user.role) || config.displayRole,
  };

  localStorage.setItem(ACTIVE_ROLE_STORAGE_KEY, roleId);
  localStorage.setItem(config.userKey, JSON.stringify(normalizedUser));

  return normalizedUser;
}

async function fetchPartnerProfile(apiBase, config, fallbackUser) {
  const profileRes = await fetch(`${apiBase}${config.apiPrefix}/profile`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!profileRes.ok) {
    return null;
  }

  const profile = await profileRes.json().catch(() => ({}));
  return {
    ok: true,
    user: {
      ...(fallbackUser || {}),
      ...profile,
      id: profile.id ?? fallbackUser?.id,
      role:
        normalizePartnerRole(profile.role || fallbackUser?.role) ||
        config.displayRole,
    },
  };
}

/** Validate session with server (session cookie + express session) */
export async function validatePartnerSession(apiBase, roleId, fallbackUser) {
  const config = getRoleConfigById(roleId);
  if (!config) {
    return { ok: false };
  }

  let sessionStatus = null;

  try {
    const res = await fetch(`${apiBase}${config.sessionEndpoint}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    sessionStatus = res.status;

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data?.user?.id) {
        return {
          ok: true,
          user: {
            ...data.user,
            role: normalizePartnerRole(data.user.role) || config.displayRole,
          },
        };
      }
    }

    if (res.status === 401 && !fallbackUser?.id) {
      return { ok: false };
    }
  } catch {
    /* try profile fallback below when a stored user exists */
  }

  if (sessionStatus === 401 && !fallbackUser?.id) {
    return { ok: false };
  }

  if (!fallbackUser?.id) {
    return { ok: false };
  }

  try {
    const profileResult = await fetchPartnerProfile(apiBase, config, fallbackUser);
    if (profileResult) {
      return profileResult;
    }
  } catch {
    /* no valid server session */
  }

  return { ok: false };
}

export async function logoutPartner(apiBase, user) {
  const endpoint = getLogoutEndpointForUser(user);
  try {
    await fetch(`${apiBase}${endpoint}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    /* still clear local session */
  }
  clearPartnerSession();
}
