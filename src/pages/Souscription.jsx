import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Pagination from '@mui/material/Pagination'
import { Search, ShoppingCart } from 'lucide-react'
import { useSouscriptionStore } from '../store/souscription'
import { etatSouscriptionsListe, getUserProfil, HOMEADMIN, statutPaiementsListe } from '../Utils/Utils'
import {
  Button,
  Card,
  DataTable,
  Input,
  LoadingState,
  PageHeader,
  Select,
  ServiceLogo,
  StatusBadge,
  formatFCFA
} from '../components/saas/SaasPrimitives'

export default function Souscription() {
  const navigate = useNavigate()
  const [inputs, setInputs] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [statut, setStatut] = useState('')
  const [etat, setEtat] = useState('')
  const itemsPerPage = 8
  const souscriptionStore = useSouscriptionStore()
  const isLoading = souscriptionStore.loading

  useEffect(() => {
    if (!getUserProfil()) navigate(`${HOMEADMIN}/login`)
  }, [navigate])

  useEffect(() => {
    souscriptionStore.getAllData('', '', '')
  }, [])

  const filteredData = () => {
    souscriptionStore.getAllData(statut, etat, inputs)
    setCurrentPage(1)
  }

  const source = souscriptionStore.data || []
  const currentData = useMemo(
    () => source.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [source, currentPage]
  )
  const totalPages = Math.ceil(source.length / itemsPerPage)

  if (isLoading) return <LoadingState label="Chargement des souscriptions..." />

  return (
    <>
      <PageHeader
        title="Souscriptions"
        description={`${source.length} souscription(s) trouvée(s).`}
      />

      <Card className="p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_auto]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Rechercher une souscription..."
              value={inputs}
              onChange={(event) => setInputs(event.target.value)}
            />
          </label>
          <Select name="statut" value={statut} onChange={(event) => setStatut(event.target.value)}>
            <option value="">Statut paiement</option>
            {statutPaiementsListe.map((item, index) => (
              <option key={index} value={item.value}>{item.libelle}</option>
            ))}
          </Select>
          <Select name="etat" value={etat} onChange={(event) => setEtat(event.target.value)}>
            <option value="">État souscription</option>
            {etatSouscriptionsListe.map((item, index) => (
              <option key={index} value={item.value}>{item.libelle}</option>
            ))}
          </Select>
          <Button onClick={filteredData}>
            <Search className="h-4 w-4" />
            Filtrer
          </Button>
        </div>
      </Card>

      <DataTable
        data={currentData}
        emptyLabel="Aucune souscription trouvée"
        columns={[
          {
            key: 'client',
            label: 'Client',
            render: (item) => (
              <div className="flex items-center gap-3">
                <ServiceLogo name={item?.user?.nom || item?.client?.nom || item?.emailClient || 'Client'} size="sm" />
                <div>
                  <div className="font-medium text-foreground">
                    {[item?.user?.prenoms || item?.client?.prenoms, item?.user?.nom || item?.client?.nom].filter(Boolean).join(' ') || 'Client'}
                  </div>
                  <div className="text-xs text-muted-foreground">{item?.user?.email || item?.client?.email || item?.emailClient || '-'}</div>
                </div>
              </div>
            )
          },
          { key: 'offre', label: 'Offre', render: (item) => item?.abonnement?.nom || item?.offrePartenaire?.nom || '-' },
          { key: 'reference', label: 'Référence', render: (item) => <span className="font-mono text-xs">{item.reference || '-'}</span> },
          { key: 'montant', label: 'Montant', render: (item) => <span className="font-medium">{formatFCFA(item.montant || 0)}</span> },
          { key: 'paiement', label: 'Paiement', render: (item) => <StatusBadge status={item.statutPaiement || item.status} /> },
          { key: 'etat', label: 'État', render: (item) => <StatusBadge status={item.etatSouscription || (item.isLivred ? 'LIVRE' : 'EN_ATTENTE')} /> },
          { key: 'date', label: 'Date', render: (item) => item.dateCreation ? new Date(item.dateCreation).toLocaleDateString('fr-FR') : '-' }
        ]}
      />

      {source.length > itemsPerPage && (
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
    </>
  )
}
