export function getInvitationEmailTemplate(inviteData: {
  environmentName: string
  role: string
  inviteUrl: string
  expiresAt: string
}) {
  return {
    subject: `You're invited to join ${inviteData.environmentName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitation to join ${inviteData.environmentName}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>You're Invited!</h1>
            <p>You've been invited to join <strong>${inviteData.environmentName}</strong></p>
          </div>
          
          <p>Hello!</p>
          
          <p>You've been invited to join <strong>${inviteData.environmentName}</strong> as a <strong>${inviteData.role.replace('_', ' ')}</strong>.</p>
          
          <p>This invitation will expire on <strong>${new Date(inviteData.expiresAt).toLocaleDateString()}</strong>.</p>
          
          <div style="text-align: center;">
            <a href="${inviteData.inviteUrl}" class="button">Accept Invitation</a>
          </div>
          
          <p>If you don't have an account yet, you'll be able to create one when you accept the invitation.</p>
          
          <div class="footer">
            <p>If you have any questions, please contact the environment administrator.</p>
            <p>This invitation was sent by Grady ReSellOps.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
You're Invited!

You've been invited to join ${inviteData.environmentName} as a ${inviteData.role.replace('_', ' ')}.

This invitation will expire on ${new Date(inviteData.expiresAt).toLocaleDateString()}.

To accept this invitation, visit: ${inviteData.inviteUrl}

If you don't have an account yet, you'll be able to create one when you accept the invitation.

If you have any questions, please contact the environment administrator.

This invitation was sent by Grady ReSellOps.
    `.trim()
  }
}
