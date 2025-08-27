import { Role, ProductStatus } from '@/types/db'

// Role hierarchy (higher = more permissions)
const roleHierarchy: Record<Role, number> = {
  grady_admin: 4,
  grady_staff: 3,
  reseller_manager: 2,
  reseller_staff: 1,
}

// Product status transition matrix
const statusTransitions: Record<ProductStatus, ProductStatus[]> = {
  taken: ['in_repair', 'selling', 'discarded'],
  in_repair: ['selling', 'discarded', 'returned'],
  selling: ['sold', 'returned'],
  sold: [], // terminal state
  returned: [], // terminal state
  discarded: [], // terminal state
}

export function hasRole(userRole: Role, requiredRole: Role): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

export function canTransitionStatus(fromStatus: ProductStatus, toStatus: ProductStatus): boolean {
  return statusTransitions[fromStatus].includes(toStatus)
}

export function canManageProducts(userRole: Role): boolean {
  return hasRole(userRole, 'grady_staff')
}

export function canManageUsers(userRole: Role): boolean {
  return hasRole(userRole, 'reseller_manager')
}

export function canViewAnalytics(userRole: Role): boolean {
  return hasRole(userRole, 'reseller_staff')
}

export function canManageEnvironments(userRole: Role): boolean {
  return hasRole(userRole, 'grady_admin')
}

export function getAvailableStatusTransitions(currentStatus: ProductStatus): ProductStatus[] {
  return statusTransitions[currentStatus]
}
