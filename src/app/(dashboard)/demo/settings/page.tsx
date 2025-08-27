

import { SettingsForm } from '@/components/settings/settings-form'
import { getCurrentProfile } from '@/lib/db/profiles/get-profile'

export default async function DemoSettingsPage() {
  // Get the current user's profile data
  const profile = await getCurrentProfile()

  return <SettingsForm initialProfile={profile} />
}
