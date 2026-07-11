"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)
    setMessage("")

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage("Account created successfully! You can now log in.")

    setTimeout(() => {
      router.push(`/login?next=${encodeURIComponent(searchParams.get("next") || "/")}`)
    }, 1500)
  }

  return (
    <form
      onSubmit={handleRegister}
      className="bg-zinc-900 p-8 rounded-xl w-full max-w-md space-y-5"
    >
      <h1 className="text-3xl text-white font-bold">
        Create Account
      </h1>

      {message && (
        <div className="rounded border border-emerald-500 bg-emerald-500/20 p-3 text-emerald-300">
          {message}
        </div>
      )}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded bg-zinc-800 p-3 text-white"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded bg-zinc-800 p-3 text-white"
      />

      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 rounded bg-emerald-500 p-3 font-bold hover:bg-emerald-600"
        >
          {loading ? "Creating..." : "Register"}
        </button>

        <Link
          href="/"
          className="flex-1 rounded bg-zinc-700 p-3 text-center font-bold text-white hover:bg-zinc-600"
        >
          Cancel
        </Link>
      </div>

      <p className="text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-emerald-400 hover:underline"
        >
          Login
        </Link>
      </p>
    </form>
  )
}
