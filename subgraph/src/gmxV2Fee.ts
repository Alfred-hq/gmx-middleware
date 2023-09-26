import { log } from "@graphprotocol/graph-ts";
import { EventLog1 } from "../generated/EventEmitter/EventEmitter"
import { feeV2 } from "../generated/schema";
import { returnAddressOrZeroAddress } from "./common";
import { ADDRESS_ZERO } from "./const";
import { EventData } from "./EventEmitter";
import { returnValueOrZero } from "./increasePosition";


// bytes32 item
// orderKey
// positionKey
// referralCode

//address item
// market
// collateralToken
// affiliate
// trader
// uiFeeReceiver

//uint item
// collateralTokenPrice.min
// collateralTokenPrice.max
// tradeSizeUsd
// totalRebateFactor
// traderDiscountFactor
// totalRebateAmount
// traderDiscountAmount
// affiliateRewardAmount
// fundingFeeAmount
// claimableLongTokenAmount
// claimableShortTokenAmount
// latestFundingFeeAmountPerSize
// latestLongTokenClaimableFundingAmountPerSize
// latestShortTokenClaimableFundingAmountPerSize
// borrowingFeeUsd
// borrowingFeeAmount
// borrowingFeeReceiverFactor
// borrowingFeeAmountForFeeReceiver
// positionFeeFactor
// protocolFeeAmount
// positionFeeReceiverFactor
// feeReceiverAmount
// feeAmountForPool
// positionFeeAmountForPool
// positionFeeAmount
// totalCostAmount
// uiFeeReceiverFactor
// uiFeeAmount

//bool item 
// isIncrease
export function handleFeeEventV2(event: EventLog1,data: EventData):void {
const feeData=new feeV2(`${event.transaction.hash.toHexString()}_${event.logIndex}`)
// log.error("fee data saving started before order key and position key {}",[`${event.transaction.hash.toHexString()}_${event.logIndex}`])

let  positionKey = data.getBytes32Item("positionKey");
// log.error("fee data saving started positionkey  {}",[positionKey?positionKey.toHexString():ADDRESS_ZERO ])

let orderKey=data.getBytes32Item("orderKey");
let referralCode=data.getBytes32Item("referralCode");
// log.error("fee data saving started orderKey  {}",[orderKey?orderKey.toHexString():ADDRESS_ZERO ])
if( orderKey ){
    // log.error("fee data saving started {}",[`${event.transaction.hash.toHexString()}_${event.logIndex}`])
feeData.positionKey=positionKey?positionKey.toHexString():ADDRESS_ZERO
feeData.orderKey=orderKey.toHexString()
feeData.referralCode=referralCode?referralCode.toHexString():ADDRESS_ZERO

feeData.market=returnAddressOrZeroAddress(data.getAddressItemString("market"))
feeData.collateralToken=returnAddressOrZeroAddress(data.getAddressItemString("collateralToken"))
feeData.affiliate=returnAddressOrZeroAddress(data.getAddressItemString("affiliate"))
feeData.trader=returnAddressOrZeroAddress(data.getAddressItemString("trader"))
feeData.uiFeeReceiver=returnAddressOrZeroAddress(data.getAddressItemString("uiFeeReceiver"))
feeData.collateralTokenPriceMin=returnValueOrZero(data.getUintItem("collateralTokenPrice.min"))
feeData.collateralTokenPriceMax=returnValueOrZero(data.getUintItem("collateralTokenPrice.max"))
feeData.tradeSizeUsd=returnValueOrZero(data.getUintItem("tradeSizeUsd"))
feeData.totalRebateFactor=returnValueOrZero(data.getUintItem("totalRebateFactor"))
feeData.traderDiscountFactor=returnValueOrZero(data.getUintItem("traderDiscountFactor"))
feeData.totalRebateAmount=returnValueOrZero(data.getUintItem("totalRebateAmount"))
feeData.traderDiscountAmount=returnValueOrZero(data.getUintItem("traderDiscountAmount"))
feeData.affiliateRewardAmount=returnValueOrZero(data.getUintItem("affiliateRewardAmount"))
feeData.fundingFeeAmount=returnValueOrZero(data.getUintItem("fundingFeeAmount"))
feeData.claimableLongTokenAmount=returnValueOrZero(data.getUintItem("claimableLongTokenAmount"))
feeData.claimableShortTokenAmount=returnValueOrZero(data.getUintItem("claimableShortTokenAmount"))
feeData.latestFundingFeeAmountPerSize=returnValueOrZero(data.getUintItem("latestFundingFeeAmountPerSize"))
feeData.latestLongTokenClaimableFundingAmountPerSize=returnValueOrZero(data.getUintItem("latestLongTokenClaimableFundingAmountPerSize"))
feeData.latestShortTokenClaimableFundingAmountPerSize=returnValueOrZero(data.getUintItem("latestShortTokenClaimableFundingAmountPerSize"))
feeData.borrowingFeeUsd=returnValueOrZero(data.getUintItem("borrowingFeeUsd"))
feeData.borrowingFeeAmount=returnValueOrZero(data.getUintItem("borrowingFeeAmount"))
feeData.borrowingFeeReceiverFactor=returnValueOrZero(data.getUintItem("borrowingFeeReceiverFactor"))
feeData.borrowingFeeAmountForFeeReceiver=returnValueOrZero(data.getUintItem("borrowingFeeAmountForFeeReceiver"))
feeData.positionFeeFactor=returnValueOrZero(data.getUintItem("positionFeeFactor"))
feeData.protocolFeeAmount=returnValueOrZero(data.getUintItem("protocolFeeAmount"))
feeData.positionFeeReceiverFactor=returnValueOrZero(data.getUintItem("positionFeeReceiverFactor"))
feeData.feeReceiverAmount=returnValueOrZero(data.getUintItem("feeReceiverAmount"))
feeData.feeAmountForPool=returnValueOrZero(data.getUintItem("feeAmountForPool"))
feeData.positionFeeAmountForPool=returnValueOrZero(data.getUintItem("positionFeeAmountForPool"))
feeData.positionFeeAmount=returnValueOrZero(data.getUintItem("positionFeeAmount"))
feeData.totalCostAmount=returnValueOrZero(data.getUintItem("totalCostAmount"))
feeData.uiFeeReceiverFactor=returnValueOrZero(data.getUintItem("uiFeeReceiverFactor"))
feeData.uiFeeAmount=returnValueOrZero(data.getUintItem("uiFeeAmount"))
feeData.isIncrease=data.getBoolItem("isIncrease")
feeData.save()
// log.error("fee data saved {} ",[`${event.transaction.hash.toHexString()}_${event.logIndex}`])

return 
}

}