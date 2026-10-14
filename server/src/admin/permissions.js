export const PERMISSION_KEYS = {
  manageProducts: 'Manage products',
  manageCatalog: 'Manage catalog',
  manageMedia: 'Manage media library',
  manageOrders: 'Manage orders',
  manageCoupons: 'Manage coupons',
  manageContent: 'Manage pages, blog & reviews',
  manageSettings: 'Manage settings',
  manageUsers: 'Manage team & permissions',
}

export const ALL_PERMISSIONS = Object.keys(PERMISSION_KEYS)

export const HIDDEN_SHOW_ACTION = { isVisible: false, isAccessible: () => false }

export function isSuperAdmin(admin) {
  return admin?.role === 'super_admin' || admin?.role === 'admin'
}

export function hasPermission(admin, key) {
  if (!admin) return false
  if (isSuperAdmin(admin)) return true
  return Boolean(admin.permissions?.[key])
}

export function canManage(key) {
  return ({ currentAdmin }) => hasPermission(currentAdmin, key)
}

/** Full resource access: list, create, edit, delete — no separate view permission */
export function resourceActions(manageKey) {
  const check = canManage(manageKey)
  return {
    list: check,
    search: check,
    new: check,
    edit: check,
    delete: check,
    bulkDelete: check,
    show: HIDDEN_SHOW_ACTION,
  }
}

export function serializeAdminUser(user) {
  const permissions = user.permissions
    ? {
        manageProducts: user.permissions.manageProducts,
        manageCatalog: user.permissions.manageCatalog,
        manageMedia: user.permissions.manageMedia,
        manageOrders: user.permissions.manageOrders,
        manageCoupons: user.permissions.manageCoupons,
        manageContent: user.permissions.manageContent,
        manageSettings: user.permissions.manageSettings,
        manageUsers: user.permissions.manageUsers,
      }
    : null

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    role: user.role,
    permissions,
  }
}

export const defaultStaffPermissions = {
  manageProducts: false,
  manageCatalog: false,
  manageMedia: false,
  manageOrders: true,
  manageCoupons: false,
  manageContent: false,
  manageSettings: false,
  manageUsers: false,
}

export const fullPermissions = Object.fromEntries(ALL_PERMISSIONS.map((k) => [k, true]))
