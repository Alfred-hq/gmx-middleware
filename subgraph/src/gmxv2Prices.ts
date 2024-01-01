import { BigInt, ethereum, json } from "@graphprotocol/graph-ts";
import { EventLog1 } from "../generated/EventEmitter/EventEmitter"
import { oraclePrice ,PriceCandle,Token } from "../generated/schema";
import { checkContract, returnAddressOrZeroAddress } from "./common";
import { EventData } from "./EventEmitter";
import { returnValueOrZero } from "./increasePosition";
//field for oracle prices
//address item 
//1 token
//uint items
//1 min price
//2 max price
//bool item 
//isPriceFeed


export function handleOraclePriceUpdateEvent(event: EventLog1,data: EventData): void{
    const tokenAddress=returnAddressOrZeroAddress(data.getAddressItemString("token"))
    const token=handleToken(tokenAddress)

    const minPrice=returnValueOrZero(data.getUintItem("minPrice"))
    const maxPrice=returnValueOrZero(data.getUintItem("maxPrice"))
    const isPriceFeed=data.getBoolItem("isPriceFeed")
    const priceUpdate=new oraclePrice(`${tokenAddress}_${event.block.number}`)
    handlePriceUpdate(minPrice,maxPrice,token,tokenAddress,event.block.timestamp)
    priceUpdate.tokenAddress=tokenAddress;
    priceUpdate.blockNumber=event.block.number
    priceUpdate.minPrice=minPrice
    priceUpdate.maxPrice=maxPrice
    priceUpdate.blockTimestamp=event.block.timestamp
    priceUpdate.transactionHash=event.transaction.hash.toHexString()
    priceUpdate.isPriceFeed=isPriceFeed
    priceUpdate.logIndex=event.logIndex
    priceUpdate.token=token.id
    priceUpdate.save()
    return 
}
export function handleToken(tokenAddress:string):Token {
    let token = Token.load(tokenAddress)
    if(token){
        return token
    }
    token= new Token(tokenAddress)
    let isSyn=false
    isSyn=checkContract(tokenAddress)
    token.token=tokenAddress
    token.isSyn=isSyn
    token.save()
    return token
}
function getMax(a:BigInt, b:BigInt): BigInt {
    return a > b ? a : b;
  }
  
  function getMin(a: BigInt, b: BigInt): BigInt {
    return a < b ? a : b;
  }
  
  function timestampToPeriodStart(timestamp: BigInt, period: string): BigInt {
    let seconds = periodToSeconds(period)
    let result = timestamp.div(seconds)
    result=result.times(seconds)
    return result
  }
  
  function periodToSeconds(period: string): BigInt {
    let seconds: BigInt
    if(period == '15s'){
      seconds=BigInt.fromI32(15)
    } else if(period == '30s'){
      seconds=BigInt.fromI32(30)
    } else if(period == "1m") {
      seconds=BigInt.fromI32(1*60)
    } else if (period == "5m") {
      seconds = BigInt.fromI32(5 * 60)
    } else if (period == "15m") {
      seconds = BigInt.fromI32(15 * 60)
    } else if (period == "1h") {
      seconds = BigInt.fromI32(60 * 60)
    } else if (period == "4h") {
      seconds = BigInt.fromI32(4 * 60 * 60)
    } else if (period == "1d") {
      seconds = BigInt.fromI32(24 * 60 * 60)
    } else {
      throw new Error("Invalid period")
    }
    return seconds
  }
  
  function getId(token: string, period: string, periodStart: BigInt): string {
    return token + ":" + period + ":" + periodStart.toString()
  }
  
  function updateCandle(minPrice: BigInt,maxPrice: BigInt,token: Token,tokenAddress: string,blockTimestamp:BigInt, period: string): void {
    let periodStart = timestampToPeriodStart(blockTimestamp, period)
    let id = getId(tokenAddress, period, periodStart)
    let entity = PriceCandle.load(id)
  
    if (entity == null) {
      let prevId = getId(tokenAddress, period, periodStart.minus(periodToSeconds(period)),)
      let prevEntity = PriceCandle.load(prevId)
      
      entity = new PriceCandle(id)
      
      entity.period = period
      entity.token=token.id
      entity.tokenAddress=tokenAddress
      
      if (prevEntity == null) {
        entity.openMin=minPrice
        entity.openMax=maxPrice
      } else {
        entity.openMin = prevEntity.closeMin
        entity.openMax = prevEntity.closeMax
      }
      entity.closeMin= minPrice
      entity.highMin  = getMax(entity.openMin, entity.closeMin)
      entity.lowMin   = getMin(entity.openMin, entity.closeMin)
      entity.highMax  = getMax(entity.openMax, entity.closeMax)
      entity.lowMax   = getMin(entity.openMax, entity.closeMax)
      entity.timestamp = periodStart.toI32()
      entity.token = tokenAddress
    } else {
      entity.highMin = getMax(entity.highMin,minPrice);
      entity.lowMin = getMin(entity.lowMin, minPrice)

      entity.highMax = getMax(entity.highMax,maxPrice);
      entity.lowMax = getMin(entity.lowMax, maxPrice)

      entity.closeMin = minPrice
      entity.closeMax = maxPrice
    }
  
    entity.save()
  }
  
  export function handlePriceUpdate(minPrice: BigInt,maxPrice: BigInt,token: Token,tokenAddress: string,blockTimestamp:BigInt): void {
    updateCandle(minPrice,maxPrice,token,tokenAddress,blockTimestamp,"15s")
    updateCandle(minPrice,maxPrice,token,tokenAddress,blockTimestamp,"30s")
    updateCandle(minPrice,maxPrice,token,tokenAddress,blockTimestamp,"1m")
    updateCandle(minPrice,maxPrice,token,tokenAddress,blockTimestamp, "5m")
    updateCandle(minPrice,maxPrice,token,tokenAddress,blockTimestamp, "15m")
    updateCandle(minPrice,maxPrice,token,tokenAddress,blockTimestamp, "1h")
    updateCandle(minPrice,maxPrice,token,tokenAddress,blockTimestamp, "4h")
    updateCandle(minPrice,maxPrice,token,tokenAddress,blockTimestamp, "1d")
  }
  