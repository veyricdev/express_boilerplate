import { Info, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { usePermission } from '@/hooks/use-permission'
import { PERM_SETTINGS_WRITE } from '@shared/constants/permissions'
import type { Setting } from '@/services/setting.service'

interface SettingControlProps {
  setting: Setting
  value: string
  onChange: (val: string) => void
  onDelete: (key: string) => void
}

export function SettingControl({ setting, value, onChange, onDelete }: SettingControlProps) {
  const permission = usePermission()

  const LabelSection = () => (
    <div className='flex items-center justify-between mb-2'>
      <div className='flex items-center gap-2'>
        <Label htmlFor={setting.key} className='text-sm font-medium'>
          {setting.label}
        </Label>
        {setting.description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className='size-4 text-muted-foreground' />
              </TooltipTrigger>
              <TooltipContent>
                <p className='max-w-xs text-sm'>{setting.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {!setting.isSystem && permission.has(PERM_SETTINGS_WRITE) && (
        <Button
          variant='ghost'
          size='icon'
          className='size-6 text-destructive hover:text-destructive hover:bg-destructive/10'
          onClick={() => onDelete(setting.key)}
        >
          <Trash2 className='size-4' />
        </Button>
      )}
    </div>
  )

  if (setting.type === 'BOOLEAN') {
    return (
      <div className='space-y-2'>
        <LabelSection />
        <div className='flex items-center'>
          <Switch
            id={setting.key}
            checked={value === 'true'}
            onCheckedChange={(v: boolean) => onChange(v ? 'true' : 'false')}
            disabled={!permission.has(PERM_SETTINGS_WRITE)}
          />
          <span className='ml-3 text-sm text-muted-foreground'>{value === 'true' ? 'Bật' : 'Tắt'}</span>
        </div>
      </div>
    )
  }

  if (setting.type === 'IMAGE') {
    return (
      <div className='space-y-2'>
        <LabelSection />
        <Input
          id={setting.key}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder='https://example.com/image.png'
          className='font-mono text-xs h-10! rounded-xl bg-muted/20 border-muted-foreground/10 focus:bg-background transition-all'
          disabled={!permission.has(PERM_SETTINGS_WRITE)}
        />
        {value && (
          <img
            src={value}
            alt={setting.label}
            className='h-16 w-auto rounded-md border object-contain bg-muted/30 p-1'
            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
          />
        )}
      </div>
    )
  }

  if (setting.type === 'JSON') {
    return (
      <div className='space-y-2'>
        <LabelSection />
        <Textarea
          id={setting.key}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className='font-mono text-xs rounded-xl bg-muted/20 border-muted-foreground/10 focus:bg-background transition-all'
          disabled={!permission.has(PERM_SETTINGS_WRITE)}
        />
      </div>
    )
  }

  // Default: TEXT
  return (
    <div className='space-y-2'>
      <LabelSection />
      <Input
        id={setting.key}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='h-10! rounded-xl bg-muted/20 border-muted-foreground/10 focus:bg-background transition-all'
        disabled={!permission.has(PERM_SETTINGS_WRITE)}
      />
    </div>
  )
}
