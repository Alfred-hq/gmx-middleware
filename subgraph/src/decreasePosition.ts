import { BigInt } from "@graphprotocol/graph-ts"
import { EventLog1 } from "../generated/EventEmitter/EventEmitter"
import { DecreasePositionV2, PositionSlotV2 } from "../generated/schema"
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
        if(data.getUintItem("sizeInUsd") && data.getUintItem("sizeInUsd")  === BigInt.fromString("0")){
            eventType="Close"
          
    }
    const positionSlotV2=handleDecreasePosition(event,data,eventType)    
    if(positionSlotV2){

    if(eventType == 'Close'){
        handlePositionSettled(event ,positionSlotV2)
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
const sizeInToken=data.getUintItem("sizeInToken")
const sizeInUsd=data.getUintItem("sizeInUsd")
const indexTokenPriceMax=data.getUintItem("indexTokenPriceMax")
const indexTokenPriceMin=data.getUintItem("indexTokenPriceMin")
const collateralTokenPriceMax=data.getUintItem("collateralTokenPriceMax")
const collateralTokenPriceMin=data.getUintItem("collateralTokenPriceMin")
const account=data.getAddressItem("account")
const sizeDeltaInUsd=data.getUintItem("sizeDeltaUsd")
const sizeDeltaInToken=data.getUintItem("sizeDeltaInToken")
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

 export function handlePositionSettled(event: EventLog1,positionSlotV2: PositionSlotV2): void{
// let positionSettled=new PositionSettled(`${event.transaction.hash}_${event.logIndex}`)
return

}