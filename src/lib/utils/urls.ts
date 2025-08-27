export function buildEnvironmentUrl(envSlug: string, path: string = ''): string {
  return `/${envSlug}${path}`
}

export function buildProductUrl(envSlug: string, productId: string): string {
  return buildEnvironmentUrl(envSlug, `/products/${productId}`)
}

export function buildProductsUrl(envSlug: string): string {
  return buildEnvironmentUrl(envSlug, '/products')
}

export function buildNewProductUrl(envSlug: string): string {
  return buildEnvironmentUrl(envSlug, '/products/new')
}

export function buildLocationsUrl(envSlug: string): string {
  return buildEnvironmentUrl(envSlug, '/locations')
}

export function buildMembersUrl(envSlug: string): string {
  return buildEnvironmentUrl(envSlug, '/members')
}

export function buildAnalyticsUrl(envSlug: string): string {
  return buildEnvironmentUrl(envSlug, '/analytics')
}

export function buildAdminUrl(): string {
  return '/admin'
}
