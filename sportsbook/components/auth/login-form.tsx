"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Check } from "lucide-react"
import { supabase } from "@/lib/supabase"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    router.push(searchParams.get("next") || "/")
  }

  async function handleGoogleLogin() {
    setError("")
    setGoogleLoading(true)

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          searchParams.get("next") || "/"
        )}`,
      },
    })

    if (oauthError) {
      setGoogleLoading(false)
      setError(oauthError.message)
    }
  }

  return (
    <form
      onSubmit={handleLogin}
      className="w-full max-w-md space-y-6 rounded-2xl bg-black p-8 border border-zinc-800"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
            <Check size={14} strokeWidth={3} className="text-black" />
          </span>
          <h1 className="text-3xl font-black text-white">
            Green<span className="text-emerald-500">Bet</span>
          </h1>
        </div>
        <p className="text-sm font-medium text-emerald-500">Log in to your account</p>
      </div>

      {error && (
        <div className="rounded border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Google sign in */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="w-full gap-2 rounded-full border-zinc-700 bg-transparent py-6 font-bold text-white hover:bg-zinc-900"
      >
        <GoogleIcon />
        {googleLoading ? "Redirecting..." : "Continue with Google"}
      </Button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-800" />
        <span className="text-xs uppercase tracking-wide text-zinc-600">or</span>
        <div className="h-px flex-1 bg-zinc-800" />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-zinc-300">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border-0 border-b border-zinc-700 rounded-none bg-transparent px-0 text-white placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:border-emerald-500"
        />
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-zinc-300">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-0 border-b border-zinc-700 rounded-none bg-transparent px-0 pr-7 text-white focus-visible:ring-0 focus-visible:border-emerald-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Remember me / forgot password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            id="rememberMe"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
            className="border-zinc-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
          />
          <Label htmlFor="rememberMe" className="font-normal text-zinc-400">
            Remember me
          </Label>
        </div>

        <Link href="/forgot-password" className="text-sm font-medium text-emerald-500 hover:underline">
          Forgot password
        </Link>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-emerald-500 py-6 font-bold text-black hover:bg-emerald-400"
      >
        {loading ? "Logging in..." : "Login"}
      </Button>

      <p className="text-center text-sm text-zinc-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-emerald-500 hover:underline">
          Register
        </Link>
      </p>
    </form>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  )
}