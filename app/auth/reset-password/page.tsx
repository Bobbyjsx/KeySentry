import ResetPasswordForm from '@/components/auth/ResetPasswordForm'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

export default function ResetPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-canvas">
      <Suspense fallback={<Loader2 className="animate-spin text-white w-8 h-8" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
