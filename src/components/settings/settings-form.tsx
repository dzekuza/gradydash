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
import { useToast } from '@/hooks/use-toast'
import { updateProfile, UpdateProfileData } from '@/lib/db/profiles/update-profile'
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
  Loader2
} from 'lucide-react'

interface SettingsFormProps {
  initialProfile?: any
}

export function SettingsForm({ initialProfile }: SettingsFormProps) {
  const [profile, setProfile] = useState<any>(initialProfile)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    firstName: initialProfile?.first_name || '',
    lastName: initialProfile?.last_name || '',
    email: initialProfile?.email || '',
    bio: initialProfile?.bio || '',
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const updateData: UpdateProfileData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        full_name: `${formData.firstName} ${formData.lastName}`,
        bio: formData.bio
      }

      const result = await updateProfile(updateData)
      
      if (result.success) {
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been successfully updated.',
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update profile.',
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
    setFormData({
      firstName: initialProfile?.first_name || '',
      lastName: initialProfile?.last_name || '',
      email: initialProfile?.email || '',
      bio: initialProfile?.bio || '',
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
    
    toast({
      title: 'Settings Reset',
      description: 'Settings have been reset to default values.',
    })
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleResetDefaults}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button size="sm" onClick={handleSaveProfile} disabled={isSaving}>
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
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
