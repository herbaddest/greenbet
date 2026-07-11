"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)
    setMessage("")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setMessage(error.message)
      return
    }

    router.push(searchParams.get("next") || "/")
  }

  return (
    <form
      onSubmit={handleLogin}
      className="bg-zinc-900 p-8 rounded-xl w-full max-w-md space-y-5"
    >
      <h1 className="text-3xl text-white font-bold">
        Welcome Back
      </h1>

      {message && (
        <div className="rounded border border-red-500 bg-red-500/20 p-3 text-red-300">
          {message}
        </div>
      )}

      <input
        className="w-full rounded bg-zinc-800 p-3 text-white"
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="w-full rounded bg-zinc-800 p-3 text-white"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 rounded bg-emerald-500 p-3 font-bold hover:bg-emerald-600"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <Link
          href="/"
          className="flex-1 rounded bg-zinc-700 p-3 text-center font-bold text-white hover:bg-zinc-600"
        >
          Cancel
        </Link>
      </div>

      <p className="text-center text-sm text-zinc-400">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="text-emerald-400 hover:underline"
        >
          Register
        </Link>
      </p>
    </form>
  )
}
