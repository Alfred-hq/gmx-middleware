import { EventLog1 } from "../generated/EventEmitter/EventEmitter";
import { EventData } from "./EventEmitter"
import {IncreasePositionV2, PositionSlotV2} from "../generated/schema"
import { getMarketData, _resetPositionSlotV2 } from "./common";
import { BigInt, log } from "@graphprotocol/graph-ts";
import { ADDRESS_ZERO, ZERO_BI } from "./const";
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
        log.error("handle increase called ",[])
        eventType="Open"
    }
    log.error("handle increase called ",[])
    handleIncreasePosition(event,data,eventType)
    return
}

export function handleIncreasePosition(event: EventLog1,data: EventData,eventType: string): void{
    const keyBytes32 = data.getBytes32Item("positionKey");
    let account:string | null=ADDRESS_ZERO,collateralToken:string | null=ADDRESS_ZERO,indexToken:string | null=ADDRESS_ZERO,isLong=false,marketToken:string | null=ADDRESS_ZERO,longToken:string | null=ADDRESS_ZERO,shortToken:string | null=ADDRESS_ZERO,collateralInUsd: BigInt | null=ZERO_BI,sizeInToken: BigInt | null=ZERO_BI,sizeInUsd: BigInt | null=ZERO_BI,
    indexTokenPriceMax: BigInt | null=ZERO_BI,indexTokenPriceMin: BigInt | null=ZERO_BI,collateralTokenPriceMax: BigInt | null=ZERO_BI,collateralTokenPriceMin: BigInt | null=ZERO_BI;
    if(!keyBytes32){
    return
    }
    const positionKey=keyBytes32.toHexString()
    log.error("position key increase position {}",[positionKey])
    // init slot
    let positionSlotV2=PositionSlotV2.load(positionKey)
    if ( positionSlotV2 === null) {
    account=data.getAddressItemString("account");
    log.error("position key account {}",[account?account:ADDRESS_ZERO])
    collateralToken=data.getAddressItemString("collateralToken")
    log.error("position key collateralToken {}",[collateralToken?collateralToken:ADDRESS_ZERO])
    marketToken=data.getAddressItemString("market")
    log.error("position key market {}",[marketToken?marketToken:ADDRESS_ZERO])

    isLong=data.getBoolItem("isLong");
    

    if(account &&  collateralToken && marketToken){
        positionSlotV2 = new PositionSlotV2(positionKey)
        positionSlotV2.account = account
        positionSlotV2.collateralToken =collateralToken
        positionSlotV2.marketToken = marketToken
        positionSlotV2.isLong = isLong
        positionSlotV2.key = positionKey

        // to get long short and index token
        const marketData=getMarketData(marketToken)
        log.error("position key marketDataResponse succefull {}",[marketData[0]])
        if(marketData){
            indexToken=marketData[0]
            longToken=marketData[1]
            shortToken=marketData[2]
        }
        if(indexToken && longToken && shortToken){
            positionSlotV2.indexToken=indexToken
            positionSlotV2.longToken=longToken
            positionSlotV2.shortToken=shortToken
        }
        _resetPositionSlotV2(positionSlotV2)

    }
    else{
        return 
    }
    if(positionSlotV2){
        positionSlotV2.basePnlUsd=BigInt.fromString('0')
        positionSlotV2.positionFeeUsd=BigInt.fromString('0')
        positionSlotV2.borrowingFeeUsd=BigInt.fromString('0')
        positionSlotV2.fundingFeeUsd=BigInt.fromString('0')
        positionSlotV2.uncappedBasePnlUsd=BigInt.fromString('0')
        positionSlotV2.cumulativeFee=BigInt.fromString('0')
    
        collateralInUsd=data.getUintItem("collateralAmount")
        sizeInToken=data.getUintItem("sizeInTokens")
        sizeInUsd=data.getUintItem("sizeInUsd")        
        const sizeDeltaInUsd=data.getUintItem("sizeDeltaUsd")
        const sizeDeltaInToken=data.getUintItem("sizeDeltaInTokens")    
        positionSlotV2.collateralInUsd=collateralInUsd?collateralInUsd:BigInt.fromString("0")
        positionSlotV2.sizeInToken=sizeInToken?sizeInToken:BigInt.fromString("0")
        positionSlotV2.sizeInUsd=sizeInUsd?sizeInUsd:BigInt.fromString("0")
        positionSlotV2.maxSize=sizeInUsd?sizeInUsd:BigInt.fromString("0")
        positionSlotV2.maxCollateral=collateralInUsd? collateralInUsd:BigInt.fromString("0")
        positionSlotV2.numberOfIncrease=BigInt.fromString("1")
        positionSlotV2.numberOfDecrease=BigInt.fromString("0")
        // positionSlotV2.lastDecreasedPrice=BigInt.fromString("0");
        positionSlotV2.lastIncreasedTimestamp=event.block.timestamp
        positionSlotV2.lastDecreasedTimestamp=BigInt.fromString("0")
        positionSlotV2.blockNumber=event.block.number
        positionSlotV2.blockTimestamp=event.block.timestamp 
        positionSlotV2.cumulativeSizeInUsd=positionSlotV2.cumulativeSizeInUsd.plus(returnValueOrZero(sizeDeltaInUsd))
        positionSlotV2.cumulativeSizeInToken=positionSlotV2.cumulativeSizeInToken.plus(returnValueOrZero(sizeDeltaInToken))
        positionSlotV2.save()
      }
  }
  else{
    collateralInUsd=data.getUintItem("collateralAmount")
    sizeInToken=data.getUintItem("sizeInToken")
    sizeInUsd=data.getUintItem("sizeInUsd")
    indexTokenPriceMax=data.getUintItem("indexTokenPrice.max")
    indexTokenPriceMin=data.getUintItem("indexTokenPrice.min")
    collateralTokenPriceMax=data.getUintItem("collateralTokenPrice.max")
    collateralTokenPriceMin=data.getUintItem("collateralTokenPrice.min")
    const sizeDeltaInUsd=data.getUintItem("sizeDeltaUsd")
    const sizeDeltaInToken=data.getUintItem("sizeDeltaInTokens") 
    // sizeDeltaUsd=data.getUintItem("sizeDeltaUsd")
    // sizeDeltaInTokens=data.getUintItem("sizeDeltaInTokens")
    positionSlotV2.collateralInUsd=collateralInUsd?collateralInUsd:BigInt.fromString("0")
    positionSlotV2.sizeInToken=sizeInToken?sizeInToken:BigInt.fromString("0")
    positionSlotV2.sizeInUsd=sizeInUsd?sizeInUsd:BigInt.fromString("0")
    positionSlotV2.maxSize=positionSlotV2.maxCollateral.gt(sizeInUsd?sizeInUsd:BigInt.fromString("0")) ? positionSlotV2.maxSize : sizeInUsd?sizeInUsd:BigInt.fromString("0")
    positionSlotV2.maxCollateral=positionSlotV2.maxCollateral.gt(collateralInUsd?collateralInUsd:BigInt.fromString("0")) ? positionSlotV2.maxCollateral : collateralInUsd?collateralInUsd:BigInt.fromString("0")
    positionSlotV2.numberOfIncrease=positionSlotV2.numberOfIncrease.plus(BigInt.fromString('1'))
    positionSlotV2.lastIncreasedTimestamp=event.block.timestamp

    // price data 
    positionSlotV2.lastIncreasedIndexTokenPriceMin=returnValueOrZero(indexTokenPriceMin)
    positionSlotV2.lastIncreasedIndexTokenPriceMax = returnValueOrZero(indexTokenPriceMax)
    positionSlotV2.lastIncreasedCollateralTokenPriceMax=returnValueOrZero(collateralTokenPriceMax)
    positionSlotV2.lastIncreasedCollateralTokenPriceMin=returnValueOrZero(collateralTokenPriceMin)
    positionSlotV2.cumulativeSizeInUsd=positionSlotV2.cumulativeSizeInUsd.plus(returnValueOrZero(sizeDeltaInUsd))
    positionSlotV2.cumulativeSizeInToken=positionSlotV2.cumulativeSizeInToken.plus(returnValueOrZero(sizeDeltaInToken))
  }
    positionSlotV2.save()
  let increasePositionData= IncreasePositionV2.load(`${event.transaction.hash.toHexString()}_${event.logIndex.toString()}`)
  if(!increasePositionData){
      increasePositionData=new IncreasePositionV2(`${event.transaction.hash.toHexString()}_${event.logIndex.toString()}`)
  }
  const collateralDeltaUsd=data.getUintItem("collateralAmount"),
  sizeDeltaInUsd=data.getUintItem("sizeDeltaUsd"),
  sizeDeltaInToken=data.getUintItem("sizeDeltaInTokens"),
  orderKey=data.getBytes32Item("orderKey"),
  executionPrice=data.getUintItem("executionPrice") 
    increasePositionData.positionKey=positionKey
    increasePositionData.orderKey=orderKey?orderKey.toHexString():ADDRESS_ZERO
    // increasePositionData.orderTyp
    increasePositionData.account=account?account:ADDRESS_ZERO
    // increasePositionData.path
    increasePositionData.indexToken=positionSlotV2.indexToken
    increasePositionData.marketToekn=positionSlotV2.marketToken
    increasePositionData.collateralToken=positionSlotV2.collateralToken
    increasePositionData.collateralInUsd=returnValueOrZero(collateralDeltaUsd)
    increasePositionData.sizeDeltaInUsd=returnValueOrZero(sizeDeltaInUsd)
    increasePositionData.sizeDeltaInToken=returnValueOrZero(sizeDeltaInToken)
    increasePositionData.sizeInUsd=returnValueOrZero(sizeInUsd)
    increasePositionData.sizeInToken=returnValueOrZero(sizeInToken)
    increasePositionData.isLong=positionSlotV2.isLong
    // increasePositionData.acceptablePrice
    increasePositionData.executionPrice=returnValueOrZero(executionPrice)
    increasePositionData.indexTokenPriceMax=returnValueOrZero(indexTokenPriceMax)
    increasePositionData.indexTokenPriceMin=returnValueOrZero(indexTokenPriceMin)
    increasePositionData.collateralTokenPriceMin=returnValueOrZero(collateralTokenPriceMin)
    increasePositionData.collateralTokenPriceMax=returnValueOrZero(collateralTokenPriceMax)
    // increasePositionData.executionFee=
    // increasePositionData.blockGap
    // increasePositionData.timeGap
    increasePositionData.blockNumber=event.block.number
    increasePositionData.blockTimestamp=event.block.timestamp
    increasePositionData.transactionHash=event.transaction.hash.toHexString()
    increasePositionData.transactionIndex=event.transaction.index
    increasePositionData.logIndex=event.logIndex
    increasePositionData.eventType=eventType.toString()
    increasePositionData.save()
    return
}
// export function handleIncreasePosition(event: EventLog1,data: EventData){
//     let eventType="increase"
//     let keyBytes32 = data.getBytes32Item("positionKey");
//     if(!keyBytes32){
//     return
//     }
//     let positionKey=keyBytes32.toHexString();
//     let positionSlotV2=PositionSlotV2.load(positionKey)
//     if ( positionSlotV2 === null) {
//         return
//     }
//     let collateralInUsd,sizeInToken,sizeInUsd,indexTokenPriceMin,indexTokenPriceMax,collateralTokenPriceMin,collateralTokenPriceMax;
//     collateralInUsd=data.getUintItem("collateralAmount")
//     sizeInToken=data.getUintItem("sizeInToken")
//     sizeInUsd=data.getUintItem("sizeInUsd")
//     indexTokenPriceMax=data.getUintItem("indexTokenPriceMax")
//     indexTokenPriceMin=data.getUintItem("indexTokenPriceMin")
//     collateralTokenPriceMax=data.getUintItem("collateralTokenPriceMax")
//     collateralTokenPriceMin=data.getUintItem("collateralTokenPriceMin")
//     // sizeDeltaUsd=data.getUintItem("sizeDeltaUsd")
//     // sizeDeltaInTokens=data.getUintItem("sizeDeltaInTokens")
//     positionSlotV2.collateralInUsd=collateralInUsd?collateralInUsd:BigInt.fromString("0");
//     positionSlotV2.sizeInToken=sizeInToken?sizeInToken:BigInt.fromString("0");
//     positionSlotV2.sizeInUsd=sizeInUsd?sizeInUsd:BigInt.fromString("0");
//     positionSlotV2.maxSize=positionSlotV2.maxCollateral.gt(sizeInUsd?sizeInUsd:BigInt.fromString("0")) ? positionSlotV2.maxSize : sizeInUsd?sizeInUsd:BigInt.fromString("0")
//     positionSlotV2.maxCollateral=positionSlotV2.maxCollateral.gt(collateralInUsd?collateralInUsd:BigInt.fromString("0")) ? positionSlotV2.maxCollateral : collateralInUsd?collateralInUsd:BigInt.fromString("0")
//     positionSlotV2.numberOfIncrease=positionSlotV2.numberOfIncrease.plus(BigInt.fromString('1'))
//     positionSlotV2.lastIncreasedTimestamp=event.block.timestamp

//     // price data 
//     positionSlotV2.lastIncreasedIndexTokenPriceMin=returnValueOrZero(indexTokenPriceMin)
//     positionSlotV2.lastIncreasedIndexTokenPriceMax = returnValueOrZero(indexTokenPriceMax)
//     positionSlotV2.lastIncreasedCollateralTokenPriceMax=returnValueOrZero(collateralTokenPriceMax)
//     positionSlotV2.lastIncreasedCollateralTokenPriceMin=returnValueOrZero(collateralTokenPriceMin)



// }
export function returnValueOrZero(value: BigInt | null): BigInt{
    if(value){
        return value
    }
    else{
    return BigInt.fromString("0")
    }
}

// export function handleIncreaseData(event){

// }