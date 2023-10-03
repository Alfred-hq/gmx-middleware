import { BigInt } from "@graphprotocol/graph-ts"
import { EventLog1 } from "../generated/EventEmitter/EventEmitter"
import { DecreasePositionV2, feeV2, PositionSettledV2, PositionSlotV2, TradesV2 } from "../generated/schema"
import { _resetPositionSlotV2 } from "./common"
import { ADDRESS_ZERO, ZERO_BI } from "./const"
import { EventData } from "./EventEmitter"
import { returnValueOrZero } from "./increasePosition"
import { updateDecreaseTradeAnalyticsV2 } from "./traderAnalyticsV2"
import { updateDecreaseTradeAnalyticsV2Daily } from "./traderAnalyticsV2WithInterval"

// event.params.eventData.uintItems[0] == sizeInusd and also the size in usd will be zero for close position

// decrease event data type with index and key
// 1. addressItems
//         -account
//         -market
//         -collateralToken
// 2. uint items:
        //     0-sizeInUsd
        //     1-sizeInTokens
        //     2-collateralAmount
        //     3-borrowingFactor
        //     4-fundingFeeAmountPerSize
        //     5-longTokenClaimableFundingAmountPerSize
        //     6-shortTokenClaimableFundingAmountPerSize
        //     7-executionPrice
        //     8-indexTokenPrice
        //     9-indexTokenPrice
        //    10-collateralTokenPrice
        //    11-collateralTokenPrice
        //    12-sizeDeltaUsd
        //    13-sizeDeltaInTokens
        //    14-collateralDeltaAmount
        //    15-values.priceImoactUsd
        //    16-orderType
// 3 int items:
//        0-priceImpactUsd
//        1-basePnlUsd
//        2-uncappedBasePnlUsd
// 4 boolItems:
//         -isLong
// 5 bytes32Items:
//         -orderKey
//         -positionKey

export function handleDecreasePositionEventV2(event: EventLog1,data: EventData): void{
    let eventType="Decrease"
    const sizeInUsd=data.getUintItem("sizeInUsd")
    if(sizeInUsd && sizeInUsd.equals(ZERO_BI)){
            eventType="Close"  
    }
    const positionSlotV2=handleDecreasePosition(event,data,eventType)    
    if(positionSlotV2){
    if(eventType == 'Close'){
        handlePositionSettled(event ,positionSlotV2,data)
        _resetPositionSlotV2(positionSlotV2)
    }   
}

}

export function handleDecreasePosition(event: EventLog1,data: EventData,eventType:string):  PositionSlotV2 | null{
const keyBytes32 = data.getBytes32Item("positionKey")
if(!keyBytes32){
return null
}
const positionKey=keyBytes32.toHexString()
const positionSlotV2=PositionSlotV2.load(positionKey)
if ( positionSlotV2 === null) {
    return null
}
// log.error("getting fee Data  called with id  {}",[`${event.transaction.hash.toHexString()}_${event.logIndex.minus(BigInt.fromString("1"))}`])
const feeData=feeV2.load(`${event.transaction.hash.toHexString()}_${event.logIndex.minus(BigInt.fromString("1"))}`); 



const indexTokenPriceMax=data.getUintItem("indexTokenPrice.max")
const indexTokenPriceMin=data.getUintItem("indexTokenPrice.min")
const collateralTokenPriceMax=returnValueOrZero(data.getUintItem("collateralTokenPrice.max"))
const collateralTokenPriceMin=returnValueOrZero(data.getUintItem("collateralTokenPrice.min"))
const account=data.getAddressItem("account")
const sizeDeltaInUsd=returnValueOrZero(data.getUintItem("sizeDeltaUsd"))
const sizeDeltaInToken=returnValueOrZero(data.getUintItem("sizeDeltaInTokens"))
const executionPrice=returnValueOrZero(data.getUintItem("executionPrice"))
const orderKey=data.getBytes32Item("orderKey")
const collateralDeltaUsd=returnValueOrZero(data.getIntItem("collateralDeltaAmount")).times(collateralTokenPriceMin)
const orderType=returnValueOrZero(data.getUintItem("orderType"))
const collateralInUsd=returnValueOrZero(data.getUintItem("collateralAmount")).times(collateralTokenPriceMin)
const sizeInToken=returnValueOrZero(data.getUintItem("sizeInTokens"))
const sizeInUsd=returnValueOrZero(data.getUintItem("sizeInUsd"))
let averagePrice= sizeInUsd.notEqual(ZERO_BI) && sizeInToken.notEqual(ZERO_BI) ? sizeInUsd.div(sizeInToken).times(BigInt.fromString("10").pow(positionSlotV2.indexTokenDecimal.toU32() as u8)):ZERO_BI
if(eventType == 'Close'){
    averagePrice=sizeDeltaInUsd.notEqual(ZERO_BI) && sizeDeltaInToken.notEqual(ZERO_BI) ? sizeDeltaInUsd.div(sizeDeltaInToken).times(BigInt.fromString("10").pow(positionSlotV2.indexTokenDecimal.toU32() as u8)):ZERO_BI
}   
positionSlotV2.collateralInUsd=collateralInUsd?collateralInUsd:BigInt.fromString("0")
positionSlotV2.sizeInToken=sizeInToken?sizeInToken:BigInt.fromString("0")
positionSlotV2.sizeInUsd=sizeInUsd?sizeInUsd:BigInt.fromString("0")
positionSlotV2.maxSize=positionSlotV2.maxCollateral.gt(sizeInUsd?sizeInUsd:BigInt.fromString("0")) ? positionSlotV2.maxSize : sizeInUsd?sizeInUsd:BigInt.fromString("0")
positionSlotV2.maxCollateral=positionSlotV2.maxCollateral.gt(collateralInUsd?collateralInUsd:BigInt.fromString("0")) ? positionSlotV2.maxCollateral : collateralInUsd?collateralInUsd:BigInt.fromString("0")
positionSlotV2.numberOfDecrease=positionSlotV2.numberOfDecrease.plus(BigInt.fromString('1'))
positionSlotV2.lastDecreasedTimestamp=event.block.timestamp

// price data 
positionSlotV2.lastDecreasedIndexTokenPriceMin=returnValueOrZero(indexTokenPriceMin)
positionSlotV2.lastDecreasedIndexTokenPriceMax = returnValueOrZero(indexTokenPriceMax)
positionSlotV2.lastDecreasedCollateralTokenPriceMax=returnValueOrZero(collateralTokenPriceMax)
positionSlotV2.lastDecreasedCollateralTokenPriceMin=collateralTokenPriceMin
positionSlotV2.executionPrice=executionPrice
// pnl data 
const basePnlUsd=data.getIntItem("basePnlUsd")
const uncappedPnlUsd=data.getIntItem("uncappedBasePnlUsd")
const priceImpactUsd=data.getUintItem("priceImpactUsd")
positionSlotV2.basePnlUsd=positionSlotV2.basePnlUsd.plus( returnValueOrZero(basePnlUsd))
positionSlotV2.uncappedBasePnlUsd=positionSlotV2.uncappedBasePnlUsd.plus(returnValueOrZero(uncappedPnlUsd))
positionSlotV2.averagePrice=averagePrice
positionSlotV2.save()


let decreasePositionData= DecreasePositionV2.load(`${event.transaction.hash.toHexString()}_${event.logIndex.toString()}`)
if(!decreasePositionData){
    decreasePositionData=new DecreasePositionV2(`${event.transaction.hash.toHexString()}_${event.logIndex.toString()}`)
}
// decrease position data
decreasePositionData.positionKey=positionKey
decreasePositionData.account=positionSlotV2.account
decreasePositionData.indexToken=positionSlotV2.indexToken
decreasePositionData.marketToken=positionSlotV2.marketToken
decreasePositionData.collateralToken=positionSlotV2.collateralToken
decreasePositionData.sizeDeltaInUsd=returnValueOrZero(sizeDeltaInUsd)
decreasePositionData.sizeDeltaInToken=returnValueOrZero(sizeDeltaInToken)
decreasePositionData.sizeInUsd=returnValueOrZero(sizeInUsd)
decreasePositionData.sizeInToken=returnValueOrZero(sizeInToken)
decreasePositionData.isLong=positionSlotV2.isLong
// decreasePositionData.acceptablePrice=
decreasePositionData.executionPrice=returnValueOrZero(executionPrice)
decreasePositionData.indexTokenPriceMax=returnValueOrZero(indexTokenPriceMax)
decreasePositionData.indexTokenPriceMin=returnValueOrZero(indexTokenPriceMin)
decreasePositionData.collateralTokenPriceMin=returnValueOrZero(collateralTokenPriceMin)
decreasePositionData.collateralTokenPriceMax=returnValueOrZero(collateralTokenPriceMin)
// decreasePositionData.executionFee
decreasePositionData.basePnlUsd=returnValueOrZero(basePnlUsd)
decreasePositionData.uncappedBasePnlUsd=returnValueOrZero(uncappedPnlUsd)
decreasePositionData.priceImpactUsd=returnValueOrZero(priceImpactUsd)
decreasePositionData.orderKey=orderKey?orderKey.toHexString():ADDRESS_ZERO
decreasePositionData.blockNumber=event.block.number
decreasePositionData.blockTimestamp=event.block.timestamp
decreasePositionData.transactionHash=event.transaction.hash.toHexString()
decreasePositionData.transactionIndex=event.transaction.index
decreasePositionData.logIndex=event.logIndex
decreasePositionData.eventType=eventType.toString()
decreasePositionData.collateralDeltaUsd=returnValueOrZero(collateralDeltaUsd)
decreasePositionData.collateralInUsd=returnValueOrZero(collateralInUsd)
decreasePositionData.linkId=positionSlotV2.linkId
// decreasePositionData.save()
if(feeData){
  decreasePositionData.fundingFeeAmount=feeData.fundingFeeAmount
  decreasePositionData.positionFeeAmount=feeData.positionFeeAmount
  decreasePositionData.borrowingFeeAmount=feeData.borrowingFeeAmount
  decreasePositionData.uiFeeAmount=feeData.uiFeeAmount
  decreasePositionData.traderDiscountAmount=feeData.traderDiscountAmount
  decreasePositionData.totalFeeAmount=feeData.totalCostAmount
  decreasePositionData.feesUpdatedAt=event.block.timestamp
  positionSlotV2.fundingFeeAmount=positionSlotV2.fundingFeeAmount.plus(feeData.fundingFeeAmount)
  positionSlotV2.positionFeeAmount=positionSlotV2.positionFeeAmount.plus(feeData.positionFeeAmount)
  positionSlotV2.borrowingFeeAmount=positionSlotV2.borrowingFeeAmount.plus(feeData.borrowingFeeAmount)
  positionSlotV2.uiFeeAmount=positionSlotV2.uiFeeAmount.plus(feeData.uiFeeAmount)
  positionSlotV2.traderDiscountAmount=positionSlotV2.traderDiscountAmount.plus(feeData.traderDiscountAmount)
  positionSlotV2.totalFeeAmount=positionSlotV2.totalFeeAmount.plus(feeData.totalCostAmount)
  positionSlotV2.feesUpdatedAt=event.block.timestamp
  positionSlotV2.save()
//   decreasePositionData.save()  
}
decreasePositionData.indexTokenDecimal=positionSlotV2.indexTokenDecimal
decreasePositionData.longTokenDecimal=positionSlotV2.longTokenDecimal
decreasePositionData.shortTokenDecimal=positionSlotV2.shortTokenDecimal
decreasePositionData.indexTokenGmxDecimal=positionSlotV2.indexTokenGmxDecimal
decreasePositionData.longTokenGmxDecimal=positionSlotV2.longTokenGmxDecimal
decreasePositionData.shortTokenGmxDecimal=positionSlotV2.shortTokenGmxDecimal
decreasePositionData.collateralTokenDecimal=positionSlotV2.collateralTokenDecimal
decreasePositionData.collateralTokenGmxDecimal=positionSlotV2.collateralTokenGmxDecimal
decreasePositionData.averagePrice=averagePrice
decreasePositionData.save()
if(orderType.equals(BigInt.fromString("7"))){
    eventType="Liquidated"
}  
updateDecreaseTradeAnalyticsV2(event,data,eventType,positionKey)
updateDecreaseTradeAnalyticsV2Daily(event,data,eventType,positionKey)
updateDecreaseTradeData(decreasePositionData,event)
return positionSlotV2

}

export function handlePositionSettled(event: EventLog1,positionSlotV2: PositionSlotV2,data: EventData): void{
const orderType=returnValueOrZero(data.getUintItem("orderType"))

let positionSettled=new PositionSettledV2(`${event.transaction.hash.toHexString()}_${event.logIndex}`)
positionSettled.account=positionSlotV2.account
positionSettled.collateralToken=positionSlotV2.collateralToken
positionSettled.marketToken=positionSlotV2.marketToken
positionSettled.indexToken=positionSlotV2.indexToken
positionSettled.longToken=positionSlotV2.longToken
positionSettled.shortToken=positionSlotV2.shortToken
positionSettled.isLong=positionSlotV2.isLong
positionSettled.key=positionSlotV2.key
positionSettled.cumulativeCollateral=positionSlotV2.cumulativeCollateral
positionSettled.cumulativeFee=positionSlotV2.cumulativeFee
positionSettled.cumulativeSizeInToken=positionSlotV2.cumulativeSizeInToken
positionSettled.cumulativeSizeInUsd=positionSlotV2.cumulativeSizeInUsd
positionSettled.maxSize=positionSlotV2.maxSize
positionSettled.maxCollateral=positionSlotV2.maxCollateral
positionSettled.blockNumber=event.block.number
positionSettled.blockTimestamp=event.block.timestamp
positionSettled.lastIncreasedTimestamp=positionSlotV2.lastIncreasedTimestamp
positionSettled.lastDecreasedTimestamp=positionSlotV2.lastDecreasedTimestamp
positionSettled.numberOfIncrease=positionSlotV2.numberOfIncrease
positionSettled.numberOfDecrease=positionSlotV2.numberOfDecrease
positionSettled.lastDecreasedIndexTokenPriceMin=positionSlotV2.lastDecreasedIndexTokenPriceMin
positionSettled.lastDecreasedIndexTokenPriceMax=positionSlotV2.lastDecreasedIndexTokenPriceMax
positionSettled.lastIncreasedIndexTokenPriceMin=positionSlotV2.lastIncreasedIndexTokenPriceMin
positionSettled.lastIncreasedIndexTokenPriceMax=positionSlotV2.lastIncreasedIndexTokenPriceMax
positionSettled.lastIncreasedCollateralTokenPriceMin=positionSlotV2.lastIncreasedCollateralTokenPriceMin
positionSettled.lastIncreasedCollateralTokenPriceMax=positionSlotV2.lastIncreasedCollateralTokenPriceMax
positionSettled.lastDecreasedCollateralTokenPriceMin=positionSlotV2.lastDecreasedCollateralTokenPriceMin
positionSettled.lastDecreasedCollateralTokenPriceMax=positionSlotV2.lastDecreasedCollateralTokenPriceMax
positionSettled.priceImpactUsd=positionSlotV2.priceImpactUsd
positionSettled.basePnlUsd=positionSlotV2.basePnlUsd
positionSettled.uncappedBasePnlUsd=positionSlotV2.uncappedBasePnlUsd
positionSettled.indexTokenPriceMax=positionSlotV2.indexTokenPriceMax
positionSettled.indexTokenPriceMin=positionSlotV2.indexTokenPriceMin
positionSettled.collateralTokenPriceMax=positionSlotV2.collateralTokenPriceMax
positionSettled.collateralTokenPriceMin=positionSlotV2.collateralTokenPriceMin
positionSettled.indexTokenOpenPriceMin=positionSlotV2.indexTokenOpenPriceMin
positionSettled.indexTokenOpenPriceMax=positionSlotV2.indexTokenOpenPriceMax
positionSettled.sizeUpdatedAt=positionSlotV2.sizeUpdatedAt

positionSettled.fundingFeeAmount=positionSlotV2.fundingFeeAmount
positionSettled.positionFeeAmount=positionSlotV2.positionFeeAmount
positionSettled.borrowingFeeAmount=positionSlotV2.borrowingFeeAmount
positionSettled.uiFeeAmount=positionSlotV2.uiFeeAmount
positionSettled.traderDiscountAmount=positionSlotV2.traderDiscountAmount
positionSettled.totalFeeAmount=positionSlotV2.totalFeeAmount
positionSettled.feesUpdatedAt=positionSlotV2.feesUpdatedAt

positionSettled.sizeInUsd=positionSlotV2.sizeInUsd
positionSettled.sizeInToken=positionSlotV2.sizeInToken
positionSettled.collateralInUsd=positionSlotV2.collateralInUsd
positionSettled.linkId=positionSlotV2.linkId
positionSettled.idCount=positionSlotV2.idCount
positionSettled.indexTokenDecimal=positionSlotV2.indexTokenDecimal
positionSettled.longTokenDecimal=positionSlotV2.longTokenDecimal
positionSettled.shortTokenDecimal=positionSlotV2.shortTokenDecimal
positionSettled.indexTokenGmxDecimal=positionSlotV2.indexTokenGmxDecimal
positionSettled.longTokenGmxDecimal=positionSlotV2.longTokenGmxDecimal
positionSettled.shortTokenGmxDecimal=positionSlotV2.shortTokenGmxDecimal
positionSettled.collateralTokenDecimal=positionSlotV2.collateralTokenDecimal
positionSettled.collateralTokenGmxDecimal=positionSlotV2.collateralTokenGmxDecimal
positionSettled.settledPrice=positionSlotV2.executionPrice
positionSettled.averagePrice=positionSlotV2.averagePrice
positionSettled.is_liquidated=false
positionSettled.transactionHash=event.transaction.hash.toHexString()
positionSettled.logIndex=event.logIndex
if(orderType.equals(BigInt.fromString("7"))){
    positionSettled.is_liquidated=true
}  
positionSettled.save()
return

}

export function updateDecreaseTradeData(entity : DecreasePositionV2 ,event: EventLog1): void{
    const trade=new TradesV2(`${event.transaction.hash.toHexString()}_${event.logIndex}`)
    
    trade.positionKey=entity.positionKey
    trade.orderKey=entity.orderKey
    trade.account=entity.account
    trade.indexToken=entity.indexToken
    trade.marketToken=entity.marketToken
    trade.collateralToken=entity.collateralToken
  
  
  
    trade.sizeDeltaInUsd=entity.sizeDeltaInUsd
    trade.sizeDeltaInToken=entity.sizeDeltaInToken
    trade.collateralInUsd=entity.collateralInUsd
    trade.collateralDeltaUsd=entity.collateralDeltaUsd
    trade.sizeInUsd=entity.sizeInUsd
    trade.sizeInToken=entity.sizeInToken
    trade.isLong=entity.isLong
    // trade.acceptablePrice=entity.acceptablePrice
    trade.executionPrice=entity.executionPrice
    trade.indexTokenPriceMax=entity.indexTokenPriceMax
    trade.indexTokenPriceMin=entity.indexTokenPriceMin
    trade.collateralTokenPriceMin=entity.collateralTokenPriceMin
    trade.collateralTokenPriceMax=entity.collateralTokenPriceMax
    // trade.executionFee=entity.executionFee
    trade.priceImpactUsd=entity.priceImpactUsd
    trade.basePnlUsd=entity.basePnlUsd
    trade.uncappedBasePnlUsd=entity.uncappedBasePnlUsd
    trade.blockNumber=entity.blockNumber
    trade.blockTimestamp=entity.blockTimestamp
    trade.transactionHash=entity.transactionHash
    trade.transactionIndex=entity.transactionIndex
    trade.logIndex=entity.logIndex
    trade.eventType=entity.eventType
    trade.fundingFeeAmount=entity.fundingFeeAmount
    trade.positionFeeAmount=entity.positionFeeAmount
    trade.borrowingFeeAmount=entity.borrowingFeeAmount
    trade.uiFeeAmount=entity.uiFeeAmount
    trade.traderDiscountAmount=entity.traderDiscountAmount
    trade.totalFeeAmount=entity.totalFeeAmount
    trade.feesUpdatedAt=entity.feesUpdatedAt
    trade.linkId=entity.linkId
    trade.indexTokenDecimal=entity.indexTokenDecimal
    trade.longTokenDecimal=entity.longTokenDecimal
    trade.shortTokenDecimal=entity.shortTokenDecimal
    trade.indexTokenGmxDecimal=entity.indexTokenGmxDecimal
    trade.longTokenGmxDecimal=entity.longTokenGmxDecimal
    trade.shortTokenGmxDecimal=entity.shortTokenGmxDecimal
    trade.collateralTokenDecimal=entity.collateralTokenDecimal
    trade.collateralTokenGmxDecimal=entity.collateralTokenGmxDecimal
    trade.averagePrice=entity.averagePrice
    trade.save()
    return
    }