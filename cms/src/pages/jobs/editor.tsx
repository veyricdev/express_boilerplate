import { PERM_JOBS_UPDATE, PERM_JOBS_WRITE } from '@shared/constants/permissions'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { usePermission } from '@/hooks/use-permission'
import { departmentService } from '@/services/department.service'
import { CreateJobData, jobService } from '@/services/job.service'
import { Department, Job, JobLevel, JobStatus, JobType } from '@/types'

const isNew = (id?: string) => !id || id === 'new'

export default function JobEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { has } = usePermission()
  const creating = isNew(id)

  const [form, setForm] = useState<CreateJobData>({
    title: '',
    description: '',
    type: JobType.FULL_TIME,
    level: JobLevel.MID,
    status: JobStatus.DRAFT,
  })

  const { data: existingJob } = useQuery({
    queryKey: ['jobs', id],
    queryFn: () => jobService.findOne(Number(id)),
    enabled: !creating,
  })

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentService.findAll(),
    select: (d: any) => (Array.isArray(d) ? d : d?.data || []),
  })

  useEffect(() => {
    if (existingJob) {
      const j = existingJob as any as Job
      setForm({
        title: j.title,
        departmentId: j.departmentId || null,
        description: j.description,
        requirements: j.requirements || '',
        benefits: j.benefits || '',
        salaryRange: j.salaryRange || '',
        location: j.location || '',
        type: j.type,
        level: j.level,
        status: j.status,
        deadline: j.deadline || null,
      })
    }
  }, [existingJob])

  const saveMutation = useMutation({
    mutationFn: () => {
      const data = { ...form, departmentId: form.departmentId || undefined }
      if (creating) return jobService.create(data)
      return jobService.update(Number(id), data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success(creating ? 'Đã tạo tin tuyển dụng' : 'Đã cập nhật tin tuyển dụng')
      navigate('/jobs')
    },
    onError: (e: any) => toast.error(e?.message || 'Có lỗi xảy ra'),
  })

  const canSave = creating ? has(PERM_JOBS_WRITE) : has(PERM_JOBS_UPDATE)

  const update = <K extends keyof CreateJobData>(key: K, value: CreateJobData[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  return (
    <div className='p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-(--breakpoint-2xl) w-full mx-auto'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='sm' asChild className='h-9 px-3'>
            <Link to='/jobs'>
              <ArrowLeft size={16} className='mr-1' /> Quay lại
            </Link>
          </Button>
          <h1 className='text-xl font-bold'>{creating ? 'Tạo tin tuyển dụng mới' : 'Chỉnh sửa tin tuyển dụng'}</h1>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={!form.title.trim() || !form.description.trim() || !canSave || saveMutation.isPending}
            className='h-9 rounded-full px-5 shadow-sm'
          >
            <Save size={16} className='mr-2' />
            {creating ? 'Tạo tin' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8'>
        {/* Main Content */}
        <div className='lg:col-span-2 space-y-6'>
          <div className='bg-card rounded-2xl border shadow-sm p-6 space-y-6'>
            {/* Title */}
            <div className='space-y-1.5'>
              <Label className='text-muted-foreground uppercase text-[11px] font-bold tracking-wider'>Tiêu đề *</Label>
              <Input
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder='VD: Senior Backend Developer'
                className='h-12 text-lg font-medium'
              />
            </div>

            {/* Location + Salary + Deadline */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
              <div className='space-y-1.5'>
                <Label className='text-muted-foreground uppercase text-[11px] font-bold tracking-wider'>Địa điểm</Label>
                <Input
                  value={form.location || ''}
                  onChange={(e) => update('location', e.target.value)}
                  placeholder='VD: Hà Nội'
                />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-muted-foreground uppercase text-[11px] font-bold tracking-wider'>Mức lương</Label>
                <Input
                  value={form.salaryRange || ''}
                  onChange={(e) => update('salaryRange', e.target.value)}
                  placeholder='VD: 15-25 triệu'
                />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-muted-foreground uppercase text-[11px] font-bold tracking-wider'>Hạn nộp</Label>
                <Input
                  type='date'
                  value={form.deadline?.split('T')[0] || ''}
                  onChange={(e) => update('deadline', e.target.value || null)}
                />
              </div>
            </div>

            {/* Description */}
            <div className='space-y-1.5'>
              <Label className='text-muted-foreground uppercase text-[11px] font-bold tracking-wider'>Mô tả công việc *</Label>
              <Textarea
                rows={8}
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder='Mô tả chi tiết công việc...'
                className='resize-y'
              />
            </div>

            {/* Requirements */}
            <div className='space-y-1.5'>
              <Label className='text-muted-foreground uppercase text-[11px] font-bold tracking-wider'>Yêu cầu</Label>
              <Textarea
                rows={6}
                value={form.requirements || ''}
                onChange={(e) => update('requirements', e.target.value)}
                placeholder='Yêu cầu ứng viên...'
              />
            </div>

            {/* Benefits */}
            <div className='space-y-1.5'>
              <Label className='text-muted-foreground uppercase text-[11px] font-bold tracking-wider'>Quyền lợi</Label>
              <Textarea
                rows={6}
                value={form.benefits || ''}
                onChange={(e) => update('benefits', e.target.value)}
                placeholder='Quyền lợi được hưởng...'
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          <div className='bg-card rounded-2xl border shadow-sm p-5 space-y-6'>
            <h3 className='font-bold uppercase tracking-wider text-sm border-b pb-3 mb-2'>
              Phân loại & Trạng thái
            </h3>
            
            <div className='space-y-1.5'>
              <Label className='text-muted-foreground uppercase text-[11px] font-bold tracking-wider'>Trạng thái</Label>
              <Select value={form.status} onValueChange={(v) => update('status', v as JobStatus)}>
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='DRAFT'>Nháp</SelectItem>
                  <SelectItem value='OPEN'>Đang tuyển</SelectItem>
                  <SelectItem value='CLOSED'>Đã đóng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-muted-foreground uppercase text-[11px] font-bold tracking-wider'>Phòng ban</Label>
              <Select
                value={form.departmentId?.toString() || 'NONE'}
                onValueChange={(v) => update('departmentId', v === 'NONE' ? null : Number(v))}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Chọn phòng ban' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='NONE'>Không thuộc phòng ban</SelectItem>
                  {(departments as Department[]).map((d) => (
                    <SelectItem key={d.id} value={d.id.toString()}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-muted-foreground uppercase text-[11px] font-bold tracking-wider'>Cấp bậc</Label>
              <Select value={form.level} onValueChange={(v) => update('level', v as JobLevel)}>
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='INTERN'>Thực tập</SelectItem>
                  <SelectItem value='JUNIOR'>Junior</SelectItem>
                  <SelectItem value='MID'>Middle</SelectItem>
                  <SelectItem value='SENIOR'>Senior</SelectItem>
                  <SelectItem value='LEAD'>Lead</SelectItem>
                  <SelectItem value='MANAGER'>Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-muted-foreground uppercase text-[11px] font-bold tracking-wider'>Loại hình</Label>
              <Select value={form.type} onValueChange={(v) => update('type', v as JobType)}>
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='FULL_TIME'>Toàn thời gian</SelectItem>
                  <SelectItem value='PART_TIME'>Bán thời gian</SelectItem>
                  <SelectItem value='CONTRACT'>Hợp đồng</SelectItem>
                  <SelectItem value='INTERNSHIP'>Thực tập</SelectItem>
                  <SelectItem value='REMOTE'>Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
