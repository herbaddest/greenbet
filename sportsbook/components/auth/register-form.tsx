"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff, Check } from "lucide-react"
import { supabase } from "@/lib/supabase"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"

const USER_TYPES = [
  { value: "sports-bettor", label: "Sports Bettor" },
  { value: "casino-player", label: "Casino Player" },
  { value: "agent-affiliate", label: "Agent / Affiliate" },
] as const

export default function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [userType, setUserType] = useState<string>("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setMessage("")

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (!agreedToTerms) {
      setError("You must agree to the Terms & Conditions and Privacy Policy.")
      return
    }

    setLoading(true)

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone,
          user_type: userType || null,
        },
      },
    })

    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    setMessage("Account created successfully! You can now log in.")

    setTimeout(() => {
      router.push(`/login?next=${encodeURIComponent(searchParams.get("next") || "/")}`)
    }, 1500)
  }

  async function handleGoogleSignUp() {
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
      onSubmit={handleRegister}
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
        <p className="text-sm font-medium text-emerald-500">Create your account</p>
      </div>

      {error && (
        <div className="rounded border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          {message}
        </div>
      )}

      {/* Google sign up */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignUp}
        disabled={googleLoading}
        className="w-full gap-2 rounded-full border-zinc-700 bg-transparent py-6 font-bold text-white hover:bg-zinc-900"
      >
        <GoogleIcon />
        {googleLoading ? "Redirecting..." : "Sign up with Google"}
      </Button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-800" />
        <span className="text-xs uppercase tracking-wide text-zinc-600">or</span>
        <div className="h-px flex-1 bg-zinc-800" />
      </div>

      {/* Name */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-zinc-300">
            First Name
          </Label>
          <Input
            id="firstName"
            placeholder="John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="border-0 border-b border-zinc-700 rounded-none bg-transparent px-0 text-white placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:border-emerald-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-zinc-300">
            Last Name
          </Label>
          <Input
            id="lastName"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="border-0 border-b border-zinc-700 rounded-none bg-transparent px-0 text-white placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:border-emerald-500"
          />
        </div>
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-zinc-300">
          Number
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="(+254) 700 000 000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="border-0 border-b border-zinc-700 rounded-none bg-transparent px-0 text-white placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:border-emerald-500"
        />
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

      {/* Passwords */}
      <div className="grid grid-cols-2 gap-4">
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
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-zinc-300">
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="border-0 border-b border-zinc-700 rounded-none bg-transparent px-0 pr-7 text-white focus-visible:ring-0 focus-visible:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* User type */}
      <div className="space-y-3">
        <Label className="text-zinc-300">Account type (optional)</Label>
        <RadioGroup value={userType} onValueChange={setUserType} className="space-y-2">
          {USER_TYPES.map((type) => (
            <div key={type.value} className="flex items-center gap-2">
              <RadioGroupItem
                value={type.value}
                id={type.value}
                className="border-zinc-600 text-emerald-500"
              />
              <Label htmlFor={type.value} className="font-normal text-zinc-400">
                {type.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Terms */}
      <div className="flex items-start gap-2">
        <Checkbox
          id="terms"
          checked={agreedToTerms}
          onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
          className="mt-0.5 border-zinc-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
        />
        <Label htmlFor="terms" className="font-normal leading-snug text-zinc-400">
          I have read and agreed to the{" "}
          <Link href="/terms" className="text-emerald-500 hover:underline">
            Terms &amp; Conditions
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-emerald-500 hover:underline">
            Privacy Policy
          </Link>
        </Label>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-emerald-500 py-6 font-bold text-black hover:bg-emerald-400"
      >
        {loading ? "Creating..." : "Register"}
      </Button>

      <p className="text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="text-emerald-500 hover:underline">
          Login
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