namespace Tables {
        export interface CoinLuna {
                uid: number
                currency: string
                value: number
        }

        export interface Currency {
                name: string
                issuer: string
                rate: number
        }
}