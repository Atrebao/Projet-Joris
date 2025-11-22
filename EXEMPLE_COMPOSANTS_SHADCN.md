# 🎨 Exemples de Composants avec shadcn/ui

## 1. Carte d'Offre Streaming (Client)

```tsx
// src/components/client/offre-card.tsx
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, User } from "lucide-react"
import { formatPrice } from "@/lib/utils"

interface OffreCardProps {
  offre: {
    id: number
    nomService: string
    imageService: string
    categorie: string
    prixVente: number
    duree: number
    typeCompte: string
    partenaire: {
      nomBoutique: string
      ville: string
    }
  }
  onSelect: (id: number) => void
}

export function OffreCard({ offre, onSelect }: OffreCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={offre.imageService}
          alt={offre.nomService}
          className="w-full h-full object-cover"
        />
        <Badge className="absolute top-2 right-2">
          {offre.categorie}
        </Badge>
      </div>

      {/* Contenu */}
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold">{offre.nomService}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <User className="h-3 w-3" />
              {offre.partenaire.nomBoutique} • {offre.partenaire.ville}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{offre.duree} mois</span>
          </div>
          <Badge variant="secondary">{offre.typeCompte}</Badge>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-primary">
            {formatPrice(offre.prixVente)}
          </p>
          <p className="text-xs text-muted-foreground">
            Soit {formatPrice(offre.prixVente / offre.duree)}/mois
          </p>
        </div>
        <Button onClick={() => onSelect(offre.id)}>
          Souscrire
        </Button>
      </CardFooter>
    </Card>
  )
}
```

## 2. Formulaire de Paiement (Client)

```tsx
// src/components/client/payment-form.tsx
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { CreditCard, Smartphone } from "lucide-react"

const formSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  prenoms: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  telephone: z.string().min(10, "Numéro invalide"),
  modePaiement: z.enum(["MOBILE_MONEY", "CARTE_BANCAIRE"]),
  acceptConditions: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les conditions",
  }),
})

export function PaymentForm({ offre, onSubmit }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: "",
      prenoms: "",
      email: "",
      telephone: "",
      modePaiement: "MOBILE_MONEY",
      acceptConditions: false,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informations personnelles */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Informations personnelles</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="nom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="Votre nom" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prenoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénoms</FormLabel>
                  <FormControl>
                    <Input placeholder="Vos prénoms" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@exemple.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="telephone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input placeholder="+225 XX XX XX XX XX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Mode de paiement */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Mode de paiement</h3>
          
          <FormField
            control={form.control}
            name="modePaiement"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-2 gap-4"
                  >
                    <Label
                      htmlFor="mobile"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary"
                    >
                      <RadioGroupItem value="MOBILE_MONEY" id="mobile" className="sr-only" />
                      <Smartphone className="mb-3 h-6 w-6" />
                      <span className="font-medium">Mobile Money</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        Orange, MTN, Moov, Wave
                      </span>
                    </Label>

                    <Label
                      htmlFor="card"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary"
                    >
                      <RadioGroupItem value="CARTE_BANCAIRE" id="card" className="sr-only" />
                      <CreditCard className="mb-3 h-6 w-6" />
                      <span className="font-medium">Carte Bancaire</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        Visa, Mastercard
                      </span>
                    </Label>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Conditions */}
        <FormField
          control={form.control}
          name="acceptConditions"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  J'accepte les{" "}
                  <a href="/conditions" className="text-primary hover:underline">
                    conditions d'utilisation
                  </a>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Submit */}
        <Button type="submit" className="w-full" size="lg">
          Procéder au paiement • {formatPrice(offre.prixVente)}
        </Button>
      </form>
    </Form>
  )
}
```

## 3. Dashboard Stats (Partenaire)

```tsx
// src/components/partenaire/dashboard-stats.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, ShoppingBag, DollarSign } from "lucide-react"

interface DashboardStatsProps {
  stats: {
    chiffreAffaires: number
    totalVentes: number
    totalClients: number
    totalOffres: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: "Chiffre d'affaires",
      value: formatPrice(stats.chiffreAffaires),
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Ventes",
      value: stats.totalVentes,
      icon: ShoppingBag,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Clients",
      value: stats.totalClients,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Offres actives",
      value: stats.totalOffres,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                +12% par rapport au mois dernier
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
```

## 4. Formulaire Création Offre (Partenaire)

```tsx
// src/components/partenaire/offre-form.tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const offreSchema = z.object({
  nomService: z.string().min(3, "Minimum 3 caractères"),
  categorie: z.enum(["FILMS_SERIES", "MUSIQUE", "GAMING", "EBOOKS", "SPORT"]),
  description: z.string().optional(),
  imageService: z.string().url("URL invalide"),
  prixOriginal: z.number().min(0),
  prixVente: z.number().min(0),
  duree: z.number().min(1).max(12),
  typeCompte: z.string(),
  quantiteDisponible: z.number().min(0),
})

export function OffreForm({ onSubmit, defaultValues }) {
  const form = useForm({
    resolver: zodResolver(offreSchema),
    defaultValues: defaultValues || {
      nomService: "",
      categorie: "FILMS_SERIES",
      description: "",
      imageService: "",
      prixOriginal: 0,
      prixVente: 0,
      duree: 1,
      typeCompte: "Standard",
      quantiteDisponible: 0,
    },
  })

  const prixOriginal = form.watch("prixOriginal")
  const prixVente = form.watch("prixVente")
  const marge = prixVente - prixOriginal

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informations de base */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="nomService"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du service</FormLabel>
                <FormControl>
                  <Input placeholder="Netflix, Spotify, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categorie"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="FILMS_SERIES">Films & Séries</SelectItem>
                    <SelectItem value="MUSIQUE">Musique</SelectItem>
                    <SelectItem value="GAMING">Gaming</SelectItem>
                    <SelectItem value="EBOOKS">E-books</SelectItem>
                    <SelectItem value="SPORT">Sport</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Décrivez votre offre..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageService"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL de l'image</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tarification */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-semibold">Tarification</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="prixOriginal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prix original (XOF)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prixVente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prix de vente (XOF)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {marge > 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                💰 Votre marge: <span className="font-bold">{formatPrice(marge)}</span>
              </p>
            </div>
          )}
        </div>

        {/* Détails */}
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="duree"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée (mois)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="typeCompte"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de compte</FormLabel>
                <FormControl>
                  <Input placeholder="Standard, Premium..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantiteDisponible"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantité</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          Créer l'offre
        </Button>
      </form>
    </Form>
  )
}
```

## 5. Tableau des Clients (Partenaire)

```tsx
// src/components/partenaire/clients-table.tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

export function ClientsTable({ clients }) {
  return (
    <Table>
      <TableCaption>Liste de vos clients</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Téléphone</TableHead>
          <TableHead>Date d'inscription</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id}>
            <TableCell className="font-medium">
              {client.nom} {client.prenoms}
            </TableCell>
            <TableCell>{client.email}</TableCell>
            <TableCell>{client.telephone}</TableCell>
            <TableCell>{formatDate(client.dateCreation)}</TableCell>
            <TableCell>
              <Badge variant={client.isActive ? "default" : "secondary"}>
                {client.isActive ? "Actif" : "Inactif"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

Ces exemples montrent comment utiliser shadcn/ui pour créer des interfaces modernes et professionnelles !
