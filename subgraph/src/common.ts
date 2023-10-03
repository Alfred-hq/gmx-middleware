import { ADDRESS_ZERO, ZERO_BI } from "./const";
import { Market, PositionSlotV2 } from "../generated/schema";
import * as gmxReader from "../generated/EventEmitter/Reader";
import * as arbInfo from "../generated/EventEmitter/ArbInfo"
import { Address, Bytes, log } from "@graphprotocol/graph-ts";
export function getMarketData(marketAddress: string): Array<string>{
    // add contract call to reader contract to get market data
    //for the current available market we can use constant file to reduce rpc calls
    let indexToken=ADDRESS_ZERO
    let longToken=ADDRESS_ZERO;
    let shortToken=ADDRESS_ZERO;
    const marketTokenData=Market.load(marketAddress)

    if(marketTokenData){
      indexToken=marketTokenData.indexToken
      longToken=marketTokenData.longToken
      shortToken=marketTokenData.shortToken
    }
    else{
      let marketCallResult = gmxReader.Reader.bind(
        Address.fromString("0x38d91ED96283d62182Fc6d990C24097A918a4d9b") 
      ).try_getMarket(Address.fromString("0xFD70de6b91282D8017aA4E741e9Ae325CAb992d8"),Address.fromString(marketAddress))
      let marketData = !marketCallResult.reverted ?  marketCallResult.value : null
      
      if(marketData){
        log.error("call succefull",[marketData.indexToken.toHexString()]);
        indexToken=marketData.indexToken.toHexString()
        longToken=marketData.longToken.toHexString()
        shortToken=marketData.shortToken.toHexString()
        //updating market to save this as well
        const marketTokenEntity=new Market(marketAddress)
        marketTokenEntity.marketToken=marketAddress
        marketTokenEntity.indexToken=indexToken
        marketTokenEntity.longToken=longToken
        marketTokenEntity.shortToken=shortToken
        marketTokenEntity.save()
      }
    }
  
   
    return [indexToken,longToken,shortToken]
}

export function _resetPositionSlotV2(positionSlotV2: PositionSlotV2): PositionSlotV2 {
    positionSlotV2.sizeInUsd=ZERO_BI
    positionSlotV2.sizeInToken=ZERO_BI
    positionSlotV2.collateralInUsd=ZERO_BI
    positionSlotV2.cumulativeFee=ZERO_BI
    positionSlotV2.maxSize=ZERO_BI
    positionSlotV2.maxCollateral=ZERO_BI
    positionSlotV2.blockNumber=ZERO_BI
    positionSlotV2.blockTimestamp=ZERO_BI
    positionSlotV2.lastIncreasedTimestamp=ZERO_BI
    positionSlotV2.lastDecreasedTimestamp=ZERO_BI
    positionSlotV2.numberOfIncrease=ZERO_BI
    positionSlotV2.numberOfDecrease=ZERO_BI
    positionSlotV2.lastDecreasedIndexTokenPriceMin=ZERO_BI
    positionSlotV2.lastDecreasedIndexTokenPriceMax=ZERO_BI
    positionSlotV2.lastIncreasedIndexTokenPriceMin=ZERO_BI
    positionSlotV2.lastIncreasedIndexTokenPriceMax=ZERO_BI
    positionSlotV2.lastIncreasedCollateralTokenPriceMin=ZERO_BI
    positionSlotV2.lastIncreasedCollateralTokenPriceMax=ZERO_BI
    positionSlotV2.lastDecreasedCollateralTokenPriceMin=ZERO_BI
    positionSlotV2.lastDecreasedCollateralTokenPriceMax=ZERO_BI
    positionSlotV2.cumulativeSizeInToken=ZERO_BI
    positionSlotV2.cumulativeSizeInUsd=ZERO_BI
    positionSlotV2.cumulativeCollateral=ZERO_BI
    positionSlotV2.priceImpactUsd=ZERO_BI
    positionSlotV2.basePnlUsd=ZERO_BI
    positionSlotV2.uncappedBasePnlUsd=ZERO_BI
    positionSlotV2.indexTokenPriceMax=ZERO_BI
    positionSlotV2.indexTokenPriceMin=ZERO_BI
    positionSlotV2.collateralTokenPriceMax=ZERO_BI
    positionSlotV2.collateralTokenPriceMin=ZERO_BI
    positionSlotV2.indexTokenOpenPriceMin=ZERO_BI
    positionSlotV2.indexTokenOpenPriceMax=ZERO_BI
    positionSlotV2.sizeUpdatedAt=ZERO_BI


    positionSlotV2.fundingFeeAmount=ZERO_BI
    positionSlotV2.positionFeeAmount=ZERO_BI
    positionSlotV2.borrowingFeeAmount=ZERO_BI
    positionSlotV2.uiFeeAmount=ZERO_BI
    positionSlotV2.traderDiscountAmount=ZERO_BI
    positionSlotV2.totalFeeAmount=ZERO_BI
    positionSlotV2.feesUpdatedAt=ZERO_BI
    positionSlotV2.save()
return positionSlotV2
  }

export function returnAddressOrZeroAddress(value:string | null) : string{
  if(value){
    return value
  }
  return ADDRESS_ZERO
}

export const getPositionLinkId = (id: i32, key: string): string => {
  return `PositionLink_${id.toString()}_${key}`
};

export function checkContract(address:string):boolean {
  let result=false
  let callResult = arbInfo.ArbInfo.bind(
    Address.fromString("0x0000000000000000000000000000000000000065")
  ).try_getCode(Address.fromString(address))
   result=callResult.reverted ? false : callResult.value.length > 0
  return result
}