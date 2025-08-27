# Environment Setup Guide

This guide explains how to set up and manage environments in the Grady ReSellOps
dashboard.

## Overview

Environments are isolated workspaces where users can manage their products,
locations, and team members. Each environment has its own data and user access
controls.

## Creating Environments

### Admin Access Required

Only system administrators can create new environments. Regular users must be
invited to existing environments.

### Steps to Create an Environment

1. **Login as Admin**: Access the system with admin credentials
2. **Navigate to Admin Dashboard**: Go to `/admin`
3. **Create Environment**: Use the environment creation form
4. **Configure Settings**: Set name, description, and initial settings
5. **Invite Users**: Add team members with appropriate roles

## Environment Management

### Environment Properties

Each environment has the following properties:

- **Name**: Display name for the environment
- **Slug**: URL-friendly identifier (auto-generated from name)
- **Description**: Optional description of the environment's purpose
- **Created By**: User who created the environment
- **Created At**: Timestamp of creation
- **Updated At**: Last modification timestamp

### Environment Access

- **Creator Access**: Environment creators automatically get full access
- **Member Access**: Users must be invited to access environments
- **Admin Access**: System admins can access all environments
- **Data Isolation**: Each environment's data is completely isolated

## User Roles in Environments

### Available Roles

1. **Reseller Manager** (`reseller_manager`)
   - Full environment management
   - Can invite/remove team members
   - Can manage all products and locations
   - Can view analytics and reports

2. **Reseller Staff** (`reseller_staff`)
   - Can manage products and locations
   - Can view analytics
   - Cannot invite/remove team members
   - Limited administrative functions

### Role Permissions

| Permission           | Manager | Staff |
| -------------------- | ------- | ----- |
| View Products        | ✅      | ✅    |
| Create Products      | ✅      | ✅    |
| Edit Products        | ✅      | ✅    |
| Delete Products      | ✅      | ❌    |
| Manage Locations     | ✅      | ✅    |
| View Analytics       | ✅      | ✅    |
| Invite Members       | ✅      | ❌    |
| Remove Members       | ✅      | ❌    |
| Environment Settings | ✅      | ❌    |

## Environment Switching

### How It Works

Users can switch between environments they have access to using the environment
switcher in the sidebar.

### Keyboard Shortcuts

- **⌘1-9**: Quick switch to environments (numbered in the switcher)
- **⌘K**: Open environment switcher search

### Environment Switcher Features

- **Search**: Type to filter environments
- **Add Environment**: Admin-only button to create new environments
- **Environment Info**: Shows environment name and user role
- **Quick Access**: Recently accessed environments highlighted

## Data Isolation

### Complete Isolation

Each environment maintains complete data isolation:

- **Products**: Environment-specific product inventory
- **Locations**: Environment-specific physical locations
- **Members**: Environment-specific team members
- **Analytics**: Environment-specific metrics and reports
- **Settings**: Environment-specific configurations

### Cross-Environment Access

- Users can access multiple environments
- Data never crosses environment boundaries
- Each environment maintains its own audit trail
- Environment-specific permissions apply

## Environment Settings

### General Settings

- **Environment Name**: Display name (can be updated)
- **Description**: Purpose and scope description
- **Contact Information**: Primary contact details
- **Business Hours**: Operating hours for the environment

### Security Settings

- **Session Timeout**: Automatic logout after inactivity
- **Two-Factor Authentication**: Optional 2FA requirement
- **IP Restrictions**: Optional IP address restrictions
- **Audit Logging**: Track all environment activities

### Notification Settings

- **Email Notifications**: Product status changes
- **Sales Alerts**: New sales notifications
- **Inventory Alerts**: Low stock warnings
- **Member Activity**: Team member activity reports

## Troubleshooting

### Common Issues

1. **"Environment Not Found" Error**
   - Verify the environment slug is correct
   - Check that the environment exists
   - Ensure user has access to the environment

2. **"Access Denied" Error**
   - Verify user has been invited to the environment
   - Check user's role and permissions
   - Contact environment manager for access

3. **"Cannot Create Environment" Error**
   - Verify user has admin privileges
   - Check environment name is unique
   - Ensure all required fields are provided

### Environment Creation Issues

1. **Duplicate Environment Names**
   - Environment names must be unique across the system
   - Use descriptive names to avoid conflicts
   - Consider adding location or date to names

2. **Invalid Environment Slugs**
   - Slugs are auto-generated from environment names
   - Must be URL-friendly (letters, numbers, hyphens only)
   - Cannot start with numbers or special characters

3. **Permission Errors**
   - Only system admins can create environments
   - Regular users must be invited by environment managers
   - Check user's system role and permissions

## Best Practices

### Environment Naming

- Use descriptive, unique names
- Include location or business unit information
- Avoid generic names like "Test" or "Demo"
- Consider adding date or version information

### User Management

- Assign appropriate roles to team members
- Regularly review and update permissions
- Remove access for departed team members
- Use the principle of least privilege

### Data Organization

- Create locations before adding products
- Use consistent naming conventions
- Regularly clean up old or unused data
- Maintain proper product categorization

### Security

- Regularly review user access
- Use strong authentication methods
- Monitor environment activity
- Keep environment information updated

## API Reference

### Environment Object

```typescript
interface Environment {
   id: string;
   name: string;
   slug: string;
   description?: string;
   created_by: string;
   created_at: string;
   updated_at: string;
}
```

### Environment Creation

```typescript
createEnvironment(data: {
  name: string
  description?: string
}): Promise<Environment>
```

### Environment Access

```typescript
getEnvironmentsForUser(userId: string): Promise<Environment[]>
getEnvironmentBySlug(slug: string): Promise<Environment | null>
```

## Conclusion

The environment system provides secure, isolated workspaces for managing resale
operations. Each environment maintains complete data isolation while allowing
users to work across multiple environments as needed.

### Key Benefits

- ✅ Complete data isolation
- ✅ Flexible user management
- ✅ Role-based access control
- ✅ Easy environment switching
- ✅ Secure multi-tenancy
- ✅ Scalable architecture
