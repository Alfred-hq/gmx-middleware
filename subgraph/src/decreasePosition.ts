import { BigInt } from "@graphprotocol/graph-ts"
import { EventLog1 } from "../generated/EventEmitter/EventEmitter"
import { DecreasePositionV2, PositionSettledV2, PositionSlotV2 } from "../generated/schema"
import { _resetPositionSlotV2 } from "./common"
import { ADDRESS_ZERO } from "./const"
import { EventData } from "./EventEmitter"
import { returnValueOrZero } from "./increasePosition"

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
    if(sizeInUsd && sizeInUsd.equals(BigInt.fromString("0"))){
            eventType="Close"
          
    }
    const positionSlotV2=handleDecreasePosition(event,data,eventType)    
    if(positionSlotV2){

    if(eventType == 'Close'){
        handlePositionSettled(event ,positionSlotV2,data)
        _resetPositionSlotV2(positionSlotV2)
    }
   
    // updateDecreaseTradeData() to be implemented
   
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
const collateralInUsd=data.getUintItem("collateralAmount")
const sizeInToken=data.getUintItem("sizeInTokens")
const sizeInUsd=data.getUintItem("sizeInUsd")
const indexTokenPriceMax=data.getUintItem("indexTokenPrice.max")
const indexTokenPriceMin=data.getUintItem("indexTokenPrice.min")
const collateralTokenPriceMax=data.getUintItem("collateralTokenPrice.max")
const collateralTokenPriceMin=data.getUintItem("collateralTokenPrice.min")
const account=data.getAddressItem("account")
const sizeDeltaInUsd=data.getUintItem("sizeDeltaUsd")
const sizeDeltaInToken=data.getUintItem("sizeDeltaInTokens")
const executionPrice=data.getUintItem("executionPrice")
const orderKey=data.getBytes32Item("orderKey")

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
positionSlotV2.lastDecreasedCollateralTokenPriceMin=returnValueOrZero(collateralTokenPriceMin)

// pnl data 
const basePnlUsd=data.getIntItem("basePnlUsd")
const uncappedPnlUsd=data.getIntItem("uncappedBasePnlUsd")
const priceImpactUsd=data.getUintItem("priceImpactUsd")
positionSlotV2.basePnlUsd=positionSlotV2.basePnlUsd.plus( returnValueOrZero(basePnlUsd))
positionSlotV2.uncappedBasePnlUsd=positionSlotV2.uncappedBasePnlUsd.plus(returnValueOrZero(uncappedPnlUsd))
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
decreasePositionData.save()

return positionSlotV2

}

 export function handlePositionSettled(event: EventLog1,positionSlotV2: PositionSlotV2,data: EventData): void{
let positionSettled=new PositionSettledV2(`${event.transaction.hash}_${event.logIndex}`)


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
positionSettled.fundingFeeUsd=positionSlotV2.fundingFeeUsd
positionSettled.positionFeeUsd=positionSlotV2.positionFeeUsd
positionSettled.borrowingFeeUsd=positionSlotV2.borrowingFeeUsd
positionSettled.feesUpdatedAt=positionSlotV2.feesUpdatedAt
positionSettled.save()
return

}