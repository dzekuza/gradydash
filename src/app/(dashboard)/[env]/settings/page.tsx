import { redirect } from 'next/navigation'

export default function SettingsPage() {
  // For now, redirect to demo settings since this is the main implementation
  redirect('/demo/settings')
}
