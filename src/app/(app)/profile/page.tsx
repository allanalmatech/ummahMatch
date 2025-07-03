import { redirect } from 'next/navigation'

export default function ProfilePage() {
  // In a real app, you would check if the user has a profile
  // and show it. If not, redirect to create.
  // For now, we always redirect to the edit page.
  redirect('/profile/edit')
}
