export const emailConfig = {
  // Default from address
  fromAddress: process.env.EMAIL_FROM_ADDRESS || 'noreply@eventably.lt',
  
  // App URL for links
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://eventably.lt',
  
  // Email templates configuration
  templates: {
    invite: {
      subject: (environmentName: string) => `You're invited to join ${environmentName}`,
      expiresIn: '7 days'
    },
    welcome: {
      subject: (environmentName: string) => `Welcome to ${environmentName}!`
    },
    notification: {
      subject: (subject: string) => subject
    },
    productStatus: {
      subject: (productName: string) => `Product Status Changed: ${productName}`
    },
    newProduct: {
      subject: (productName: string) => `New Product Added: ${productName}`
    }
  },
  
  // Rate limiting (emails per minute)
  rateLimit: {
    invite: 10,
    notification: 20,
    welcome: 5
  },
  
  // Email validation
  validation: {
    maxRecipients: 10,
    maxSubjectLength: 100,
    maxBodyLength: 10000
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function sanitizeEmailContent(content: string): string {
  // Basic sanitization to prevent XSS
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}

export function buildInviteUrl(inviteId: string, environmentSlug: string): string {
  return `${emailConfig.appUrl}/invite/${inviteId}?env=${environmentSlug}`
}

export function buildProductUrl(productId: string, environmentSlug: string): string {
  return `${emailConfig.appUrl}/${environmentSlug}/products/${productId}`
}

export function buildLoginUrl(): string {
  return `${emailConfig.appUrl}/login`
}
