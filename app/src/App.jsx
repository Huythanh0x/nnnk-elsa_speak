import { useState } from 'react'
import { getSession, clearSession } from './lib/storage'
import AuthModal from './components/AuthModal'
import Profile from './components/Profile'
import StudySetForm from './components/StudySetForm'

export default function App() {
  const [session, setSession] = useState(() => getSession())

  function handleAuth(tokens) {
    setSession(tokens)
  }

  function handleLogout() {
    clearSession()
    setSession(null)
  }

  return (
    <>
      <header className="bg-surface border-b border-[#2d2d35] px-6 py-3 flex items-center justify-between">
        <h1 className="text-base font-semibold text-zinc-100">ELSA Study Set Seeder</h1>
        <img
          src="https://d1t11jpd823i7r.cloudfront.net/homepage/exp-logo.svg"
          alt="ELSA"
          className="h-8 w-auto"
        />
      </header>

      {!session && <AuthModal onAuth={handleAuth} />}

      {session && (
        <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          <section>
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Account</h2>
            <div className="bg-surface border border-[#2d2d35] rounded-xl px-4 py-3">
              <Profile profile={session.profile} onLogout={handleLogout} />
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">New study set</h2>
            <StudySetForm session={session} />
          </section>
        </main>
      )}
    </>
  )
}
