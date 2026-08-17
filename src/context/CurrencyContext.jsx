import React, { createContext, useContext, useState, useEffect } from 'react'

export const CURRENCIES = {
  XOF: { code: 'XOF', symbol: 'FCFA', name: 'Franc CFA (XOF)', rate: 1, position: 'after' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro (EUR)', rate: 1 / 655.957, position: 'after' },
  USD: { code: 'USD', symbol: '$', name: 'Dollar US (USD)', rate: 1 / 600, position: 'before' },
}

const CurrencyContext = createContext({
  currency: 'XOF',
  setCurrency: () => {},
  formatPrice: (amountInXof) => `${amountInXof} FCFA`,
  convertPrice: (amountInXof) => amountInXof,
})

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('app_currency') || 'XOF'
  })

  const setCurrency = (curr) => {
    if (CURRENCIES[curr]) {
      setCurrencyState(curr)
      localStorage.setItem('app_currency', curr)
    }
  }

  const convertPrice = (amountInXof) => {
    const num = Number(amountInXof) || 0
    const currMeta = CURRENCIES[currency] || CURRENCIES.XOF
    return num * currMeta.rate
  }

  const formatPrice = (amountInXof, customCurrency = null) => {
    const num = Number(amountInXof) || 0
    const currCode = customCurrency || currency
    const currMeta = CURRENCIES[currCode] || CURRENCIES.XOF

    if (currCode === 'XOF') {
      return `${Math.round(num).toLocaleString('fr-FR')} FCFA`
    } else if (currCode === 'EUR') {
      const val = (num / 655.957).toFixed(2).replace('.', ',')
      return `${val} €`
    } else if (currCode === 'USD') {
      const val = (num / 600).toFixed(2)
      return `$${val}`
    }
    return `${Math.round(num).toLocaleString('fr-FR')} FCFA`
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertPrice, currencies: CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
