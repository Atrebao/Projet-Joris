import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, Sun, ShieldCheck, Store, Users } from 'lucide-react'
import { resetStorage } from '../../Utils/Utils'

export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function Card({ className = '', children }) {
  return <div className={cn('rounded-xl border border-border bg-card text-card-foreground shadow-sm', className)}>{children}</div>
}

export function Button({ className = '', variant = 'primary', size = 'md', children, ...props }) {
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'border border-border bg-card text-foreground hover:bg-muted',
    ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
    danger: 'bg-destructive text-white hover:bg-destructive/90'
  }
  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-sm',
    icon: 'h-9 w-9 p-0'
  }

  return (
    <button
      className={cn('inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50', variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}

export function Badge({ children, tone = 'primary', className = '' }) {
  const tones = {
    primary: 'border-primary/20 bg-primary/10 text-primary',
    success: 'border-primary/20 bg-primary/10 text-primary',
    warning: 'border-accent-foreground/20 bg-accent text-accent-foreground',
    danger: 'border-destructive/20 bg-destructive/10 text-destructive',
    muted: 'border-border bg-muted text-muted-foreground'
  }

  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium leading-none', tones[tone], className)}>
      {children}
    </span>
  )
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={cn('h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring/20', className)}
      {...props}
    />
  )
}

export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={cn('h-10 rounded-lg border border-input bg-card px-3 text-sm font-medium outline-none transition focus:ring-2 focus:ring-ring/20', className)}
      {...props}
    >
      {children}
    </select>
  )
}

export function PageHeader({ title, description, action }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function KpiCard({ label, value, icon: Icon, trend, accent = 'primary' }) {
  const accents = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent text-accent-foreground',
    chart3: 'bg-chart-3/10 text-chart-3',
    chart4: 'bg-chart-4/10 text-chart-4'
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', accents[accent])}>
          <Icon className="h-5 w-5" />
        </span>
        {trend && <span className="text-xs font-medium text-primary">{trend}</span>}
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </Card>
  )
}

export function ServiceLogo({ name = 'Service', color, size = 'md', image }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs rounded-lg',
    md: 'h-11 w-11 text-sm rounded-xl',
    lg: 'h-14 w-14 text-base rounded-2xl'
  }

  if (image) {
    return <img src={image} alt={name} className={cn('shrink-0 object-cover shadow-sm', sizes[size])} />
  }

  return (
    <span
      aria-hidden
      className={cn('inline-flex shrink-0 items-center justify-center font-bold text-white shadow-sm', sizes[size])}
      style={{ backgroundColor: color || serviceColor(name) }}
    >
      {initials(name)}
    </span>
  )
}

export function StatusBadge({ status }) {
  const normalized = String(status || '').toUpperCase()
  if (['ACTIF', 'SUCCES', 'SUCCESS', 'LIVRE', 'LIVREE', 'VALIDATED'].includes(normalized)) return <Badge tone="success">SUCCES</Badge>
  if (['EN_ATTENTE', 'PENDING', 'ATTENTE'].includes(normalized)) return <Badge tone="warning">EN ATTENTE</Badge>
  if (['SUSPENDU', 'FAILED', 'ECHEC', 'INACTIF'].includes(normalized)) return <Badge tone="danger">ECHEC</Badge>
  return <Badge tone="muted">{status || '-'}</Badge>
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <Card className="flex min-h-64 flex-col items-center justify-center border-dashed p-8 text-center">
      {Icon && (
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Icon className="h-6 w-6" />
        </span>
      )}
      <h3 className="font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </Card>
  )
}

export function LoadingState({ label = 'Chargement...' }) {
  return (
    <div className="flex min-h-80 items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export function DataTable({ columns, data, emptyLabel = 'Aucune donnée', keyField = 'id' }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {columns.map((column) => (
                <th key={column.key} className={cn('px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground', column.className)}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row, index) => (
              <tr key={row[keyField] || index} className="transition-colors hover:bg-muted/40">
                {columns.map((column) => (
                  <td key={column.key} className={cn('px-4 py-3 text-sm', column.cellClassName)}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && <div className="py-12 text-center text-sm text-muted-foreground">{emptyLabel}</div>}
    </Card>
  )
}

export function DashboardShell({ brand, brandIcon: BrandIcon, role, nav, user, children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const logout = () => {
    resetStorage()
    navigate('/')
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <BrandIcon className="h-4 w-4" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-bold text-sidebar-foreground">{brand}</p>
          <p className="text-[11px] text-muted-foreground">{role}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {nav.map((item) => {
          const Icon = item.icon
          const active = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
            {user.initials}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{role}</p>
          </div>
          <button onClick={logout} className="rounded-md p-1.5 text-muted-foreground transition hover:bg-sidebar-accent hover:text-sidebar-foreground" title="Déconnexion">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">{sidebar}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-sidebar-border bg-sidebar">{sidebar}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-12 items-center gap-2 border-b border-border bg-card px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen((open) => !open)} aria-label="Menu">
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
          <span className="text-sm font-semibold">{brand}</span>
        </div>
        <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}

export function SaasTopBar({ active = 'admin' }) {
  const navigate = useNavigate()
  const items = [
    { id: 'client', label: 'Vue Client', icon: Users, to: '/' },
    { id: 'partner', label: 'Vue Partenaire', icon: Store, to: '/partenaire' },
    { id: 'admin', label: 'Vue Admin', icon: ShieldCheck, to: '/backoffice' }
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4">
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Store className="h-4 w-4" />
          </span>
          <span className="text-sm font-black tracking-tight text-foreground">
            Aboné<span className="text-primary">Plus</span>
          </span>
          <span className="ml-2 rounded-md bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">
            DÉMO
          </span>
        </button>

        <nav className="hidden rounded-2xl border border-border bg-background p-1 shadow-sm md:flex">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.to)}
              className={cn(
                'inline-flex h-8 items-center gap-2 rounded-xl px-4 text-sm transition',
                active === item.id
                  ? 'bg-card font-semibold text-foreground shadow-sm'
                  : 'font-medium text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground transition hover:bg-muted" aria-label="Thème clair">
          <Sun className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}

export function formatFCFA(value) {
  return `${new Intl.NumberFormat('fr-FR').format(Number(value) || 0)} FCFA`
}

export function initials(value = '') {
  const words = String(value).trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return 'R'
  return words.slice(0, 2).map((word) => word[0]).join('').toUpperCase()
}

function serviceColor(value = '') {
  const colors = ['#0f9f82', '#4f46e5', '#e11d48', '#f59e0b', '#0284c7', '#7c3aed']
  const sum = String(value).split('').reduce((total, char) => total + char.charCodeAt(0), 0)
  return colors[sum % colors.length]
}
