// Cache monitoring utility for debugging and performance tracking

interface CacheMetrics {
  hits: number
  misses: number
  invalidations: number
  lastAccess: Date
}

class CacheMonitor {
  private metrics: Map<string, CacheMetrics> = new Map()

  /**
   * Record a cache hit
   */
  recordHit(cacheKey: string): void {
    const existing = this.metrics.get(cacheKey) || {
      hits: 0,
      misses: 0,
      invalidations: 0,
      lastAccess: new Date()
    }

    existing.hits++
    existing.lastAccess = new Date()
    this.metrics.set(cacheKey, existing)

    if (process.env.NODE_ENV === 'development') {
      console.log(`Cache HIT: ${cacheKey}`)
    }
  }

  /**
   * Record a cache miss
   */
  recordMiss(cacheKey: string): void {
    const existing = this.metrics.get(cacheKey) || {
      hits: 0,
      misses: 0,
      invalidations: 0,
      lastAccess: new Date()
    }

    existing.misses++
    existing.lastAccess = new Date()
    this.metrics.set(cacheKey, existing)

    if (process.env.NODE_ENV === 'development') {
      console.log(`Cache MISS: ${cacheKey}`)
    }
  }

  /**
   * Record a cache invalidation
   */
  recordInvalidation(tags: string[]): void {
    const tagString = tags.join(', ')
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Cache INVALIDATION: ${tagString}`)
    }

    // Update metrics for all cache keys that might be affected
    const entries = Array.from(this.metrics.entries())
    for (const [key, metrics] of entries) {
      if (tags.some(tag => key.includes(tag))) {
        metrics.invalidations++
        metrics.lastAccess = new Date()
        this.metrics.set(key, metrics)
      }
    }
  }

  /**
   * Get cache hit rate for a specific key
   */
  getHitRate(cacheKey: string): number {
    const metrics = this.metrics.get(cacheKey)
    if (!metrics) return 0

    const total = metrics.hits + metrics.misses
    return total > 0 ? (metrics.hits / total) * 100 : 0
  }

  /**
   * Get overall cache statistics
   */
  getStats(): {
    totalHits: number
    totalMisses: number
    totalInvalidations: number
    overallHitRate: number
    cacheKeys: string[]
  } {
    let totalHits = 0
    let totalMisses = 0
    let totalInvalidations = 0
    const cacheKeys: string[] = []

    const entries = Array.from(this.metrics.entries())
    for (const [key, metrics] of entries) {
      totalHits += metrics.hits
      totalMisses += metrics.misses
      totalInvalidations += metrics.invalidations
      cacheKeys.push(key)
    }

    const total = totalHits + totalMisses
    const overallHitRate = total > 0 ? (totalHits / total) * 100 : 0

    return {
      totalHits,
      totalMisses,
      totalInvalidations,
      overallHitRate,
      cacheKeys
    }
  }

  /**
   * Get detailed metrics for a specific cache key
   */
  getMetrics(cacheKey: string): CacheMetrics | null {
    return this.metrics.get(cacheKey) || null
  }

  /**
   * Clear all metrics (useful for testing)
   */
  clear(): void {
    this.metrics.clear()
  }

  /**
   * Log current cache performance
   */
  logPerformance(): void {
    const stats = this.getStats()
    
    console.log('=== Cache Performance Report ===')
    console.log(`Overall Hit Rate: ${stats.overallHitRate.toFixed(2)}%`)
    console.log(`Total Hits: ${stats.totalHits}`)
    console.log(`Total Misses: ${stats.totalMisses}`)
    console.log(`Total Invalidations: ${stats.totalInvalidations}`)
    console.log(`Active Cache Keys: ${stats.cacheKeys.length}`)
    
    if (stats.cacheKeys.length > 0) {
      console.log('\nCache Key Details:')
      for (const key of stats.cacheKeys) {
        const metrics = this.getMetrics(key)!
        const hitRate = this.getHitRate(key)
        console.log(`  ${key}: ${hitRate.toFixed(2)}% hit rate (${metrics.hits}h/${metrics.misses}m)`)
      }
    }
    console.log('================================')
  }
}

// Export singleton instance
export const cacheMonitor = new CacheMonitor()

// Helper functions for easy integration
export const recordCacheHit = (cacheKey: string) => cacheMonitor.recordHit(cacheKey)
export const recordCacheMiss = (cacheKey: string) => cacheMonitor.recordMiss(cacheKey)
export const recordCacheInvalidation = (tags: string[]) => cacheMonitor.recordInvalidation(tags)
export const getCacheStats = () => cacheMonitor.getStats()
export const logCachePerformance = () => cacheMonitor.logPerformance()
