import { unstable_cache } from 'next/cache'
import { recordCacheHit, recordCacheMiss, recordCacheInvalidation } from './cache-monitor'

// Cache configuration constants
export const CACHE_CONFIGS = {
  // Short cache for frequently changing data (5 minutes)
  SHORT: {
    revalidate: 300, // 5 minutes
    tags: ['short']
  },
  // Medium cache for moderately changing data (30 minutes)
  MEDIUM: {
    revalidate: 1800, // 30 minutes
    tags: ['medium']
  },
  // Long cache for stable data (2 hours)
  LONG: {
    revalidate: 7200, // 2 hours
    tags: ['long']
  },
  // Very long cache for rarely changing data (24 hours)
  VERY_LONG: {
    revalidate: 86400, // 24 hours
    tags: ['very-long']
  }
} as const

// Cache tags for specific data types
export const CACHE_TAGS = {
  PRODUCTS: 'products',
  LOCATIONS: 'locations',
  ENVIRONMENTS: 'environments',
  MEMBERSHIPS: 'memberships',
  DASHBOARD_STATS: 'dashboard-stats',
  USER_PROFILES: 'user-profiles',
  DEMO_DATA: 'demo-data'
} as const

/**
 * Creates a cached version of a function with proper error handling and monitoring
 */
export function createCachedFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  config: {
    revalidate: number
    tags: string[]
    key?: string
  }
): T {
  const cacheKey = config.key || fn.name
  
  return unstable_cache(
    async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
      try {
        const result = await fn(...args)
        recordCacheMiss(cacheKey) // Record miss since we had to execute the function
        return result
      } catch (error) {
        console.error(`Cache function error for ${cacheKey}:`, error)
        // Re-throw the error to maintain the original function signature
        throw error
      }
    },
    [cacheKey],
    {
      revalidate: config.revalidate,
      tags: config.tags
    }
  ) as T
}

/**
 * Invalidates cache by tags with monitoring
 */
export async function invalidateCache(tags: string[]) {
  // This will be handled by revalidateTag in Next.js 15
  // For now, we'll use revalidatePath as a fallback
  console.log(`Cache invalidation requested for tags: ${tags.join(', ')}`)
  recordCacheInvalidation(tags)
}

/**
 * Creates a cache key from parameters
 */
export function createCacheKey(prefix: string, ...params: any[]): string {
  const paramString = params
    .map(param => {
      if (typeof param === 'string') return param
      if (typeof param === 'number') return param.toString()
      if (typeof param === 'boolean') return param.toString()
      if (param === null) return 'null'
      if (param === undefined) return 'undefined'
      if (typeof param === 'object') return JSON.stringify(param)
      return String(param)
    })
    .join('-')
  
  return `${prefix}-${paramString}`
}

/**
 * Cache wrapper for environment-specific data
 */
export function createEnvironmentCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  config: {
    revalidate: number
    tags: string[]
    key: string
  }
): T {
  return unstable_cache(
    async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
      try {
        const result = await fn(...args)
        recordCacheMiss(config.key) // Record miss since we had to execute the function
        return result
      } catch (error) {
        console.error(`Environment cache function error for ${config.key}:`, error)
        throw error
      }
    },
    [config.key],
    {
      revalidate: config.revalidate,
      tags: [...config.tags, CACHE_TAGS.ENVIRONMENTS]
    }
  ) as T
}

/**
 * Cache wrapper for user-specific data
 */
export function createUserCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  config: {
    revalidate: number
    tags: string[]
    key: string
  }
): T {
  return unstable_cache(
    async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
      try {
        const result = await fn(...args)
        recordCacheMiss(config.key) // Record miss since we had to execute the function
        return result
      } catch (error) {
        console.error(`User cache function error for ${config.key}:`, error)
        throw error
      }
    },
    [config.key],
    {
      revalidate: config.revalidate,
      tags: [...config.tags, CACHE_TAGS.USER_PROFILES]
    }
  ) as T
}

/**
 * Enhanced cache invalidation with monitoring
 */
export function enhancedRevalidateTag(tag: string) {
  recordCacheInvalidation([tag])
  // Note: In Next.js 15, you would use revalidateTag(tag) here
  // For now, we'll just log the invalidation
  console.log(`Enhanced cache invalidation for tag: ${tag}`)
}

/**
 * Enhanced cache invalidation for multiple tags
 */
export function enhancedRevalidateTags(tags: string[]) {
  recordCacheInvalidation(tags)
  // Note: In Next.js 15, you would use revalidateTag for each tag
  // For now, we'll just log the invalidations
  console.log(`Enhanced cache invalidation for tags: ${tags.join(', ')}`)
}
