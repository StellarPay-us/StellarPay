// types/global.d.ts

declare global {
  interface User {
    email: string
    accounts: Account[]
    messages: Message[]
  }

  interface Message {
    id: string
    creDtTm: Date
    pmtInfId: string
    pmtMtd: PaymentMethods
    svcLvl: ServiceLevels
    reqdExctnDt: Date
  }

  interface Account {
    iban: string
    bicfi: string
    amount: number
    currency: Currency
  }

  type PaymentMethods = 'TRF'
  type ServiceLevels = 'NORM'
  type Currency = 'USD' | 'EUR'
}

export {}
