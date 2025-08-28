'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { updateProfile, UpdateProfileData } from '@/lib/db/profiles/update-profile'
import { getCurrentProfile } from '@/lib/db/profiles/get-profile'
import { getUserAdminStatus } from '@/lib/db/environments/get-user-admin-status'
import { 
  Settings, 
  User,
  Shield,
  Mail,
  Phone,
  Building,
  Save,
  Loader2,
  AlertTriangle
} from 'lucide-react'

export default function AdminSettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [adminStatus, setAdminStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUnauthorized, setIsUnauthorized] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    fullName: '',
    email: '',
    phone: '',
    companyName: ''
  })
  const { toast } = useToast()
  const router = useRouter()

  // Load profile data and check admin status on component mount
  useEffect(() => {
    async function loadData() {
      try {
        // First check admin status
        const profileData = await getCurrentProfile()
        if (!profileData) {
          router.push('/login')
          return
        }

        const adminData = await getUserAdminStatus(profileData.id)
        if (!adminData.isSystemAdmin) {
          setIsUnauthorized(true)
          setIsLoading(false)
          return
        }

        setAdminStatus(adminData)
        setProfile(profileData)
        setFormData({
          firstName: profileData.first_name || '',
          lastName: profileData.last_name || '',
          fullName: profileData.full_name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          companyName: profileData.company_name || ''
        })
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load profile data.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [toast, router])

  const handleInputChange = (field: string, value: string) => {
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
        full_name: formData.fullName,
        bio: profile?.bio || ''
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

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (isUnauthorized) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-2xl font-bold">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access this page. Only system administrators can view admin settings.
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Profile Settings</h2>
          <p className="text-muted-foreground">
            Manage your admin profile and account settings
          </p>
        </div>
      </div>

      {/* Profile Settings */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input 
                  id="first-name" 
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input 
                  id="last-name" 
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input 
                id="full-name" 
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email address cannot be changed
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input 
                id="company" 
                placeholder="Enter company name"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
              />
            </div>
            <Button 
              onClick={handleSaveProfile} 
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Profile
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Account Settings
            </CardTitle>
            <CardDescription>
              Manage your account preferences and security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <select 
                  id="timezone" 
                  className="w-full p-2 border border-input rounded-md bg-background"
                  defaultValue="UTC"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <select 
                  id="language" 
                  className="w-full p-2 border border-input rounded-md bg-background"
                  defaultValue="en"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notifications">Email Notifications</Label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">System updates and maintenance</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">New partner registrations</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Security alerts</span>
                  </label>
                </div>
              </div>
              <Button className="w-full">Save Preferences</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Manage your account security and access controls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Badge variant="secondary">Not Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Session Management</h4>
                <p className="text-sm text-muted-foreground">
                  View and manage your active sessions
                </p>
              </div>
              <Button variant="outline" size="sm">Manage Sessions</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Password</h4>
                <p className="text-sm text-muted-foreground">
                  Change your account password
                </p>
              </div>
              <Button variant="outline" size="sm">Change Password</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>
            View your account details and status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Account Type</Label>
              <div className="flex items-center gap-2">
                <Badge variant="default">System Administrator</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Account Status</Label>
              <div className="flex items-center gap-2">
                <Badge variant="default">Active</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Member Since</Label>
              <p className="text-sm text-muted-foreground">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Last Updated</Label>
              <p className="text-sm text-muted-foreground">
                {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
