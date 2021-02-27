import config from '@config'
import pino from 'pino'
import pinoColada from 'pino-colada'

export interface Logger {
  info(message: string, ...args: any[]): void
  warn(message: string, ...args: any[]): void
  error(message: string, ...args: any[]): void
  fatal(message: string, ...args: any[]): void
}

class PinoLogger implements Logger {
  private pinoLogger: pino.BaseLogger

  private defaultSettings: pino.LoggerOptions = {
    prettyPrint: config.isDevelopment,
    prettifier: config.isDevelopment ? pinoColada : null,
  }

  constructor(level: string) {
    this.pinoLogger = pino({
      ...this.defaultSettings,
      level: config.isTesting ? 'silent' : level,
    })
  }

  info(message: string, ...args: any[]) {
    this.pinoLogger.info(message, ...args)
  }

  warn(message: string, ...args: any[]) {
    this.pinoLogger.warn(message, ...args)
  }

  error(message: string, ...args: any[]) {
    this.pinoLogger.error(message, ...args)
  }

  fatal(message: string, ...args: any[]) {
    this.pinoLogger.fatal(message, ...args)
  }
}

export default new PinoLogger('debug')
