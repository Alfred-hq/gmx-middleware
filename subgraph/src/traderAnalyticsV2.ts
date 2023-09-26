import {
    TraderAnalyticsV2,
    PositionSlotV2,
    IncreasePositionV2,
    DecreasePositionV2,
  } from "../generated/schema";
import { EventLog1 } from "../generated/EventEmitter/EventEmitter";
import { BigInt } from "@graphprotocol/graph-ts";
import { ZERO_BI } from "./const";
import { EventData } from "./EventEmitter";
  
  export function updateIncreaseTradeAnalyticsV2(
    event: EventLog1,data: EventData,eventType: string,key: string
  ): void {
    const positionSlotV2=PositionSlotV2.load(key);
    const increasePositionV2=IncreasePositionV2.load(`${event.transaction.hash.toHexString()}_${event.logIndex.toString()}`);
    if(!positionSlotV2 || !increasePositionV2){
        return
    }
    const trades = initializeV2AnalyticsEntity(positionSlotV2.account);
  
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
  
  export function updateDecreaseTradeAnalyticsV2(
    event: EventLog1,data: EventData,eventType: string,key: string
  ): void {
    const positionSlotV2=PositionSlotV2.load(key);
    const decreasePositionV2=DecreasePositionV2.load(`${event.transaction.hash.toHexString()}_${event.logIndex.toString()}`);
    if(!positionSlotV2 || !decreasePositionV2){
        return
    }
    const trades = initializeV2AnalyticsEntity(positionSlotV2.account);
  
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
    }
    if(eventType == 'Liquidated'){
      trades.totalLiquidated=trades.totalLiquidated.plus(BigInt.fromString("1"))
    } 
    trades.save();
  }
  
  
  
  function initializeV2AnalyticsEntity(account: string): TraderAnalyticsV2 {
    let trades = TraderAnalyticsV2.load(account);
  
    if (trades !== null) return trades;
  
    trades = new TraderAnalyticsV2(account);
    trades.id = account;
    trades.account = account;
    trades.cumulativeSize = ZERO_BI;
    trades.cumulativeCollateral = ZERO_BI;
    trades.cumulativeFee = ZERO_BI;
    trades.maxSize = ZERO_BI;
    trades.maxCollateral = ZERO_BI;
    trades.cumulativePnl = ZERO_BI;
    trades.openCount = ZERO_BI;
    trades.totalPositions = ZERO_BI;
    trades.increaseCount = ZERO_BI;
    trades.decreaseCount = ZERO_BI;
    trades.lastSettledPositionAt = ZERO_BI;
    trades.lastOpenPositionAt = ZERO_BI;
    trades.totalLiquidated = ZERO_BI;
    trades.winCount = ZERO_BI;
    trades.loseCount = ZERO_BI;
    trades.winCountWithFee = ZERO_BI;
    trades.loseCountWithFee = ZERO_BI;
  
    return trades;
  }
  