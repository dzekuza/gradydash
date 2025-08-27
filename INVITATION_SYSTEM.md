# Invitation System Guide

This guide explains how the invitation system works in the Grady ReSellOps
dashboard.

## Overview

The invitation system allows environment managers to invite new users to their
environments with specific roles and permissions.

## How Invitations Work

### Invitation Flow

1. **Manager Creates Invitation**: Environment manager invites a user via email
2. **Email Sent**: System sends invitation email with secure link
3. **User Accepts**: User clicks link and completes registration
4. **Access Granted**: User gets access to the environment with assigned role

### Invitation Components

- **Email Address**: User's email for the invitation
- **Environment**: Target environment for access
- **Role**: User's role in the environment (reseller_manager, reseller_staff)
- **Expiration**: Invitation expires after 7 days
- **Status**: Pending, accepted, or expired

## Creating Invitations

### Who Can Invite

- **Environment Managers**: Can invite users to their environments
- **System Admins**: Can invite users to any environment
- **Regular Staff**: Cannot create invitations

### Steps to Invite

1. **Navigate to Members**: Go to the environment's members page
2. **Click "Invite Member"**: Opens the invitation dialog
3. **Enter Email**: Add the user's email address
4. **Select Role**: Choose appropriate role for the user
5. **Send Invitation**: System sends email with secure link

### Role Selection

#### Reseller Manager

- Full environment management
- Can invite/remove team members
- Can manage all products and locations
- Can view analytics and reports

#### Reseller Staff

- Can manage products and locations
- Can view analytics
- Cannot invite/remove team members
- Limited administrative functions

## Email Templates

### Invitation Email

The invitation email includes:

- **Greeting**: Personalized with manager's name
- **Environment Info**: Name and description of the environment
- **Role Details**: User's assigned role and permissions
- **Accept Link**: Secure link to accept the invitation
- **Expiration**: Clear expiration date and time
- **Contact Info**: Manager's contact information

### Email Content

```
Subject: You're invited to join [Environment Name]

Hi [User Name],

[Manager Name] has invited you to join [Environment Name] as a [Role].

Environment: [Environment Name]
Role: [Role]
Permissions: [List of permissions]

Click the link below to accept this invitation:
[Secure Accept Link]

This invitation expires on [Expiration Date].

If you have any questions, please contact [Manager Email].

Best regards,
The Grady ReSellOps Team
```

## Accepting Invitations

### Invitation Link

- **Secure**: Uses unique token for security
- **One-time Use**: Link becomes invalid after acceptance
- **Expires**: Automatically expires after 7 days
- **Environment-specific**: Links to specific environment

### Acceptance Process

1. **Click Link**: User clicks invitation link in email
2. **Registration**: If new user, completes registration form
3. **Login**: If existing user, logs in to their account
4. **Confirmation**: System confirms invitation acceptance
5. **Access Granted**: User can now access the environment

### Registration for New Users

If the invited user doesn't have an account:

1. **Create Account**: Fill out registration form
2. **Verify Email**: Confirm email address
3. **Set Password**: Create secure password
4. **Accept Invitation**: Automatically accepts the invitation
5. **Access Granted**: User can access the environment

## Managing Invitations

### Viewing Invitations

Environment managers can view all invitations:

- **Pending**: Invitations not yet accepted
- **Accepted**: Successfully accepted invitations
- **Expired**: Invitations past expiration date

### Invitation Status

- **Pending**: Sent but not yet accepted
- **Accepted**: User has accepted the invitation
- **Expired**: Past the 7-day expiration period

### Canceling Invitations

Managers can cancel pending invitations:

1. **View Invitations**: Go to members page
2. **Find Invitation**: Locate the pending invitation
3. **Cancel**: Click cancel button
4. **Confirmation**: Invitation is immediately invalidated

## Security Features

### Invitation Security

- **Unique Tokens**: Each invitation has a unique, secure token
- **Time-limited**: Invitations expire after 7 days
- **One-time Use**: Links become invalid after acceptance
- **Email Verification**: Invitations are tied to specific email addresses

### Access Control

- **Role-based**: Users get specific permissions based on role
- **Environment-scoped**: Access limited to invited environment
- **Audit Trail**: All invitation activities are logged
- **Revocable**: Access can be revoked by managers

## Troubleshooting

### Common Issues

1. **"Invitation Not Found" Error**
   - Check that the invitation link is complete
   - Verify the invitation hasn't expired
   - Ensure the invitation hasn't been used

2. **"Invitation Expired" Error**
   - Invitations expire after 7 days
   - Request a new invitation from the manager
   - Check email for original invitation date

3. **"Email Already Exists" Error**
   - User already has an account with that email
   - User should log in to their existing account
   - Invitation will be automatically accepted

4. **"Access Denied" Error**
   - Verify user has accepted the invitation
   - Check that the invitation is for the correct environment
   - Contact environment manager for assistance

### Email Issues

1. **Invitation Email Not Received**
   - Check spam/junk folder
   - Verify email address is correct
   - Contact manager to resend invitation
   - Check email server settings

2. **Email Link Not Working**
   - Copy the entire link from email
   - Ensure no extra characters or spaces
   - Try opening in different browser
   - Contact support if issue persists

## Best Practices

### For Managers

- **Clear Communication**: Explain the user's role and responsibilities
- **Timely Follow-up**: Check if invitations are accepted
- **Role Assignment**: Assign appropriate roles based on needs
- **Security**: Only invite trusted users

### For Users

- **Quick Response**: Accept invitations promptly
- **Secure Password**: Use strong, unique passwords
- **Contact Manager**: Reach out with any questions
- **Keep Updated**: Maintain current email address

### Security Recommendations

- **Verify Emails**: Double-check email addresses before sending
- **Monitor Access**: Regularly review environment members
- **Remove Access**: Revoke access for departed team members
- **Audit Logs**: Review invitation and access logs regularly

## API Reference

### Invitation Object

```typescript
interface EnvironmentInvite {
   id: string;
   email: string;
   environment_id: string;
   role: "reseller_manager" | "reseller_staff";
   created_by: string;
   created_at: string;
   expires_at: string;
   accepted_at?: string;
   accepted_by?: string;
}
```

### Create Invitation

```typescript
createEnvironmentInvite(data: {
  email: string
  environment_id: string
  role: string
}): Promise<EnvironmentInvite>
```

### Accept Invitation

```typescript
acceptEnvironmentInvite(inviteId: string): Promise<Membership>
```

## Conclusion

The invitation system provides a secure and user-friendly way to add team
members to environments. The system ensures proper access control while
maintaining a smooth user experience.

### Key Features

- ✅ Secure invitation links
- ✅ Role-based access control
- ✅ Email notifications
- ✅ Expiration handling
- ✅ Audit trail
- ✅ Easy management interface
