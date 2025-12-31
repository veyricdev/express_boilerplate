import path from 'node:path'
import { createLogger, format, transports } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { ONE_KB } from '~/constants'

const logger = createLogger({
	format: format.combine(
		format.splat(),
		// Time format for log
		format.timestamp({
			format: 'YYYY-MM-DD HH:mm:ss',
		}),
		// set the format of the log
		format.printf((log) => {
			// if the log is an error, display the stack trace but do not display the log message
			if (log.stack) return `[${log.timestamp}] [${log.level}] ${log.stack}`
			return `[${log.timestamp}] [${log.level}] ${log.message}`
		})
	),
	transports: [
		new transports.File({
			filename: path.join(__dirname, '..', '..', 'logs', 'logs.log'),
			maxsize: 5 * ONE_KB * ONE_KB,
		}),
		new DailyRotateFile({
			filename: path.join(__dirname, '..', '..', 'logs/date', '%DATE%.log'),
			datePattern: 'YYYY-MM-DD',
		}),
	],
})

export default logger
