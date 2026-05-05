import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { departmentService } from '@/services/department.service'
import { Department } from '@/types'
import { PERM_DEPARTMENTS_READ } from '@shared/constants/permissions'
import { usePermission } from '@/hooks/use-permission'
import { toast } from 'sonner'
import { DepartmentHeader } from './components/department-header'
import { DepartmentTable } from './components/department-table'
import { DepartmentDialog, DeptFormState } from './components/department-dialog'

export default function DepartmentsPage() {
  const queryClient = useQueryClient()
  const { has } = usePermission()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<DeptFormState>({ name: '', description: '', isActive: true })

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentService.findAll(),
    enabled: has(PERM_DEPARTMENTS_READ),
    select: (d: any) => (Array.isArray(d) ? d : d?.data || []),
  })

  const createMutation = useMutation({
    mutationFn: () => departmentService.create({ name: formData.name, description: formData.description || undefined, isActive: formData.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      setIsDialogOpen(false)
      toast.success('Đã tạo phòng ban')
    },
    onError: (e: any) => toast.error(e?.message || 'Không thể tạo phòng ban'),
  })

  const updateMutation = useMutation({
    mutationFn: () => departmentService.update(editingId!, { name: formData.name, description: formData.description || undefined, isActive: formData.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      setIsDialogOpen(false)
      toast.success('Đã cập nhật phòng ban')
    },
    onError: (e: any) => toast.error(e?.message || 'Không thể cập nhật'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => departmentService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      toast.success('Đã xóa phòng ban')
    },
    onError: () => toast.error('Không thể xóa phòng ban'),
  })

  const handleOpenAdd = () => {
    setEditingId(null)
    setFormData({ name: '', description: '', isActive: true })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (dept: Department) => {
    setEditingId(dept.id)
    setFormData({ name: dept.name, description: dept.description || '', isActive: dept.isActive ?? true })
    setIsDialogOpen(true)
  }

  const handleSubmit = () => {
    if (editingId) {
      updateMutation.mutate()
    } else {
      createMutation.mutate()
    }
  }

  return (
    <div className='p-8 space-y-8 max-w-(--breakpoint-2xl) w-full mx-auto animate-in fade-in duration-500'>
      <DepartmentHeader onAdd={handleOpenAdd} />

      <div className='bg-card rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md border-muted/50'>
        <DepartmentTable 
          departments={departments as Department[]} 
          isLoading={isLoading} 
          onEdit={handleOpenEdit} 
          deleteMutation={deleteMutation} 
        />
      </div>

      <DepartmentDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        editingId={editingId} 
        formData={formData} 
        setFormData={setFormData} 
        onSubmit={handleSubmit} 
        isPending={createMutation.isPending || updateMutation.isPending} 
      />
    </div>
  )
}
