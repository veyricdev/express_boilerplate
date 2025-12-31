import { Agent } from 'node:https'
import { Telegraf } from 'telegraf'
import { A_SECOND } from '~/constants'
import { env } from './env'

const bot = new Telegraf(env.TELE_BOT_TOKEN, {
  handlerTimeout: 500 * A_SECOND,
  telegram: {
    agent: new Agent({ keepAlive: false }),
  },
})
export default bot
