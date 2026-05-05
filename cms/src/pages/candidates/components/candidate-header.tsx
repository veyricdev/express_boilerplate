import { Users } from 'lucide-react'

interface CandidateHeaderProps {
  total: number
}

export function CandidateHeader({ total }: CandidateHeaderProps) {
  return (
    <div>
      <h1 className='text-2xl font-bold tracking-tight flex items-center gap-2'>
        <Users size={22} /> Ứng viên
      </h1>
      <p className='text-muted-foreground text-sm'>Quản lý hồ sơ ứng viên — Tổng: {total}</p>
    </div>
  )
}
