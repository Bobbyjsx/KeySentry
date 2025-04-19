import SignupForm from '@/components/auth/SignupForm'

export default async function SignupPage() {

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-50 dark:bg-gray-900">
      <SignupForm />
    </div>
  )
}
