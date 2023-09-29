import {
    PositionSlotV2,
    IncreasePositionV2,
    DecreasePositionV2,
    TraderAnalyticsV2Daily,
  } from "../generated/schema";
  import { EventLog1 } from "../generated/EventEmitter/EventEmitter";

  import { BigInt } from "@graphprotocol/graph-ts";
  import { ZERO_BI } from "./const";
  import { EventData } from "./EventEmitter";
  import { getDailyId } from "./helper";

  export function updateIncreaseTradeAnalyticsV2Daily(
    event: EventLog1,data: EventData,eventType: string,key: string
  ): void {
    const positionSlotV2=PositionSlotV2.load(key);
    const increasePositionV2=IncreasePositionV2.load(`${event.transaction.hash.toHexString()}_${event.logIndex.toString()}`);
    if(!positionSlotV2 || !increasePositionV2){
        return
    }
    let dayPeriodId = getDailyId(event);
    const trades = loadOrCreateTradeAnalyticsDaily(dayPeriodId,positionSlotV2.account);
  
    trades.increaseCount = trades.increaseCount.plus(BigInt.fromString("1"));
    trades.cumulativeSize = increasePositionV2.sizeDeltaInUsd.plus(trades.cumulativeSize);
    trades.cumulativeCollateral = increasePositionV2.collateralInUsd.plus(
      trades.cumulativeCollateral
    );
    trades.cumulativeFee = increasePositionV2.totalFeeAmount.plus(trades.cumulativeFee);
    trades.maxCollateral =
    increasePositionV2.collateralInUsd.gt(trades.maxCollateral)
        ? increasePositionV2.collateralInUsd
        : trades.maxCollateral;
    trades.maxSize =
    increasePositionV2.sizeInUsd.gt(trades.maxSize) ? increasePositionV2.sizeInUsd : trades.maxSize;
    // trades.cumulativePnl = trades.cumulativePnl.plus(event.params.realisedPnl);
  
    // last open position count is not changed if there is no new position
    trades.openCount =
    eventType == "Open"
        ? trades.openCount.plus(BigInt.fromString("1"))
        : trades.openCount;
  
    // last open position will be forwarded if there is no new open position event 
    trades.lastOpenPositionAt =
    eventType == "Open"
        ? event.block.timestamp
        : trades.lastOpenPositionAt;
    
    trades.save();
  }
  
  export function updateDecreaseTradeAnalyticsV2Daily(
    event: EventLog1,data: EventData,eventType: string,key: string
  ): void {
    const positionSlotV2=PositionSlotV2.load(key);
    const decreasePositionV2=DecreasePositionV2.load(`${event.transaction.hash.toHexString()}_${event.logIndex.toString()}`);
    if(!positionSlotV2 || !decreasePositionV2){
        return
    }
    let dayPeriodId = getDailyId(event);
    const trades = loadOrCreateTradeAnalyticsDaily(dayPeriodId,positionSlotV2.account);
  
    trades.decreaseCount = trades.decreaseCount.plus(BigInt.fromString("1"));
    trades.cumulativeFee = decreasePositionV2.totalFeeAmount.plus(trades.cumulativeFee);
    if(eventType == 'Close' || eventType == 'Liquidated'){
    const netPnl = positionSlotV2.basePnlUsd.minus(
        positionSlotV2.cumulativeFee
      );
    trades.lastSettledPositionAt = event.block.timestamp;
    trades.openCount = trades.openCount.lt(BigInt.fromString("1"))
    ? BigInt.fromString("0")
    : trades.openCount.minus(BigInt.fromString("1"));
    trades.totalPositions = trades.totalPositions.plus(BigInt.fromString("1"));
    trades.winCountWithFee = netPnl.gt(BigInt.fromString("0"))
      ? trades.winCountWithFee.plus(BigInt.fromString("1"))
      : trades.winCountWithFee;
    trades.loseCountWithFee = netPnl.le(BigInt.fromString("0"))
      ? trades.loseCountWithFee.plus(BigInt.fromString("1"))
      : trades.loseCountWithFee;
    trades.winCount = positionSlotV2.basePnlUsd.gt(BigInt.fromString("0"))
      ? trades.winCount.plus(BigInt.fromString("1"))
      : trades.winCount;
    trades.loseCount = positionSlotV2.basePnlUsd.le(BigInt.fromString("0"))
      ? trades.loseCount.plus(BigInt.fromString("1"))
      : trades.loseCount;
    trades.cumulativePnl=trades.cumulativePnl.plus(positionSlotV2.basePnlUsd)
    }
    if(eventType == 'Liquidated'){
      trades.totalLiquidated=trades.totalLiquidated.plus(BigInt.fromString("1"))
    }  
    trades.save();
  }
  
  
  
  export function loadOrCreateTradeAnalyticsDaily(
    periodId: i32,
    account: string
  ): TraderAnalyticsV2Daily {
    let temp = TraderAnalyticsV2Daily.load(`${periodId}_${account}`);
    if (temp) {
      return temp;
    }
    temp = new TraderAnalyticsV2Daily(`${periodId}_${account}`);
    let hourStartUnix = periodId * 86400;
    temp.account = account;
    temp.increaseCount = ZERO_BI;
    temp.cumulativeSize = ZERO_BI;
    temp.cumulativeFee = ZERO_BI;
    temp.cumulativeCollateral = ZERO_BI;
    temp.maxSize = ZERO_BI;
    temp.maxCollateral = ZERO_BI;
    temp.cumulativePnl = ZERO_BI;
    temp.openCount = ZERO_BI;
    temp.totalPositions = ZERO_BI;
    temp.increaseCount = ZERO_BI;
    temp.decreaseCount = ZERO_BI;
    temp.lastSettledPositionAt = ZERO_BI;
    temp.lastOpenPositionAt = ZERO_BI;
    temp.totalLiquidated = ZERO_BI;
    temp.startTime = BigInt.fromI32(hourStartUnix);
    temp.winCount = ZERO_BI;
    temp.loseCount = ZERO_BI;
    temp.winCountWithFee = ZERO_BI;
    temp.loseCountWithFee = ZERO_BI;
    temp.save();
    return temp;
  }
  