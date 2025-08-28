import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from '@/components/login-form'

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Grady ReSellOps
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          
            <LoginForm />
          
        </div>
      </div>
      <div className="relative hidden bg-black lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md">
            {/* Testimonial Quote */}
            <div className="relative">
              <div className="absolute -left-4 -top-4 text-6xl text-gray-400 opacity-50">
                &quot;
              </div>
              <blockquote className="text-white text-2xl leading-relaxed font-medium">
                Finally, I can track consigned products with zero stress.
              </blockquote>
            </div>
            
            {/* User Info */}
            <div className="flex items-center justify-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">JD</span>
              </div>
              <div className="text-left">
                <div className="text-white font-medium">@gradyuser</div>
                <div className="text-gray-400 text-sm">Verified Partner</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
