import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Copy, Eye, EyeOff, KeyRound, Loader, Mail, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'
import { souscriptionsAPI } from '../lib/api'

const formatFCFA = (value) => `${new Intl.NumberFormat('fr-FR').format(Number(value) || 0)} FCFA`

export default function MesAbonnements() {
  const navigate = useNavigate()
  const [abonnements, setAbonnements] = useState([])
  const [loading, setLoading] = useState(true)
  const [emailInput, setEmailInput] = useState('')
  const [showGate, setShowGate] = useState(false)
  const [visiblePasswords, setVisiblePasswords] = useState({})
  const [copied, setCopied] = useState('')

  useEffect(() => {
    const email = localStorage.getItem('customerEmail')
    if (!email) {
      setShowGate(true)
      setLoading(false)
      return
    }
    setEmailInput(email)
    fetchAbonnements(email)
  }, [])

  const fetchAbonnements = async (email) => {
    setLoading(true)
    try {
      const { data } = await souscriptionsAPI.getByEmail(email)
      setAbonnements((data || []).map((sub) => ({
        id: sub.id,
        reference: sub.reference || '-',
        title: sub.abonnement?.nom || 'Abonnement',
        duration: `${sub.duree || sub.abonnement?.duree || 1} ${sub.periode || 'mois'}`,
        amount: sub.montant || 0,
        date: sub.dateCreation ? new Date(sub.dateCreation).toLocaleDateString('fr-FR') : '-',
        status: sub.isLivred ? 'active' : sub.statutPaiement === 'SUCCES' ? 'pending' : 'failed',
        login: sub.login,
        password: sub.password,
        delivered: sub.isLivred
      })))
    } catch (error) {
      console.error(error)
      toast.error('Impossible de charger vos abonnements')
      setAbonnements([])
    } finally {
      setLoading(false)
      setShowGate(false)
    }
  }

  const active = abonnements.filter((item) => item.status === 'active')
  const totalSpent = useMemo(() => abonnements.reduce((sum, item) => sum + Number(item.amount || 0), 0), [abonnements])

  const submitEmail = (event) => {
    event.preventDefault()
    const email = emailInput.trim()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Veuillez entrer une adresse email valide')
      return
    }
    localStorage.setItem('customerEmail', email)
    fetchAbonnements(email)
  }

  const copyValue = async (value, label) => {
    if (!value) return
    await navigator.clipboard.writeText(value)
    setCopied(`${label}-${value}`)
    toast.success(`${label} copié`)
    setTimeout(() => setCopied(''), 1200)
  }

  if (showGate) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <form onSubmit={submitEmail} className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold">Espace Client</h1>
              <p className="text-sm text-muted-foreground">Entrez l'email utilisé pendant l'achat.</p>
            </div>
          </div>
          <input
            type="email"
            value={emailInput}
            onChange={(event) => setEmailInput(event.target.value)}
            placeholder="vous@exemple.com"
            className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none"
          />
          <button className="mt-4 h-11 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
            Accéder à mes abonnements
          </button>
          <button type="button" onClick={() => navigate('/')} className="mt-2 h-10 w-full rounded-lg border border-border text-sm font-medium">
            Retour au marketplace
          </button>
        </form>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] space-y-8 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Espace Client</h1>
          <p className="text-muted-foreground">Gérez vos abonnements et retrouvez vos identifiants.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={KeyRound} value={active.length} label="Abonnements actifs" />
          <StatCard icon={Wallet} value={formatFCFA(totalSpent)} label="Total dépensé" accent="accent" />
          <StatCard icon={Check} value={abonnements.length} label="Transactions" accent="blue" />
        </div>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Mes abonnements actifs</h2>
          {abonnements.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center">
              <p className="font-medium">Aucun abonnement trouvé.</p>
              <button onClick={() => navigate('/')} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                Voir le marketplace
              </button>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {abonnements.map((sub) => (
                <article key={sub.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                      {sub.title.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold">{sub.title}</h3>
                      <p className="text-sm text-muted-foreground">{sub.duration}</p>
                    </div>
                    <Status status={sub.status} />
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <Credential label="Identifiant" value={sub.login} copied={copied} onCopy={copyValue} />
                    <Credential
                      label="Mot de passe"
                      value={sub.password}
                      secret
                      revealed={visiblePasswords[sub.id]}
                      copied={copied}
                      onCopy={copyValue}
                      onReveal={() => setVisiblePasswords((prev) => ({ ...prev, [sub.id]: !prev[sub.id] }))}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm">
                    <span className="font-mono text-xs text-muted-foreground">{sub.reference}</span>
                    <span className="font-semibold">{formatFCFA(sub.amount)}</span>
                    <span className="text-muted-foreground">{sub.date}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, value, label, accent = 'primary' }) {
  const styles = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent text-accent-foreground',
    blue: 'bg-blue-100 text-blue-700'
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[accent]}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  )
}

function Credential({ label, value, secret, revealed, copied, onCopy, onReveal }) {
  const display = !value ? 'En attente de livraison' : secret && !revealed ? '••••••••••' : value
  const copiedKey = `${label}-${value}`

  return (
    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <p className="min-w-0 flex-1 truncate font-mono text-sm">{display}</p>
        {secret && value && (
          <button onClick={onReveal} className="rounded-md p-1 text-muted-foreground hover:bg-muted" aria-label={revealed ? 'Masquer' : 'Révéler'}>
            {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
        {value && (
          <button onClick={() => onCopy(value, label)} className="rounded-md p-1 text-muted-foreground hover:bg-muted" aria-label="Copier">
            {copied === copiedKey ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  )
}

function Status({ status }) {
  const config = {
    active: 'border-primary/20 bg-primary/10 text-primary',
    pending: 'border-accent-foreground/20 bg-accent text-accent-foreground',
    failed: 'border-destructive/20 bg-destructive/10 text-destructive'
  }
  const label = status === 'active' ? 'Actif' : status === 'pending' ? 'En attente' : 'Échoué'
  return <span className={`rounded-md border px-2 py-1 text-xs font-medium ${config[status] || config.pending}`}>{label}</span>
}
