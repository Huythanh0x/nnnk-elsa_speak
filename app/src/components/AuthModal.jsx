import { useState } from 'react'
import { login } from '../lib/api'
import { saveSession } from '../lib/storage'

const APP_SECRET = 'GU2872002'

export default function AuthModal({ onAuth }) {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [secret, setSecret] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingTokens, setPendingTokens] = useState(null)

  async function handleStep1(e) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) { setError('Please enter email and password.'); return }
    setLoading(true)
    try {
      const tokens = await login(email.trim(), password)
      saveSession(tokens, email.trim(), password)
      setPendingTokens(tokens)
      setStep(2)
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  function handleStep2() {
    setError('')
    if (secret.trim() !== APP_SECRET) {
      setError('Invalid access secret.')
      return
    }
    onAuth(pendingTokens)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-[#2d2d35] rounded-xl p-8 w-full max-w-sm shadow-2xl">
        <img
          src="https://d1t11jpd823i7r.cloudfront.net/homepage/exp-logo.svg"
          alt="ELSA"
          className="h-8 mb-6"
        />
        <h2 className="text-xl font-semibold mb-1">Sign in</h2>

        {error && (
          <div className="mt-3 mb-4 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 text-sm">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleStep1} noValidate className="mt-4 space-y-4">
            <p className="text-sm text-zinc-400 -mt-1 mb-2">Enter your ELSA account credentials</p>
            <div>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed
                         text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Checking…' : 'Continue'}
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-zinc-400 -mt-1 mb-2">Verified. Enter access secret.</p>
            <div className="bg-bg border border-[#2d2d35] rounded-lg px-3 py-2.5 opacity-80">
              <p className="text-xs text-zinc-500 mb-0.5">Email</p>
              <p className="text-sm text-zinc-400 blur-sm select-none">{email}</p>
            </div>
            <div>
              <label htmlFor="secret">Access secret</label>
              <input
                id="secret"
                type="password"
                value={secret}
                onChange={e => setSecret(e.target.value)}
                placeholder="secret"
                onKeyDown={e => e.key === 'Enter' && handleStep2()}
                autoFocus
              />
            </div>
            <button
              type="button"
              onClick={handleStep2}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
