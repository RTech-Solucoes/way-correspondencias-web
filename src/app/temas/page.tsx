'use client'

import {useState} from 'react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Badge} from '@/components/ui/badge'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from '@/components/ui/table'
import {
  ArrowsDownUpIcon,
  FileTextIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon
} from '@phosphor-icons/react'
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import {Label} from '@/components/ui/label'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Tema} from '@/types/temas/types'
import {mockAreas, mockTemas} from '@/lib/mockData'
import {TemaModal} from '@/components/temas/TemaModal'
import {Checkbox} from "@/components/ui/checkbox";
import {ConfirmationDialog} from '@/components/ui/confirmation-dialog'
import PageTitle from '@/components/ui/page-title';

export default function TemasPage() {
  const [temas, setTemas] = useState<Tema[]>(mockTemas)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTema, setSelectedTema] = useState<Tema | null>(null)
  const [showTemaModal, setShowTemaModal] = useState(false)
  const [sortField, setSortField] = useState<keyof Tema | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [filterAreas, setFilterAreas] = useState<string[]>([])
  const [filterTpContagem, setFilterTpContagem] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [temaToDelete, setTemaToDelete] = useState<string | null>(null)

  const handleSort = (field: keyof Tema) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedTemas = [...temas].sort((a, b) => {
    if (!sortField) return 0
    
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    if (aValue === bValue) return 0
    
    const direction = sortDirection === 'asc' ? 1 : -1
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * direction
    }
    
    if (Array.isArray(aValue) && Array.isArray(bValue)) {
      return (aValue.length - bValue.length) * direction
    }
    
    if (aValue < bValue) return -1 * direction
    return 1 * direction
  })

  const getAreasForTema = (idAreas: string[]) => {
    return mockAreas.filter(area => idAreas.includes(area.idArea))
  }

  const filteredTemas = sortedTemas.filter(tema =>
    tema.nmTema.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tema.dsTema.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(tema => {
    const areas = getAreasForTema(tema.idAreas)
    const areaMatch = filterAreas.length === 0 || areas.some(area => filterAreas.includes(area.idArea))
    const tpContagemMatch = !filterTpContagem || tema.tpContagem === filterTpContagem
    return areaMatch && tpContagemMatch
  })


  const handleCreateTema = () => {
    setSelectedTema(null)
    setShowTemaModal(true)
  }

  const handleEditTema = (tema: Tema) => {
    setSelectedTema(tema)
    setShowTemaModal(true)
  }

  const handleDeleteTema = (id: string) => {
    setTemaToDelete(id)
    setShowDeleteDialog(true)
  }

  const confirmDeleteTema = () => {
    if (temaToDelete) {
      setTemas(temas.filter(tema => tema.idTema !== temaToDelete))
    }
    setTemaToDelete(null)
  }

  const handleSaveTema = (tema: Tema) => {
    if (selectedTema) {
      setTemas(prev => prev.map(t => t.idTema === tema.idTema ? tema : t))
    } else {
      setTemas(prev => [...prev, tema])
    }
    setShowTemaModal(false)
    setSelectedTema(null)
  }

  const handleFilterSubmit = () => {
    setShowFilterModal(false)
  }

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <PageTitle />
          <Button
            onClick={handleCreateTema} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Novo Tema
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar por nome ou descrição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
          <Button
            variant="secondary"
            className="h-10 px-4"
            onClick={() => setShowFilterModal(true)}
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort('nmTema')}>
                <div className="flex items-center">
                  Nome
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('dsTema')}>
                <div className="flex items-center">
                  Descrição
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('idAreas')}>
                <div className="flex items-center">
                  Áreas Relacionadas
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('nrDiasPrazo')}>
                <div className="flex items-center">
                  Prazo (dias)
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('tpContagem')}>
                <div className="flex items-center">
                  Tipo de Contagem
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('dtCadastro')}>
                <div className="flex items-center">
                  Data de Cadastro
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTemas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Nenhum tema encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredTemas.map((tema) => {
                const areas = getAreasForTema(tema.idAreas)
                return (
                  <TableRow key={tema.idTema} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{tema.nmTema}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={tema.dsTema}>
                        {tema.dsTema}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-sm">
                        {areas.length === 0 ? (
                          <span className="text-gray-400 text-sm">Nenhuma área</span>
                        ) : (
                          areas.map((area) => (
                            <Badge key={area.idArea} variant="outline" className="text-xs">
                              {area.nmArea}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{tema.nrDiasPrazo}</TableCell>
                    <TableCell>
                      <Badge variant={tema.tpContagem === 'UTEIS' ? 'default' : 'secondary'}>
                        {tema.tpContagem === 'UTEIS' ? 'Úteis' : 'Corridos'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(tema.dtCadastro).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditTema(tema)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteTema(tema.idTema)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Tema Modal */}
      {showTemaModal && (
        <TemaModal
          isOpen={showTemaModal}
          onClose={() => {
            setShowTemaModal(false)
            setSelectedTema(null)
          }}
          onSave={handleSaveTema}
          tema={selectedTema}
        />
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
          <DialogContent className="max-w-sm p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">
                Filtrar Temas
              </DialogTitle>
            </DialogHeader>

            <div>
              <Label htmlFor="areas" className="block text-sm font-medium text-gray-700">
                Áreas Relacionadas
              </Label>
              <div className="mt-2">
                {mockAreas.map(area => (
                  <div key={area.idArea} className="flex items-center">
                    <Checkbox
                      id={`area-${area.idArea}`}
                      checked={filterAreas.includes(area.idArea)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilterAreas(prev => [...prev, area.idArea])
                        } else {
                          setFilterAreas(prev => prev.filter(id => id !== area.idArea))
                        }
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <Label htmlFor={`area-${area.idArea}`} className="ml-2 text-sm cursor-pointer">
                      {area.nmArea}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="tpContagem" className="block text-sm font-medium text-gray-700">
                Tipo de Contagem
              </Label>
              <Select
                value={filterTpContagem?.toString()}
                onValueChange={setFilterTpContagem}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione o tipo de contagem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTEIS">Úteis</SelectItem>
                  <SelectItem value="CORRIDOS">Corridos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                onClick={handleFilterSubmit}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Aplicar Filtros
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Excluir Tema"
        description="Tem certeza que deseja excluir este tema? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={confirmDeleteTema}
      />
    </div>
  )
}