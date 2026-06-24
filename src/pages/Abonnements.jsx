import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Package } from 'lucide-react'
import Pagination from '@mui/material/Pagination'
import AjouterModifierAbonnement from '../components/AjouterModifierAbonnement'
import { useAbonnementStore } from '../store/abonnement'
import { getUserProfil, HOMEADMIN } from '../Utils/Utils'
import {
  Button,
  Card,
  DataTable,
  Input,
  LoadingState,
  PageHeader,
  ServiceLogo,
  StatusBadge,
  formatFCFA
} from '../components/saas/SaasPrimitives'

export default function Abonnements() {
  const [inputs, setInputs] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  const navigate = useNavigate()
  const abonnementStore = useAbonnementStore()
  const isLoading = abonnementStore.loading

  useEffect(() => {
    if (!getUserProfil()) navigate(`${HOMEADMIN}/login`)
  }, [navigate])

  useEffect(() => {
    abonnementStore.getAllData()
  }, [])

  const filtered = useMemo(() => {
    const source = abonnementStore.data || []
    const query = inputs.toLowerCase()
    return source.filter((item) => `${item.nom || ''} ${item.categorie || ''}`.toLowerCase().includes(query))
  }, [abonnementStore.data, inputs])

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const currentData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const showModalAdd = () => {
    document.getElementById('add-abonnement')?.showModal()
  }

  if (isLoading) return <LoadingState label="Chargement des abonnements..." />

  return (
    <>
      <PageHeader
        title="Abonnements"
        description={`${filtered.length} abonnement(s) dans le catalogue.`}
        action={
          <Button onClick={showModalAdd}>
            <Plus className="h-4 w-4" />
            Ajouter un abonnement
          </Button>
        }
      />

      <Card className="p-4">
        <label className="relative block max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Rechercher un abonnement..."
            value={inputs}
            onChange={(event) => {
              setInputs(event.target.value)
              setCurrentPage(1)
            }}
          />
        </label>
      </Card>

      <DataTable
        data={currentData}
        emptyLabel="Aucun abonnement trouvé"
        columns={[
          {
            key: 'abonnement',
            label: 'Abonnement',
            render: (item) => (
              <div className="flex items-center gap-3">
                <ServiceLogo name={item.nom} image={item.image} size="sm" />
                <div>
                  <div className="font-medium text-foreground">{item.nom || '-'}</div>
                  <div className="text-xs text-muted-foreground">{item.categorie || 'Catalogue'}</div>
                </div>
              </div>
            )
          },
          { key: 'description', label: 'Description', render: (item) => <span className="line-clamp-1 text-muted-foreground">{item.description || '-'}</span> },
          { key: 'forfaits', label: 'Forfaits', render: (item) => item.forfaits?.length || item.forfaitOffres?.length || 0 },
          { key: 'prix', label: 'Prix', render: (item) => formatFCFA(item.forfaits?.[0]?.prix || item.forfaitOffres?.[0]?.forfait?.prix || 0) },
          { key: 'statut', label: 'Statut', render: (item) => <StatusBadge status={item.isDeleted ? 'SUSPENDU' : 'ACTIF'} /> }
        ]}
      />

      {filtered.length > itemsPerPage && (
        <div className="flex justify-center py-2">
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            variant="outlined"
            color="primary"
            shape="rounded"
          />
        </div>
      )}

      <dialog id="add-abonnement" className="modal">
        <div className="modal-box border border-border bg-card text-foreground">
          <div className="modal-action mt-0">
            <div className="mr-auto flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Package className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold">Enregistrer un abonnement</h2>
                <p className="text-sm text-muted-foreground">Ajoutez une offre au catalogue.</p>
              </div>
            </div>
            <form method="dialog">
              <button className="h-9 w-9 rounded-lg border border-border hover:bg-muted">x</button>
            </form>
          </div>
          <AjouterModifierAbonnement />
        </div>
      </dialog>
    </>
  )
}
