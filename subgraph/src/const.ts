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




// export const TOKEN_SYMBOL: { [key: string]: string } = {
//     GMX: "GMX",
//     GLP: "GLP",  
//     ETH: "ETH",
//     WETH: "WETH",
//     UNI: "UNI",
//     LINK: "LINK",
//     AVAX: "AVAX",
//     WAVAX: "WAVAX",
//     ARB: "ARB",
//     SOL: "SOL",
//     SynDOGE: "SynDOGE",
//     SynBTC: "SynBTC",
//     SynLTC: "SynLTC",
//     SynXRP: "SynXRP",
//     USDT: "USDT",
//     DAI: "DAI",
//     USDC: "USDC",
//     FRAX: "FRAX",
//     MIM: "MIM",
//     WBTC: "WBTC",
//     BTCB: "BTCB",
//     BTC: "BTC",
//     USDCE: "USDCE",
//     WBTCE: "WBTCE",
//     ESGMX: "ESGMX",
//   } 
export class  Token {
  name: string
  decimals: string
  address:string
  gmxDecimal:string
  constructor(data: string[]) {
    this.name=data[0],
    this.decimals=data[1]
    this.address=data[2]
    this.gmxDecimal=data[3]

  }
}
  export const TOKEN_DESCRIPTION_LIST:Token[]= [
    new Token([
      "Chainlink",
      "18",
      "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
      "12",
    ]
    ),
    new Token ([
       "Bitcoin (WBTC.e)",
       "8",
      "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
      "22",
    ]),
    new Token([
       "Wrapped Bitcoin",
       "8",
      "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
      "22",
    ]),
    new Token([
       "Bitcoin (BTC.b)",
       "8",
      "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
      "22",
    ]),
    new Token([
       "Ethereum",
       "18",
      "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      "12",
    ]),
    new Token([
       "Wrapped Ethereum",
       "18",
      "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      "12",
    ]),
    new Token([
      'Uniswap',
      '18',
      '0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0',
      '12'
    ]),
    new Token([
      'USD Coin',
      '6',
      '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      '24'
    ]),
    new Token([
      'USD Coin (USDC.e)',
      '6',
      '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      '24'
    ]),
    new Token([ 'Tether', '6', '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', '24' ]),
    new Token([ 'Dai', '18', '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', '12' ]),
    new Token([ 'Frax', '18', '0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F', '12' ]),
    new Token([
      'Magic Internet Money',
      '18',
      '0xFEa7a6a0B346362BF88A9e4A88416B77a57D6c2A',
      '12'
    ]),
    new Token([
      'Arbitrum',
      '18',
      '0x912CE59144191C1204E64559FE8253a0e49E6548',
      '12'
    ]),
    new Token([
      'Wrapped Solana',
      '9',
      '0x2bcC6D6CdBbDC0a4071e48bb3B969b06B3330c07',
      '21'
    ]),
    new Token([
      'Synthetic Dogecoin',
      '8',
      '0xC4da4c24fd591125c3F47b340b6f4f76111883d8',
      '22'
    ]),
    new Token([
      'Synthetic Bitcoin',
      '8',
      '0x47904963fc8b2340414262125aF798B9655E58Cd',
      '22'
    ]),
    new Token([
      'Synthetic Litecoin',
      '8',
      '0xB46A094Bc4B0adBD801E14b9DB95e05E28962764',
      '22'
    ]),
    new Token([
      'Synthetic XRP',
      '6',
      '0xc14e065b0067dE91534e032868f5Ac6ecf2c6868',
      '24'
    ])
    
  ] 

  export function getTokenDataByAddress(address: string):Array<string>{
    for(let i=0;i<TOKEN_DESCRIPTION_LIST.length;i++){
        if(TOKEN_DESCRIPTION_LIST[i].address.toLowerCase() == address.toLowerCase()){
            return [TOKEN_DESCRIPTION_LIST[i].decimals.toString(),TOKEN_DESCRIPTION_LIST[i].gmxDecimal.toString()]
        }
    }
    return ["29","30"]

    
  }