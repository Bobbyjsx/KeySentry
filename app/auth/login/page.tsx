import LoginForm from '@/components/auth/LoginForm'

export default async function LoginPage() {

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-50 dark:bg-gray-900">
      <LoginForm />
    </div>
  )
}
