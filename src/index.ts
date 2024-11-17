import { Context } from 'koishi'
import { Config } from './config'
import { CoinLuna } from './coinluna'

export const name = 'coinluna'
export * from './config'
export const inject = {
        required: ['database']
}

declare module 'koishi' {
        interface Context {
                coinluna: CoinLuna
        }

        interface Events {
                'coinluna/coin-set': (data: { uid: number, currency: string, value: number }) => void
        }

        interface Tables {
                coinluna: Tables.CoinLuna
        }
}

export function apply(ctx: Context, config: Config) {
        ctx.on('ready', async () => {
                ctx.plugin(CoinLuna, config)
                ctx.plugin({
                        apply: coinApply,
                        name: 'coinluna',
                        inject: {
                                coinluna: { required: true }
                        }
                }, config)
        })
}

function coinApply(ctx: Context, config: Config) {
        ctx.command('coin.give <user: string> <amount: number>', '给指定用户添加Coin', { authority: 3 })
                .action(({ session }, user, amount) => {
                        
                })
}