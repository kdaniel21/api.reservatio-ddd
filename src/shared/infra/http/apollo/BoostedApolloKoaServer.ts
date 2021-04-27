import { ApolloServer, Config } from 'apollo-server-koa'
import http from 'http'
import stoppable from 'stoppable'
import net from 'net'
import Koa from 'koa'
import koaCookie from 'koa-cookie'
import logger from '@shared/infra/Logger/logger'
import config from '@config'

export interface ServerInfo {
  address: string
  family: string
  url: string
  port: number | string
  server: http.Server
}

export class BoostedApolloKoaServer extends ApolloServer {
  private httpServer: stoppable.StoppableServer
  private readonly port: number = config.apolloServerPort

  constructor(serverConfig: Config) {
    super(serverConfig)
  }

  async listen(): Promise<ServerInfo> {
    await this._start()

    const koaServer = new Koa().use(koaCookie())

    super.applyMiddleware({ app: koaServer, path: '/', cors: { origin: '*' } })

    this.httpServer = stoppable(http.createServer(koaServer.callback()), 10_000)
    const serverInfo = await this.startServer()

    logger.info(`[Apollo] Server is listening at ${serverInfo.url}`)

    return serverInfo
  }

  async stop() {
    if (this.httpServer) {
      await new Promise(resolve => this.httpServer.stop(resolve))
      this.httpServer = undefined
    }

    return super.stop()
  }

  private startServer(): Promise<ServerInfo> {
    return new Promise(resolve => {
      this.httpServer.once('listening', () => resolve(this.createServerInfo()))
      this.httpServer.listen(this.port)
    })
  }

  private createServerInfo(): ServerInfo {
    const addressInfo = this.httpServer.address() as net.AddressInfo
    const urlHost = addressInfo.address === '' || addressInfo.address === '::' ? 'localhost' : addressInfo.address

    const graphqlPath = this.graphqlPath !== '/' ? this.graphqlPath : ''

    return {
      ...addressInfo,
      server: this.httpServer,
      url: `http://${urlHost}:${addressInfo.port}${graphqlPath}`,
    }
  }
}
