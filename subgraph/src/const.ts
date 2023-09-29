import { BigInt } from "@graphprotocol/graph-ts"

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const ZERO_BYTES32 = "0x0000000000000000000000000000000000000000000000000000000000000000"

export const BASIS_POINTS_DIVISOR = BigInt.fromI32(10000)
export const FUNDING_RATE_PRECISION = BigInt.fromI32(1000000)
export const MARGIN_FEE_BASIS_POINTS = BigInt.fromI32(10)


export const ZERO_BI = BigInt.fromI32(0)
export const ONE_BI = BigInt.fromI32(1)
export const BI_18 = BigInt.fromI32(18)
export const BI_10 = BigInt.fromI32(10)

export const BI_12_PRECISION = BigInt.fromI32(10).pow(12)
export const BI_18_PRECISION = BigInt.fromI32(10).pow(18)
export const BI_22_PRECISION = BigInt.fromI32(10).pow(22)




export const TOKEN_SYMBOL = {
    GMX: 'GMX',
    GLP: "GLP",
    // PUPPPET: "PUPPPET",
  
    ETH: 'ETH',
    WETH: 'WETH',
    UNI: "UNI",
    LINK: "LINK",
    AVAX: "AVAX",
    WAVAX: "WAVAX",
    ARB: "ARB",
    SOL: "SOL",
    SynDOGE: "SynDOGE",
    SynBTC: "SynBTC",
    SynLTC: "SynLTC",
    SynXRP: "SynXRP",
  
    USDT: "USDT",
    DAI: "DAI",
    USDC: 'USDC',
    FRAX: 'FRAX',
    MIM: "MIM",
    WBTC: "WBTC",
    BTCB: "BTCB",
    BTC: "BTC",
    USDCE: "USDCE",
    WBTCE: "WBTCE",
    ESGMX: "ESGMX",
  } as const

  export const TOKEN_DESCRIPTION_LIST = [
    {
      name: "Chainlink",
      symbol: TOKEN_SYMBOL.LINK,
      decimals: 18,
      address:"0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
      denominator: 10n ** 18n,
      gmxDecimal:12,
      isUsd: false,
    },
    {
      name: "Bitcoin (WBTC.e)",
      symbol: TOKEN_SYMBOL.WBTCE,
      decimals: 8,
      address:"0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
      denominator: 10n ** 8n,
      gmxDecimal:22,
      isUsd: false,
    },
    {
      name: "Wrapped Bitcoin",
      symbol: TOKEN_SYMBOL.WBTC,
      decimals: 8,
      denominator: 10n ** 8n,
      address:"0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
      gmxDecimal:22,
      isUsd: false,
    },
    {
      name: "Bitcoin (BTC.b)",
      symbol: TOKEN_SYMBOL.BTCB,
      decimals: 8,
      address:"0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
      gmxDecimal:22,
      denominator: 10n ** 8n,
      isUsd: false,
    },
    {
      name: "Ethereum",
      symbol: TOKEN_SYMBOL.ETH,
      decimals: 18,
      address:"0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      gmxDecimal:12,
      denominator: 10n ** 18n,
      isUsd: false,
    },
    {
      name: "Wrapped Ethereum",
      symbol: TOKEN_SYMBOL.WETH,
      decimals: 18,
      address:"0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      gmxDecimal:12,
      denominator: 10n ** 18n,
      isUsd: false,
    },
    {
      name: "Uniswap",
      symbol: TOKEN_SYMBOL.UNI,
      decimals: 18,
      address:"0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
      gmxDecimal:12,
      denominator: 10n ** 18n,
      isUsd: false,
    },
    {
      name: "USD Coin",
      symbol: TOKEN_SYMBOL.USDC,
      decimals: 6,
      address:"0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      gmxDecimal:24,
      denominator: 10n ** 6n,
      isUsd: true,
    },
    {
      name: "USD Coin (USDC.e)",
      symbol: TOKEN_SYMBOL.USDCE,
      decimals: 6,
      gmxDecimal:24,
      address:"0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
      denominator: 10n ** 6n,
      isUsd: true,
    },
    {
      name: "Tether",
      symbol: TOKEN_SYMBOL.USDT,
      decimals: 6,
      gmxDecimal:24,
      address:"0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      denominator: 10n ** 6n,
      isUsd: true,
    },
    {
      name: "Dai",
      symbol: TOKEN_SYMBOL.DAI,
      address:"0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      decimals: 18,
      gmxDecimal:12,
      denominator: 10n ** 18n,
      isUsd: true,
    },
    {
      name: "Frax",
      symbol: TOKEN_SYMBOL.FRAX,
      address:"0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F",
      decimals: 18,
      gmxDecimal:12,
      denominator: 10n ** 18n,
      isUsd: true,
    },
    {
      name: "Magic Internet Money",
      symbol: TOKEN_SYMBOL.MIM,
      decimals: 18,
      gmxDecimal:12,
      denominator: 10n ** 18n,
      address:"0xFEa7a6a0B346362BF88A9e4A88416B77a57D6c2A",
      isUsd: true,
    },
    {
      name: "Arbitrum",
      symbol: TOKEN_SYMBOL.ARB,
      decimals: 18,
      gmxDecimal:12,
      address:"0x912CE59144191C1204E64559FE8253a0e49E6548",
      denominator: 10n ** 18n,
      isUsd: true,
    },
    {
      name: "Wrapped Solana",
      symbol: TOKEN_SYMBOL.SOL,
      decimals: 9,
      gmxDecimal:21,
      address:"0x2bcC6D6CdBbDC0a4071e48bb3B969b06B3330c07",
      denominator: 10n ** 9n,
      isUsd: true,
    },
    {
      name: "Synthetic Dogecoin",
      symbol: TOKEN_SYMBOL.SynDOGE,
      decimals: 8,
      gmxDecimal:22,
      address:"0xC4da4c24fd591125c3F47b340b6f4f76111883d8",
      denominator: 10n ** 8n,
      isUsd: true,
    },
    {
      name: "Synthetic Bitcoin",
      symbol: TOKEN_SYMBOL.SynBTC,
      decimals: 8,
      gmxDecimal:22,
      address:"0x47904963fc8b2340414262125aF798B9655E58Cd",
      denominator: 10n ** 8n,
      isUsd: true,
    },
    {
      name: "Synthetic Litecoin",
      symbol: TOKEN_SYMBOL.SynLTC,
      decimals: 8,
      gmxDecimal:22,
      address:"0xB46A094Bc4B0adBD801E14b9DB95e05E28962764",
      denominator: 10n ** 8n,
      isUsd: true,
    },
    {
      name: "Synthetic XRP",
      symbol: TOKEN_SYMBOL.SynXRP,
      decimals: 6,
      gmxDecimal:24,
      address:"0xc14e065b0067dE91534e032868f5Ac6ecf2c6868",
      denominator: 10n ** 6n,
      isUsd: true,
    },
    
  ] as const

  export function getTokenDataByAddress(address: string):Array<Number>{
    for(let i=0;i<TOKEN_DESCRIPTION_LIST.length;i++){
        if(TOKEN_DESCRIPTION_LIST[i]['address'].toLowerCase() == address.toLowerCase()){
            return [TOKEN_DESCRIPTION_LIST[i].decimals,TOKEN_DESCRIPTION_LIST[i].gmxDecimal]
        }
    }
    return [29,30]

    
  }