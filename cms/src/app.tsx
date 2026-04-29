import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/components/theme-provider'
import { router } from './routes'
import './index.css'

const queryClient = new QueryClient()

createRoot(document.getElementById('cms-root')!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <TooltipProvider>
        <RouterProvider router={router} />
        <Toaster position='top-right' richColors closeButton />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
)
