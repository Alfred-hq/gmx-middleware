import { EventLog1 } from "../generated/EventEmitter/EventEmitter";
import { EventData } from "./EventEmitter"
import {feeV2, IncreasePositionV2, PositionSlotV2, TradesV2} from "../generated/schema"
import { getMarketData, getPositionLinkId, returnAddressOrZeroAddress, _resetPositionSlotV2 } from "./common";
import { BigInt } from "@graphprotocol/graph-ts";
import { ADDRESS_ZERO, getTokenDataByAddress, ZERO_BI } from "./const";
import { updateIncreaseTradeAnalyticsV2 } from "./traderAnalyticsV2";
import { updateIncreaseTradeAnalyticsV2Daily } from "./traderAnalyticsV2WithInterval";
// event.params.eventData.uintItems[0] == sizeinusd
// increase event data type with index and key
// 1. addressItems
//         -account
//         -market
//         -collateralToken
// 2. uint items:
        //    0-sizeInUsd
        //    1-sizeInTokens
        //    2-collateralAmount
        //    3-borrowingFactor
        //    4-fundingFeeAmountPerSize
        //    5-longTokenClaimableFundingAmountPerSize
        //    6-shortTokenClaimableFundingAmountPerSize
        //    7-executionPrice
        //    8-indexTokenPrice
        //    9-indexTokenPrice
        //   10-collateralTokenPrice
        //   12-collateralTokenPrice
        //   13-sizeDeltaUsd
        //   14-sizeDeltaInTokens
        //   15 -orderType
// 3 int items:
//        0-collateralDeltaAmount
//        1-priceImpactUsd
//        2-priceImpactAmount
// 4 boolItems:
//         -isLong
// 5 bytes32Items:
//         -orderKey
//         -positionKey

export function handleIncreasePositionEventV2(event: EventLog1,data: EventData):void{
    let eventType="Increase";
    const sizeInUsd=data.getUintItem("sizeInUsd")
    const sizeDeltaUsd=data.getUintItem("sizeDeltaUsd")
    if(sizeInUsd && sizeDeltaUsd && sizeInUsd.equals(sizeDeltaUsd)){
        eventType="Open"
    }
    handleIncreasePosition(event,data,eventType)
    return
}

export function handleIncreasePosition(event: EventLog1,data: EventData,eventType: string): void{
    const keyBytes32 = data.getBytes32Item("positionKey");
    if(!keyBytes32){
    return
    }
    const feeData=feeV2.load(`${event.transaction.hash.toHexString()}_${event.logIndex.minus(BigInt.fromString("1"))}`); 
    const positionKey=keyBytes32.toHexString()
    // init slot
    let positionSlotV2=createOrLoadPositionSlot(positionKey,data)
    
    const sizeInToken=returnValueOrZero(data.getUintItem("sizeInTokens"))
    const sizeInUsd=returnValueOrZero(data.getUintItem("sizeInUsd"))
    const indexTokenPriceMax=returnValueOrZero(data.getUintItem("indexTokenPrice.max"))
    const indexTokenPriceMin=returnValueOrZero(data.getUintItem("indexTokenPrice.min"))
    const collateralTokenPriceMax=returnValueOrZero(data.getUintItem("collateralTokenPrice.max"))
    const collateralTokenPriceMin=returnValueOrZero(data.getUintItem("collateralTokenPrice.min"))
    const sizeDeltaInUsd=returnValueOrZero(data.getUintItem("sizeDeltaUsd"))
    const sizeDeltaInToken=returnValueOrZero(data.getUintItem("sizeDeltaInTokens"))
    const collateralDeltaUsd=returnValueOrZero(data.getIntItem("collateralDeltaAmount")).times(collateralTokenPriceMin)
    const collateralUsd=returnValueOrZero(data.getUintItem("collateralAmount")).times(collateralTokenPriceMin)
    const collateralInUsd=returnValueOrZero(data.getUintItem("collateralAmount")).times(collateralTokenPriceMin)
    const orderKey=data.getBytes32Item("orderKey")
    const executionPrice=returnValueOrZero(data.getUintItem("executionPrice"))
    const averagePrice= sizeInUsd.notEqual(ZERO_BI) && sizeInToken.notEqual(ZERO_BI) ? sizeInUsd.div(sizeInToken).times(BigInt.fromString("10").pow(positionSlotV2.indexTokenDecimal.toU32() as u8)):ZERO_BI
    const priceImpactUsd= returnValueOrZero(data.getIntItem("priceImpactUsd"))
    const priceImpactAmount= returnValueOrZero(data.getIntItem("priceImpactAmount"))
    if(eventType == 'Open'){
        positionSlotV2.idCount=positionSlotV2.idCount.plus(BigInt.fromString("1"))
        positionSlotV2.linkId=getPositionLinkId(positionSlotV2.idCount.toI32(),positionKey)
        positionSlotV2.blockTimestamp=event.block.timestamp
        positionSlotV2.blockNumber=event.block.number
        positionSlotV2.indexTokenOpenPriceMin = indexTokenPriceMin
        positionSlotV2.indexTokenPriceMax = indexTokenPriceMax
        positionSlotV2.collateralTokenPriceMax = collateralTokenPriceMax
        positionSlotV2.collateralTokenPriceMin = collateralTokenPriceMin
    }
    positionSlotV2.collateralInUsd=collateralInUsd
    positionSlotV2.sizeInToken=sizeInToken
    positionSlotV2.sizeInUsd=sizeInUsd
    positionSlotV2.maxSize=positionSlotV2.maxCollateral.gt(sizeInUsd) ? positionSlotV2.maxSize : sizeInUsd
    positionSlotV2.maxCollateral=positionSlotV2.maxCollateral.gt(collateralInUsd) ? positionSlotV2.maxCollateral : collateralInUsd
    positionSlotV2.numberOfIncrease=positionSlotV2.numberOfIncrease.plus(BigInt.fromString('1'))
    positionSlotV2.lastIncreasedTimestamp=event.block.timestamp

    // price data 
    positionSlotV2.lastIncreasedIndexTokenPriceMin = indexTokenPriceMin
    positionSlotV2.lastIncreasedIndexTokenPriceMax = indexTokenPriceMax
    positionSlotV2.lastIncreasedCollateralTokenPriceMax = collateralTokenPriceMax
    positionSlotV2.lastIncreasedCollateralTokenPriceMin = collateralTokenPriceMin
    positionSlotV2.cumulativeSizeInUsd=positionSlotV2.cumulativeSizeInUsd.plus(sizeDeltaInUsd)
    positionSlotV2.cumulativeSizeInToken=positionSlotV2.cumulativeSizeInToken.plus(sizeDeltaInToken)
    positionSlotV2.cumulativeCollateral=positionSlotV2.cumulativeCollateral.plus(collateralDeltaUsd)
    if(feeData){
    positionSlotV2.fundingFeeAmount=positionSlotV2.fundingFeeAmount.plus(feeData.fundingFeeAmount)
    positionSlotV2.positionFeeAmount=positionSlotV2.positionFeeAmount.plus(feeData.positionFeeAmount)
    positionSlotV2.borrowingFeeAmount=positionSlotV2.borrowingFeeAmount.plus(feeData.borrowingFeeAmount)
    positionSlotV2.uiFeeAmount=positionSlotV2.uiFeeAmount.plus(feeData.uiFeeAmount)
    positionSlotV2.traderDiscountAmount=positionSlotV2.traderDiscountAmount.plus(feeData.traderDiscountAmount)
    positionSlotV2.totalFeeAmount=positionSlotV2.totalFeeAmount.plus(feeData.totalCostAmount)
    positionSlotV2.feesUpdatedAt=event.block.timestamp
    }  
    positionSlotV2.averagePrice=averagePrice
    positionSlotV2.executionPrice=executionPrice
    positionSlotV2.executionPrice1=executionPrice.plus(priceImpactUsd)
    positionSlotV2.save()
  let increasePositionData= IncreasePositionV2.load(`${event.transaction.hash.toHexString()}_${event.logIndex.toString()}`)

  if(!increasePositionData){
      increasePositionData=new IncreasePositionV2(`${event.transaction.hash.toHexString()}_${event.logIndex.toString()}`)
  }

  
    increasePositionData.positionKey=positionKey
    increasePositionData.orderKey=orderKey?orderKey.toHexString():ADDRESS_ZERO
    increasePositionData.account=positionSlotV2.account
    increasePositionData.indexToken=positionSlotV2.indexToken
    increasePositionData.marketToken=positionSlotV2.marketToken
    increasePositionData.collateralToken=positionSlotV2.collateralToken
    increasePositionData.collateralInUsd=collateralUsd
    increasePositionData.sizeDeltaInUsd=sizeDeltaInUsd
    increasePositionData.sizeDeltaInToken=sizeDeltaInToken
    increasePositionData.sizeInUsd=sizeInUsd
    increasePositionData.sizeInToken=sizeInToken
    increasePositionData.isLong=positionSlotV2.isLong
    increasePositionData.executionPrice=executionPrice
    increasePositionData.executionPrice1=executionPrice.plus(priceImpactUsd)
    increasePositionData.indexTokenPriceMax=indexTokenPriceMax
    increasePositionData.indexTokenPriceMin=indexTokenPriceMin
    increasePositionData.collateralTokenPriceMin=collateralTokenPriceMin
    increasePositionData.collateralTokenPriceMax=collateralTokenPriceMax
    increasePositionData.blockNumber=event.block.number
    increasePositionData.blockTimestamp=event.block.timestamp
    increasePositionData.transactionHash=event.transaction.hash.toHexString()
    increasePositionData.transactionIndex=event.transaction.index
    increasePositionData.logIndex=event.logIndex
    increasePositionData.collateralDeltaUsd=collateralDeltaUsd
    increasePositionData.eventType=eventType.toString()
    increasePositionData.linkId=positionSlotV2.linkId
    increasePositionData.priceImpactUsd=priceImpactUsd
    increasePositionData.priceImpactAmount=priceImpactAmount
    if(feeData){
        increasePositionData.fundingFeeAmount=feeData.fundingFeeAmount
        increasePositionData.positionFeeAmount=feeData.positionFeeAmount
        increasePositionData.borrowingFeeAmount=feeData.borrowingFeeAmount
        increasePositionData.uiFeeAmount=feeData.uiFeeAmount
        increasePositionData.traderDiscountAmount=feeData.traderDiscountAmount
        increasePositionData.totalFeeAmount=feeData.totalCostAmount
        increasePositionData.feesUpdatedAt=event.block.timestamp  
    }
    increasePositionData.indexTokenDecimal=positionSlotV2.indexTokenDecimal
    increasePositionData.longTokenDecimal=positionSlotV2.longTokenDecimal
    increasePositionData.shortTokenDecimal=positionSlotV2.shortTokenDecimal
    increasePositionData.indexTokenGmxDecimal=positionSlotV2.indexTokenGmxDecimal
    increasePositionData.longTokenGmxDecimal=positionSlotV2.longTokenGmxDecimal
    increasePositionData.shortTokenGmxDecimal=positionSlotV2.shortTokenGmxDecimal
    increasePositionData.collateralTokenDecimal=positionSlotV2.collateralTokenDecimal
    increasePositionData.collateralTokenGmxDecimal=positionSlotV2.collateralTokenGmxDecimal
    increasePositionData.averagePrice=averagePrice
    increasePositionData.save()
    updateDecreaseTradeData(increasePositionData ,event )
    updateIncreaseTradeAnalyticsV2(event,data,eventType,keyBytes32.toHexString())
    updateIncreaseTradeAnalyticsV2Daily(event,data,eventType,keyBytes32.toHexString())
    return
}

export function returnValueOrZero(value: BigInt | null): BigInt{
    if(value){
        return value
    }
    else{
    return BigInt.fromString("0")
    }
}

export function createOrLoadPositionSlot(key: string, data : EventData): PositionSlotV2{
    let positionSlotV2=PositionSlotV2.load(key)
    if(positionSlotV2){
        return positionSlotV2
    }
    positionSlotV2 = new PositionSlotV2(key)

    const account=returnAddressOrZeroAddress(data.getAddressItemString("account"))
    const collateralToken=returnAddressOrZeroAddress(data.getAddressItemString("collateralToken"))
    const marketToken=returnAddressOrZeroAddress(data.getAddressItemString("market"))
    const isLong=data.getBoolItem("isLong");
    const marketData=getMarketData(marketToken)
    let indexToken:string=ADDRESS_ZERO,longToken:string=ADDRESS_ZERO,shortToken=ADDRESS_ZERO
    if(marketData){
        indexToken=marketData[0]
        longToken=marketData[1]
        shortToken=marketData[2]
    }
    positionSlotV2.account = account
    positionSlotV2.collateralToken =collateralToken
    positionSlotV2.marketToken = marketToken
    positionSlotV2.isLong = isLong
    positionSlotV2.key = key
    positionSlotV2.indexToken=indexToken
    positionSlotV2.longToken=longToken
    positionSlotV2.shortToken=shortToken
    positionSlotV2.idCount=ZERO_BI
    positionSlotV2.basePnlUsd=ZERO_BI
    positionSlotV2.uncappedBasePnlUsd=ZERO_BI
    positionSlotV2.idCount=ZERO_BI
    positionSlotV2.linkId=getPositionLinkId(positionSlotV2.idCount.toI32(),key)
    positionSlotV2.indexTokenDecimal=BigInt.fromString(getTokenDataByAddress(indexToken)[0].toString())
    positionSlotV2.longTokenDecimal=BigInt.fromString(getTokenDataByAddress(longToken)[0].toString())
    positionSlotV2.shortTokenDecimal=BigInt.fromString(getTokenDataByAddress(longToken)[0].toString())
    positionSlotV2.indexTokenGmxDecimal=BigInt.fromString('30').minus(positionSlotV2.indexTokenDecimal)
    positionSlotV2.longTokenGmxDecimal=BigInt.fromString('30').minus(positionSlotV2.longTokenDecimal)
    positionSlotV2.shortTokenGmxDecimal=BigInt.fromString('30').minus(positionSlotV2.shortTokenDecimal)
    positionSlotV2.collateralTokenDecimal=BigInt.fromString(getTokenDataByAddress(positionSlotV2.collateralToken)[0].toString())
    positionSlotV2.collateralTokenGmxDecimal=BigInt.fromString('30').minus(positionSlotV2.collateralTokenDecimal)
    _resetPositionSlotV2(positionSlotV2)
    return positionSlotV2
}

export function updateDecreaseTradeData(entity : IncreasePositionV2 ,event: EventLog1): void{
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
    trade.executionPrice1=entity.executionPrice1
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
