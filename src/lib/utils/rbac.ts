import { Role } from '@/types/db'

// Role hierarchy (higher number = more permissions)
const roleHierarchy: Record<Role, number> = {
  admin: 2,
  store_manager: 1
}

// Check if user has a specific role or higher
export function hasRole(userRole: Role, requiredRole: Role): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

// Check if user can manage products
export function canManageProducts(userRole: Role): boolean {
  return hasRole(userRole, 'store_manager')
}

// Check if user can invite members
export function canInviteMembers(userRole: Role): boolean {
  return hasRole(userRole, 'store_manager')
}

// Check if user can delete products
export function canDeleteProducts(userRole: Role): boolean {
  return hasRole(userRole, 'store_manager')
}

// Check if user is admin
export function isAdmin(userRole: Role): boolean {
  return hasRole(userRole, 'admin')
}

// Get role display name
export function getRoleDisplayName(role: Role): string {
  switch (role) {
    case 'admin':
      return 'Admin'
    case 'store_manager':
      return 'Store Manager'
    default:
      return role
  }
}

// Get role description
export function getRoleDescription(role: Role): string {
  switch (role) {
    case 'admin':
      return 'Full system access and management capabilities'
    case 'store_manager':
      return 'Manage store operations, products, and team members'
    default:
      return ''
  }
}
