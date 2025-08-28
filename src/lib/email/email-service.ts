export interface EmailInviteData {
  to: string
  from: string
  inviterName: string
  environmentName: string
  inviteUrl: string
  role: string
}

export interface EmailNotificationData {
  to: string
  from: string
  subject: string
  message: string
  environmentName: string
}

export interface EmailWelcomeData {
  to: string
  from: string
  userName: string
  environmentName: string
  loginUrl: string
}

export class EmailService {
  private static async sendEmail(data: {
    from: string
    to: string[]
    subject: string
    html: string
  }) {
    // Check if Resend API key is configured
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey || apiKey === 'your_resend_api_key_here') {
      console.warn('⚠️  Resend API key not configured. Email will not be sent.')
      console.log('📧 Email would have been sent:')
      console.log('   To:', data.to.join(', '))
      console.log('   Subject:', data.subject)
      console.log('   From:', data.from)
      console.log('   URL in email:', data.html.match(/href="([^"]+)"/)?.[1] || 'No URL found')
      return { success: false, reason: 'API key not configured' }
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ Email sending failed:', result)
        throw new Error(result.message || 'Failed to send email')
      }

      console.log('✅ Email sent successfully to:', data.to.join(', '))
      return result
    } catch (error) {
      console.error('❌ Email sending error:', error)
      throw error
    }
  }

  /**
   * Send an invitation email to join an environment
   */
  static async sendInviteEmail(data: EmailInviteData) {
    try {
      const result = await this.sendEmail({
        from: data.from,
        to: [data.to],
        subject: `You're invited to join ${data.environmentName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">You're invited to join ${data.environmentName}</h2>
            <p>Hi there!</p>
            <p><strong>${data.inviterName}</strong> has invited you to join <strong>${data.environmentName}</strong> as a <strong>${data.role}</strong>.</p>
            <p>Click the button below to accept the invitation:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.inviteUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Accept Invitation
              </a>
            </div>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${data.inviteUrl}</p>
            <p>This invitation will expire in 7 days.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
        `,
      })

      return result
    } catch (error) {
      console.error('Error in sendInviteEmail:', error)
      throw error
    }
  }

  /**
   * Send a welcome email to new users
   */
  static async sendWelcomeEmail(data: EmailWelcomeData) {
    try {
      const result = await this.sendEmail({
        from: data.from,
        to: [data.to],
        subject: `Welcome to ${data.environmentName}!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to ${data.environmentName}!</h2>
            <p>Hi ${data.userName},</p>
            <p>Welcome to your new environment! You're all set up and ready to start managing your products.</p>
            <p>Click the button below to access your dashboard:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.loginUrl}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Access Dashboard
              </a>
            </div>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              Thank you for choosing Eventably!
            </p>
          </div>
        `,
      })

      return result
    } catch (error) {
      console.error('Error in sendWelcomeEmail:', error)
      throw error
    }
  }

  /**
   * Send a notification email
   */
  static async sendNotificationEmail(data: EmailNotificationData) {
    try {
      const result = await this.sendEmail({
        from: data.from,
        to: [data.to],
        subject: data.subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">${data.subject}</h2>
            <p>Hi there!</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              ${data.message}
            </div>
            <p>This notification is from <strong>${data.environmentName}</strong>.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              You can manage your notification preferences in your account settings.
            </p>
          </div>
        `,
      })

      return result
    } catch (error) {
      console.error('Error in sendNotificationEmail:', error)
      throw error
    }
  }

  /**
   * Send a product status change notification
   */
  static async sendProductStatusNotification(data: {
    to: string
    from: string
    productName: string
    oldStatus: string
    newStatus: string
    environmentName: string
    productUrl: string
  }) {
    try {
      const result = await this.sendEmail({
        from: data.from,
        to: [data.to],
        subject: `Product Status Changed: ${data.productName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Product Status Update</h2>
            <p>Hi there!</p>
            <p>The status of <strong>${data.productName}</strong> has been updated in <strong>${data.environmentName}</strong>.</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Status Change:</strong></p>
              <p style="color: #dc3545;">${data.oldStatus} → ${data.newStatus}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.productUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Product
              </a>
            </div>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              You can manage your notification preferences in your account settings.
            </p>
          </div>
        `,
      })

      return result
    } catch (error) {
      console.error('Error in sendProductStatusNotification:', error)
      throw error
    }
  }

  /**
   * Send a new product notification
   */
  static async sendNewProductNotification(data: {
    to: string
    from: string
    productName: string
    environmentName: string
    productUrl: string
    addedBy: string
  }) {
    try {
      const result = await this.sendEmail({
        from: data.from,
        to: [data.to],
        subject: `New Product Added: ${data.productName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Product Added</h2>
            <p>Hi there!</p>
            <p>A new product has been added to <strong>${data.environmentName}</strong>.</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Product:</strong> ${data.productName}</p>
              <p><strong>Added by:</strong> ${data.addedBy}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.productUrl}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Product
              </a>
            </div>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              You can manage your notification preferences in your account settings.
            </p>
          </div>
        `,
      })

      return result
    } catch (error) {
      console.error('Error in sendNewProductNotification:', error)
      throw error
    }
  }
}
