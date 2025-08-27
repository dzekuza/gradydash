# Email Setup Guide

This guide explains how to set up email functionality in the Grady ReSellOps
dashboard.

## Overview

The email system handles user invitations, notifications, and system alerts.
It's built using Resend for reliable email delivery.

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Resend Email Configuration
RESEND_API_KEY=re_your_resend_api_key_here

# Email Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
EMAIL_FROM_ADDRESS=noreply@your-domain.com

# Optional: Debug Configuration
DEBUG_EMAILS=false
```

## Getting Your API Keys

### Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a project
2. Navigate to Settings > API
3. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### Resend Setup

1. Go to [resend.com](https://resend.com) and create an account
2. Verify your domain in the Resend dashboard
3. Go to API Keys and create a new key
4. Copy the API key → `RESEND_API_KEY`

## Domain Configuration

Update the email configuration for your domain:

- **Email From Address**: `noreply@your-domain.com`
- **App URL**: `https://your-domain.com`
- **Invite Links**: `https://your-domain.com/invite/{inviteId}`
- **Login Links**: `https://your-domain.com/login`

## Email Templates

### Invitation Email

The system sends invitation emails when users are invited to environments:

```html
Subject: You're invited to join [Environment Name] Hi [User Name], [Manager
Name] has invited you to join [Environment Name] as a [Role]. Environment:
[Environment Name] Role: [Role] Permissions: [List of permissions] Click the
link below to accept this invitation: [Secure Accept Link] This invitation
expires on [Expiration Date]. If you have any questions, please contact [Manager
Email]. Best regards, The Grady ReSellOps Team
```

### Notification Emails

The system can send various notification emails:

- **Product Status Changes**: When product status is updated
- **New Sales**: When products are sold
- **Inventory Alerts**: When stock is low
- **Member Activity**: Team member activity reports

## Testing Email Integration

After setting up the environment variables:

1. Start the development server: `npm run dev`
2. Navigate to any environment's members page
3. Use the "Invite Member" functionality to test email sending
4. Check your email for the invitation

## Email Service Configuration

### Resend Configuration

The email service is configured in `src/lib/email/email-service.ts`:

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, html: string) {
   try {
      const { data, error } = await resend.emails.send({
         from: process.env.EMAIL_FROM_ADDRESS!,
         to: [to],
         subject: subject,
         html: html,
      });

      if (error) {
         console.error("Email send error:", error);
         throw error;
      }

      return data;
   } catch (error) {
      console.error("Email service error:", error);
      throw error;
   }
}
```

### Email Templates

Email templates are defined in `src/lib/email/email-templates.ts`:

```typescript
export function generateInvitationEmail(data: {
   userName: string;
   managerName: string;
   environmentName: string;
   role: string;
   acceptLink: string;
   expirationDate: string;
   managerEmail: string;
}) {
   return `
    <html>
      <body>
        <h2>You're invited to join ${data.environmentName}</h2>
        <p>Hi ${data.userName},</p>
        <p>${data.managerName} has invited you to join ${data.environmentName} as a ${data.role}.</p>
        <p><a href="${data.acceptLink}">Accept Invitation</a></p>
        <p>This invitation expires on ${data.expirationDate}.</p>
      </body>
    </html>
  `;
}
```

## Security Notes

- Never commit `.env.local` to version control
- Keep your API keys secure and rotate them regularly
- Use different API keys for development and production
- Monitor your Resend usage to avoid unexpected charges
- Verify your domain in Resend to improve deliverability

## Production Deployment

For production deployment:

1. Set up environment variables in your hosting platform
2. Ensure your domain is verified in Resend
3. Update DNS records if needed
4. Test email functionality in production environment
5. Monitor email delivery rates and bounce rates

## Troubleshooting

### Common Issues

1. **"Email not sent" errors**
   - Check RESEND_API_KEY is correct
   - Verify EMAIL_FROM_ADDRESS is verified in Resend
   - Check Resend dashboard for delivery status

2. **"Invalid from address" errors**
   - Ensure EMAIL_FROM_ADDRESS matches verified domain
   - Check domain verification in Resend dashboard
   - Update DNS records if needed

3. **"Rate limit exceeded" errors**
   - Check Resend usage limits
   - Implement rate limiting in your application
   - Contact Resend support if needed

### Debug Mode

Enable debug mode to log email details:

```env
DEBUG_EMAILS=true
```

This will log email content to the console for testing purposes.

## Best Practices

### Email Deliverability

- Use verified domains for sending emails
- Implement proper SPF and DKIM records
- Monitor bounce rates and spam complaints
- Use consistent branding in email templates

### User Experience

- Send emails from recognizable addresses
- Include clear call-to-action buttons
- Provide contact information for support
- Test emails across different email clients

### Security

- Validate email addresses before sending
- Use secure links for sensitive actions
- Implement rate limiting to prevent abuse
- Log email activities for audit purposes

## Conclusion

The email system provides reliable communication for user invitations and
notifications. Proper setup ensures good deliverability and user experience.

### Key Features

- ✅ Reliable email delivery with Resend
- ✅ Customizable email templates
- ✅ Secure invitation links
- ✅ Email tracking and monitoring
- ✅ Production-ready configuration
