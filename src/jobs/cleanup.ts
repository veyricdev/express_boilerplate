import cron from 'node-cron'
import { prisma } from '~/configs/db'

// Runs at 00:00 every day
cron.schedule('0 0 * * *', async () => {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  await prisma.loginHistory.deleteMany({
    where: {
      loggedAt: { lt: thirtyDaysAgo },
    },
  })
  console.log('Cleaned up old login history')
})
