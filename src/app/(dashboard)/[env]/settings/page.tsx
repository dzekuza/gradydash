'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { updateProfile, UpdateProfileData } from '@/lib/db/profiles/update-profile'
import { updateEnvironment, UpdateEnvironmentData } from '@/lib/db/environments/update-environment'
import { getCurrentProfile } from '@/lib/db/profiles/get-profile'
import { 
  User, 
  Building2, 
  Bell, 
  Shield, 
  Palette, 
  Database,
  Users,
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  Loader2,
  Trash2,
  AlertTriangle
} from 'lucide-react'

interface EnvironmentSettingsPageProps {
  params: {
    env: string
  }
}

export default function EnvironmentSettingsPage({ params }: EnvironmentSettingsPageProps) {
  const [profile, setProfile] = useState<any>(null)
  const [environment, setEnvironment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    envName: '',
    envDescription: '',
    autoRefresh: true,
    showAnalytics: true,
    emailNotifications: true,
    productStatusChanges: true,
    newProductAlerts: false,
    salesNotifications: true,
    darkMode: false,
    compactView: false,
    showAvatars: true
  })
  const { toast } = useToast()

  // Load profile and environment data on component mount
  useEffect(() => {
    async function loadData() {
      try {
        // Load profile data
        const profileData = await getCurrentProfile()
        if (profileData) {
          setProfile(profileData)
          setFormData(prev => ({
            ...prev,
            firstName: profileData.first_name || '',
            lastName: profileData.last_name || '',
            email: profileData.email || '',
            bio: profileData.bio || ''
          }))
        }

        // Load environment data from the current environment
        // We'll get this from the URL params and fetch the environment data
        const response = await fetch(`/api/environments/${params.env}`)
        if (response.ok) {
          const envData = await response.json()
          setEnvironment(envData)
          setFormData(prev => ({
            ...prev,
            envName: envData.name || '',
            envDescription: envData.description || ''
          }))
        }
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load settings data.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [params.env, toast])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveAll = async () => {
    setIsSaving(true)
    try {
      // Save profile data
      const profileUpdateData: UpdateProfileData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        full_name: `${formData.firstName} ${formData.lastName}`,
        bio: formData.bio
      }

      const profileResult = await updateProfile(profileUpdateData)
      
      // Save environment data
      let environmentResult: { success: boolean; error?: string } = { success: true }
      if (environment?.id) {
        const envUpdateData: UpdateEnvironmentData = {
          name: formData.envName,
          description: formData.envDescription
        }
        environmentResult = await updateEnvironment(environment.id, envUpdateData)
      }
      
      if (profileResult.success && environmentResult.success) {
        toast({
          title: 'Settings Updated',
          description: 'Your profile and environment settings have been successfully updated.',
        })
      } else {
        const errors = []
        if (!profileResult.success) errors.push('Profile: ' + profileResult.error)
        if (!environmentResult.success) errors.push('Environment: ' + environmentResult.error)
        
        toast({
          title: 'Error',
          description: 'Failed to update some settings: ' + errors.join(', '),
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetDefaults = () => {
    setFormData(prev => ({
      ...prev,
      envName: environment?.name || '',
      envDescription: environment?.description || '',
      autoRefresh: true,
      showAnalytics: true,
      emailNotifications: true,
      productStatusChanges: true,
      newProductAlerts: false,
      salesNotifications: true,
      darkMode: false,
      compactView: false,
      showAvatars: true
    }))
    
    toast({
      title: 'Settings Reset',
      description: 'Settings have been reset to default values.',
    })
  }

  const handleRemoveEnvironment = async () => {
    setIsDeleting(true)
    try {
      if (!environment?.id) {
        throw new Error('Environment ID not found')
      }

      if (!profile?.id) {
        throw new Error('User profile not found')
      }

      // Import the delete function dynamically to avoid SSR issues
      const { deleteEnvironment } = await import('@/lib/db/environments/delete-environment')
      await deleteEnvironment(environment.id, profile.id)
      
      toast({
        title: 'Environment Removed',
        description: 'The environment has been successfully removed.',
      })
      
      // Redirect to dashboard
      window.location.href = '/dashboard'
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove environment.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your environment settings and preferences.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleResetDefaults}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button size="sm" onClick={handleSaveAll} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>
              Update your personal information and account details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  placeholder="John" 
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  placeholder="Doe" 
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="john@example.com" 
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Environment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Environment Settings
            </CardTitle>
            <CardDescription>
              Configure your environment preferences and behavior.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="envName">Environment Name</Label>
              <Input 
                id="envName" 
                value={formData.envName}
                onChange={(e) => handleInputChange('envName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="envDescription">Description</Label>
              <Textarea 
                id="envDescription" 
                placeholder="Describe your environment..."
                value={formData.envDescription}
                onChange={(e) => handleInputChange('envDescription', e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-refresh Data</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically refresh data every 30 seconds
                </p>
              </div>
              <Switch 
                checked={formData.autoRefresh}
                onCheckedChange={(checked) => handleInputChange('autoRefresh', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Display analytics charts and metrics
                </p>
              </div>
              <Switch 
                checked={formData.showAnalytics}
                onCheckedChange={(checked) => handleInputChange('showAnalytics', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure how you receive notifications and alerts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch 
                checked={formData.emailNotifications}
                onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Product Status Changes</Label>
                <p className="text-sm text-muted-foreground">
                  Notify when product status changes
                </p>
              </div>
              <Switch 
                checked={formData.productStatusChanges}
                onCheckedChange={(checked) => handleInputChange('productStatusChanges', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Product Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Alert when new products are added
                </p>
              </div>
              <Switch 
                checked={formData.newProductAlerts}
                onCheckedChange={(checked) => handleInputChange('newProductAlerts', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sales Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Notify when products are sold
                </p>
              </div>
              <Switch 
                checked={formData.salesNotifications}
                onCheckedChange={(checked) => handleInputChange('salesNotifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Manage your account security and access controls.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Session Timeout</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically log out after inactivity
                </p>
              </div>
              <Badge variant="outline">8 hours</Badge>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Current Role</Label>
              <div className="flex items-center gap-2">
                <Badge variant="default">Environment User</Badge>
                <span className="text-sm text-muted-foreground">
                  Manage your environment settings
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance Settings
            </CardTitle>
            <CardDescription>
              Customize the look and feel of your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <Switch 
                checked={formData.darkMode}
                onCheckedChange={(checked) => handleInputChange('darkMode', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Compact View</Label>
                <p className="text-sm text-muted-foreground">
                  Use more compact table layouts
                </p>
              </div>
              <Switch 
                checked={formData.compactView}
                onCheckedChange={(checked) => handleInputChange('compactView', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Avatars</Label>
                <p className="text-sm text-muted-foreground">
                  Display user avatars in the interface
                </p>
              </div>
              <Switch 
                checked={formData.showAvatars}
                onCheckedChange={(checked) => handleInputChange('showAvatars', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Manage your data and export options.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="w-full">
                <Database className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <Button variant="outline" className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset Data
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Environment Status</Label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Active</Badge>
                <span className="text-sm text-muted-foreground">
                  Environment is running normally
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Management
            </CardTitle>
            <CardDescription>
              Manage team members and their permissions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Members</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline">You</Badge>
                <span className="text-sm text-muted-foreground">
                  Manage team members from the Members page
                </span>
              </div>
            </div>
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Manage Team Members
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible and destructive actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Remove Environment</Label>
              <p className="text-sm text-muted-foreground">
                Permanently delete this environment and all its data. This action cannot be undone.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  {isDeleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  {isDeleting ? 'Removing...' : 'Remove Environment'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the{' '}
                    <strong>{environment?.name || 'environment'}</strong> and remove all its data
                    including products, members, and settings.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRemoveEnvironment}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, remove environment
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
