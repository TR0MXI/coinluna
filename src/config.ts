import { Schema } from "koishi"

export interface Config {
        cacheTTL: number
}

export const Config: Schema<Config> = Schema.object({
        cacheTTL: Schema.number().default(3600).min(0)
}).i18n({
        "zh-CN": require('./locales/zh-CN').config
})