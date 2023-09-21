import { ZERO_BI } from "./const";
import { PositionSlotV2 } from "../generated/schema";

export function getMarketData(marketAddress: string): Array<string>{
    // add contract call to reader contract to get market data
    //for the current available market we can use constant file to reduce rpc calls
    const indexToken="0x000";
    const longToken="0x000";
    const shortToken="0x0000";
    return [indexToken,longToken,shortToken]
}

export function _resetPositionSlotV2(positionSlotV2: PositionSlotV2): PositionSlotV2 {

//     positionSlotV2.collateral = ZERO_BI
//     positionSlotV2.size = ZERO_BI
//     positionSlotV2.entryFundingRate = ZERO_BI
//     positionSlotV2.realisedPnl = ZERO_BI
//     positionSlotV2.reserveAmount = ZERO_BI
//   V2
//     positionSlotV2.cumulativeCollateral = ZERO_BI
//     positionSlotV2.cumulativeSize = ZERO_BI
//     positionSlotV2.cumulativeFee = ZERO_BI
//   V2
//     positionSlotV2.maxCollateral = ZERO_BI
//     positionSlotV2.maxSize = ZERO_BI
//     positionSlotV2.blockNumber = ZERO_BI
//     positionSlotV2.blockTimestamp = ZERO_BI
//     positionSlotV2.numberOfIncrease=ZERO_BI
//     positionSlotV2.numberOfDecrease=ZERO_BI
//     positionSlotV2.lastIncreasedTimestamp=ZERO_BI
//     positionSlotV2.lastDecreasedTimestamp=ZERO_BI
//     positionSlotV2.lastDecreasedPrice=ZERO_BI
    return positionSlotV2
  }