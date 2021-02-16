import config from '@config'
import pino from 'pino'
import pinoColada from 'pino-colada'

export interface Logger {
  info(errorMessage: string): void
  warn(errorMessage: string): void
  error(errorMessage: string): void
  fatal(errorMessage: string): void
}

class PinoLogger implements Logger {
  private pinoLogger: pino.BaseLogger

  private defaultSettings: pino.LoggerOptions = {
    prettyPrint: !config.production,
    prettifier: !config.production ? pinoColada : null,
  }

  constructor(level: string) {
    this.pinoLogger = pino({
      ...this.defaultSettings,
      level: config.testing ? 'silent' : level,
    })
  }

  info(errorMessage: string) {
    this.pinoLogger.info(errorMessage)
  }

  warn(errorMessage: string) {
    this.pinoLogger.warn(errorMessage)
  }

  error(errorMessage: string) {
    this.pinoLogger.error(errorMessage)
  }

  fatal(errorMessage: string) {
    this.pinoLogger.fatal(errorMessage)
  }
}

export default new PinoLogger('debug')
