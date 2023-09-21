import { getDailyId } from "./helper";
import {
  ClosePosition as ClosePositionEvent,
  DecreasePosition as DecreasePositionEvent,
  IncreasePosition as IncreasePositionEvent,
  LiquidatePosition as LiquidatePositionEvent,
  UpdatePosition as UpdatePositionEvent,
} from "../generated/Vault/Vault";
import { TraderAnalyticsDaily, Trades } from "../generated/schema";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { ZERO_BI } from "./const";

export function handleIncreaseTraderAnalytics(
  event: IncreasePositionEvent
): void {
  let dayPeriodId = getDailyId(event);

  let dayPeriodData = loadOrCreateTradeAnalyticsDaily(
    dayPeriodId,
    event.params.account.toHexString()
  );
  if (dayPeriodData) {
    dayPeriodData.increaseCount = dayPeriodData.increaseCount.plus(
      BigInt.fromString("1")
    );
    dayPeriodData.cumulativeCollateral =
      dayPeriodData.cumulativeCollateral.plus(event.params.collateralDelta);
    dayPeriodData.cumulativeSize = dayPeriodData.cumulativeSize.plus(
      event.params.sizeDelta
    );
    dayPeriodData.cumulativeFee = dayPeriodData.cumulativeFee.plus(
      event.params.fee
    );
    dayPeriodData.save();
  }
}
export function handleDecreaseTraderAnalytics(
  event: DecreasePositionEvent
): void {
  let dayPeriodId = getDailyId(event);

  let dayPeriodData = loadOrCreateTradeAnalyticsDaily(
    dayPeriodId,
    event.params.account.toHexString()
  );
  if (dayPeriodData) {
    dayPeriodData.decreaseCount = dayPeriodData.decreaseCount.plus(
      BigInt.fromString("1")
    );
    dayPeriodData.cumulativeFee = dayPeriodData.cumulativeFee.plus(
      event.params.fee
    );
    dayPeriodData.save();
  }
}

export function handleUpdatePositionTraderAnalytics(
  event: UpdatePositionEvent
): void {
  let dayPeriodId = getDailyId(event);
  const trades = Trades.load(
    `${event.transaction.hash.toHexString()}_${event.logIndex
      .minus(BigInt.fromString("1"))
      .toString()}`
  );
  if (!trades) return;
  if (trades.account === null) return;
  let dayPeriodData = loadOrCreateTradeAnalyticsDaily(
    dayPeriodId,
    trades.account
  );
  dayPeriodData.cumulativePnl = dayPeriodData.cumulativePnl.plus(
    event.params.realisedPnl
  );
  dayPeriodData.openCount =
    trades.status === "Open"
      ? dayPeriodData.openCount.plus(BigInt.fromString("1"))
      : dayPeriodData.openCount;
  dayPeriodData.lastOpenPositionAt =
    trades.status === "Open" ? event.block.timestamp : BigInt.fromString("0");
  dayPeriodData.maxCollateral = dayPeriodData.maxCollateral.gt(
    event.params.collateral
  )
    ? dayPeriodData.maxCollateral
    : event.params.collateral;
  dayPeriodData.maxSize = dayPeriodData.maxSize.gt(event.params.size)
    ? dayPeriodData.maxSize
    : event.params.size;
  dayPeriodData.save();
}

export function handleClosePositionTraderAnalytics(
  event: ClosePositionEvent
): void {
  let dayPeriodId = getDailyId(event);
  const trades = Trades.load(
    `${event.transaction.hash.toHexString()}_${event.logIndex
      .minus(BigInt.fromString("1"))
      .toString()}`
  );
  if (!trades) return;
  if (trades.account === null) return;
  let dayPeriodData = loadOrCreateTradeAnalyticsDaily(
    dayPeriodId,
    trades.account
  );
  dayPeriodData.lastSettledPositionAt = event.block.timestamp;
  dayPeriodData.totalPositions = dayPeriodData.totalPositions.plus(
    BigInt.fromString("1")
  );
  dayPeriodData.cumulativePnl = dayPeriodData.cumulativePnl.plus(
    event.params.realisedPnl
  );
  dayPeriodData.save();
}

export function handleLiquidatePositionTraderAnalytics(
  event: LiquidatePositionEvent
): void {
  let dayPeriodId = getDailyId(event);
  let dayPeriodData = loadOrCreateTradeAnalyticsDaily(
    dayPeriodId,
    event.params.account.toHexString()
  );
  // dayPeriodData.cumulativeFee=dayPeriodData.cumulativeFee.plus(event.params.)
  dayPeriodData.totalLiquidated = dayPeriodData.totalLiquidated.plus(
    BigInt.fromString("1")
  );
  dayPeriodData.totalPositions = dayPeriodData.totalPositions.plus(
    BigInt.fromString("1")
  );
  dayPeriodData.lastSettledPositionAt = event.block.timestamp;
  dayPeriodData.openCount = dayPeriodData.openCount.lt(BigInt.fromString("1"))
    ? BigInt.fromString("0")
    : dayPeriodData.openCount.minus(BigInt.fromString("1"));
  dayPeriodData.save();
}

export function loadOrCreateTradeAnalyticsDaily(
  periodId: i32,
  account: string
): TraderAnalyticsDaily {
  let temp = TraderAnalyticsDaily.load(`${periodId}_${account}`);
  if (temp) {
    return temp;
  }
  temp = new TraderAnalyticsDaily(`${periodId}_${account}`);
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
  temp.save();
  return temp;
}
