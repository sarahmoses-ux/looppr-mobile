// The four mobile-app roles Looppr supports under one shared auth system.
// A single account can own more than one role (e.g. a residential customer
// who also drives) — see AuthContext / ownedRoles.
export const ROLES = {
  RESIDENTIAL: 'residential',
  BUSINESS: 'business',
  PARTNER: 'partner',
  DRIVER: 'driver',
};

export const ROLE_GROUP = {
  [ROLES.RESIDENTIAL]: 'customer',
  [ROLES.BUSINESS]: 'business',
  [ROLES.PARTNER]: 'partner',
  [ROLES.DRIVER]: 'driver',
};

// A bare group redirect (e.g. "/(customer)") doesn't resolve to that group's
// default tab reliably — expo-router needs the fully-qualified path. This is
// each role's landing screen inside its (tabs) group.
export const ROLE_HOME_ROUTE = {
  [ROLES.RESIDENTIAL]: '/(customer)/(tabs)/home',
  [ROLES.BUSINESS]: '/(business)/(tabs)/home',
  [ROLES.PARTNER]: '/(partner)/(tabs)/queue',
  [ROLES.DRIVER]: '/(driver)/(tabs)/route',
};

export const ROLE_LABEL = {
  [ROLES.RESIDENTIAL]: 'Residential Customer',
  [ROLES.BUSINESS]: 'Business Customer',
  [ROLES.PARTNER]: 'Laundry Partner',
  [ROLES.DRIVER]: 'Driver',
};

// Top-level auth fork: Customer (primary, shown first/larger) vs Operational.
export const AUTH_CATEGORY = {
  CUSTOMER: 'customer',
  OPERATIONAL: 'operational',
};

export const AUTH_CATEGORY_ROLES = {
  [AUTH_CATEGORY.CUSTOMER]: [ROLES.RESIDENTIAL, ROLES.BUSINESS],
  [AUTH_CATEGORY.OPERATIONAL]: [ROLES.PARTNER, ROLES.DRIVER],
};
