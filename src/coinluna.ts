import { Context, Service } from "koishi"
import NodeCache from "node-cache"
import { Config } from "./config"

export class CoinLuna extends Service {
        static inject = ['database']
        private cache: NodeCache

        public GetCoin: Function
        public SetCoin: Function

        constructor(ctx: Context, config: Config) {
                super(ctx, 'coinluna', true)

                ctx.model.extend('coinluna', {
                        uid: 'unsigned',
                        currency: 'string',
                        value: 'unsigned',
                }, {
                        primary: ['uid', 'currency'],
                        foreign: {
                                uid: ['user', 'id'],
                        },
                })

                if (config.cacheTTL) {
                        this.cache = new NodeCache({ stdTTL: config.cacheTTL * 1000 })
                        ctx.logger.info('cache is enabled')
                        // 启用缓存的getCoin和setCoin方法
                        this.GetCoin = this.getCoinWithCache
                        this.SetCoin = this.setCoinWithCache
                } else {
                        ctx.logger.info('cache is disabled')
                        this.GetCoin = this.getCoinWithOutCache
                        this.SetCoin = this.setCoinWithOutCache
                }
        }

        private async getCoinWithCache(uid: number, currency: string) {
                const key = `${uid}:${currency}`
                const value = this.cache.get(key)
                if (value !== undefined) return value
                return await this.ctx.database.get('coinluna', { uid, currency }).then((value) => {
                        this.cache.set(key, value)
                        return value
                })
        }

        private async getCoinWithOutCache(uid: number, currency: string) {
                return await this.ctx.database.get('coinluna', { uid, currency })
        }

        private async setCoinWithCache(uid: number, currency: string, value: number) {
                const key = `${uid}:${currency}`
                if (this.cache.set(key, value)) {
                        await this.ctx.database.upsert(
                                'coinluna', 
                                [{ uid: uid, currency: currency, value: value }]
                        )
                } else {
                        await this.ctx.database.upsert(
                                'coinluna', 
                                [{ uid: uid, currency: currency, value: value }]
                        ).then(() => {
                                this.cache.set(key, value)
                        })
                }

                this.ctx.emit('coinluna/coin-set', { uid, currency, value })
        }

        private async setCoinWithOutCache(uid: number, currency: string, value: number) {
                await this.ctx.database.upsert(
                        'coinluna', 
                        [{ uid: uid, currency: currency, value: value }]
                )
        }

        public async giveCoin(uid: number, currency: string, value: number) {
                return this.SetCoin(uid, currency, await this.GetCoin(uid, currency) + value)
        }

        public async takeCoin(uid: number, currency: string, value: number) {
                return this.SetCoin(uid, currency, await this.GetCoin(uid, currency) - value)
        }
}