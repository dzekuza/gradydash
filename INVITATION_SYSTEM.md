# Environment Invitation System

This document describes the invitation system for adding members to environments
in Grady ReSellOps.

## Overview

The invitation system allows environment managers to invite users to join their
environment. Users can accept invitations by creating an account or logging in,
and they'll be automatically assigned to the environment with the specified
role.

## Features

### ✅ Implemented

- **Invite Members**: Environment managers can invite users by email
- **Role Assignment**: Invitations specify the role the user will have
- **Invitation Expiration**: Invitations expire after 7 days
- **Accept Invitations**: Users can accept invitations via a dedicated page
- **Account Creation**: New users can create accounts when accepting invitations
- **Login Integration**: Existing users can log in to accept invitations
- **Permission Checks**: Only authorized users can send invitations
- **Duplicate Prevention**: Prevents duplicate invitations and memberships

### 🚧 TODO

- **Email Notifications**: Send actual email notifications (currently logged to
  console)
- **Email Templates**: Implement proper email templates with branding
- **Invitation Management**: Allow resending/canceling invitations
- **Bulk Invitations**: Invite multiple users at once

## How It Works

### 1. Sending Invitations

1. Navigate to the Members page in any environment
2. Click "Invite Member" button
3. Enter the email address and select a role
4. Submit the form

The system will:

- Validate the invitation data
- Check permissions (only store_manager or admin can invite)
- Check for existing memberships
- Create an invitation record
- Generate an invitation URL
- Log the invitation details (email sending TODO)

### 2. Accepting Invitations

1. User receives invitation (currently via console log)
2. User visits the invitation URL: `/invite/{inviteId}`
3. User can either:
   - Log in with existing account
   - Create a new account
4. System validates the invitation
5. User is added to the environment with the specified role
6. User is redirected to the environment dashboard

## Database Schema

### `environment_invites` Table

```sql
CREATE TABLE environment_invites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  environment_id UUID REFERENCES environments(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role ROLE NOT NULL,
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### RLS Policies

- Users can view invites for environments they're members of
- Users can view invites sent to their email
- Staff and admins can create/update/delete invites

## Testing the System

### 1. Send an Invitation

1. Start the development server: `npm run dev`
2. Navigate to `/demo/members` (demo environment)
3. Click "Invite Member"
4. Enter an email address and select a role
5. Submit the form
6. Check the console for the invitation URL

### 2. Accept an Invitation

1. Copy the invitation URL from the console
2. Open the URL in a new browser window/incognito mode
3. Either:
   - Create a new account with the invited email
   - Log in with an existing account that matches the email
4. The invitation will be accepted and you'll be redirected to the environment

### 3. Verify Membership

1. Navigate to the environment's members page
2. You should see the new member in the "Current Members" section
3. The invitation should no longer appear in "Pending Invitations"

## API Endpoints

### Server Actions

- `inviteMember(formData)` - Create a new invitation
- `acceptInvite(formData)` - Accept an invitation
- `getEnvironmentInvites(environmentId)` - Get pending invitations
- `getEnvironmentMembers(environmentId)` - Get current members
- `getInvite(inviteId)` - Get specific invitation details

### Pages

- `/[env]/members` - Members management page
- `/invite/[id]` - Invitation acceptance page

## Security Considerations

- Invitations are validated against the user's email
- Invitations expire after 7 days
- Only authorized users can send invitations
- RLS policies prevent unauthorized access
- Invitations can only be accepted once

## Future Enhancements

1. **Email Integration**: Integrate with email service (SendGrid, AWS SES, etc.)
2. **Invitation Management**: Add UI for managing pending invitations
3. **Bulk Operations**: Allow inviting multiple users at once
4. **Custom Messages**: Allow custom messages with invitations
5. **Invitation Analytics**: Track invitation acceptance rates
6. **Role Upgrades**: Allow upgrading user roles after invitation
7. **Invitation Templates**: Customizable email templates per environment

## Troubleshooting

### Common Issues

1. **"You do not have permission to invite members"**
   - Ensure the user has store_manager or admin role

2. **"This user is already a member"**
   - Check if the email is already associated with a user in the environment

3. **"Invitation not found"**
   - Verify the invitation ID is correct and hasn't expired

4. **"This invitation was sent to a different email address"**
   - Ensure the user is logged in with the email that received the invitation

### Debugging

- Check browser console for invitation URLs
- Check server logs for invitation creation details
- Verify database records in Supabase dashboard
- Test with different email addresses and roles
