import {
  TraderAnalytics,
  UpdatePosition,
  IncreasePosition,
  PositionSlot,
  DecreasePosition,
  Trades,
} from "../generated/schema";
import {
  ClosePosition as ClosePositionEvent,
  DecreasePosition as DecreasePositionEvent,
  IncreasePosition as IncreasePositionEvent,
  LiquidatePosition as LiquidatePositionEvent,
  UpdatePosition as UpdatePositionEvent,
} from "../generated/Vault/Vault";
import { BigInt } from "@graphprotocol/graph-ts";
import { ZERO_BI } from "./const";

export function updateIncreaseTradeAnalytics(
  event: IncreasePositionEvent
): void {
  const trades = initializeAnalyticsEntity(event.params.account);

  trades.increaseCount = trades.increaseCount.plus(BigInt.fromString("1"));
  trades.cumulativeSize = event.params.sizeDelta.plus(trades.cumulativeSize);
  trades.cumulativeCollateral = event.params.collateralDelta.plus(
    trades.cumulativeCollateral
  );
  trades.cumulativeFee = event.params.fee.plus(trades.cumulativeFee);

  trades.save();
}

export function updateDecreaseTradeAnalytics(
  event: DecreasePositionEvent
): void {
  const trades = initializeAnalyticsEntity(event.params.account);

  trades.decreaseCount = trades.decreaseCount.plus(BigInt.fromString("1"));
  trades.cumulativeFee = event.params.fee.plus(trades.cumulativeFee);

  trades.save();
}

export function updateUpdateTradeAnalytics(event: UpdatePositionEvent): void {
  const tradesTable = Trades.load(
    `${event.transaction.hash.toHexString()}_${event.logIndex
      .minus(BigInt.fromString("1"))
      .toString()}`
  );

  if (tradesTable === null) return;

  const trades = initializeAnalyticsEntity(tradesTable.account);

  trades.maxCollateral =
    event.params.collateral > trades.maxCollateral
      ? event.params.collateral
      : trades.maxCollateral;
  trades.maxSize =
    event.params.size > trades.maxSize ? event.params.size : trades.maxSize;
  trades.cumulativePnl = trades.cumulativePnl.plus(event.params.realisedPnl);
  trades.openCount =
    tradesTable.status === "Open"
      ? trades.openCount.plus(BigInt.fromString("1"))
      : trades.openCount;
  trades.lastOpenPositionAt =
    tradesTable.status === "Open"
      ? event.block.timestamp
      : BigInt.fromString("0");
  trades.save();
}

export function updateCloseTradeAnalytics(event: ClosePositionEvent): void {
  const decreasePositionTable = DecreasePosition.load(
    event.transaction.hash.concatI32(event.logIndex.toI32()).toHexString()
  );

  const positionSlotTable = PositionSlot.load(event.params.key.toHexString());

  if (decreasePositionTable === null || positionSlotTable === null) return;

  const netPnl = positionSlotTable.realisedPnl.minus(
    positionSlotTable.cumulativeFee
  );

  const trades = initializeAnalyticsEntity(decreasePositionTable.account);

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
  trades.winCount = positionSlotTable.realisedPnl.gt(BigInt.fromString("0"))
    ? trades.winCount.plus(BigInt.fromString("1"))
    : trades.winCount;
  trades.loseCount = positionSlotTable.realisedPnl.le(BigInt.fromString("0"))
    ? trades.loseCount.plus(BigInt.fromString("1"))
    : trades.loseCount;

  trades.save();
}

export function updateLiquidateTradeAnalytics(
  event: LiquidatePositionEvent
): void {
  const trades = initializeAnalyticsEntity(event.params.account);

  trades.totalPositions = trades.totalPositions.plus(BigInt.fromString("1"));
  trades.totalLiquidated = trades.totalLiquidated.plus(BigInt.fromString("1"));
  trades.lastSettledPositionAt = event.block.timestamp;
  trades.openCount = trades.openCount.lt(BigInt.fromString("1"))
    ? BigInt.fromString("0")
    : trades.openCount.minus(BigInt.fromString("1"));
  trades.loseCount = trades.loseCount.plus(BigInt.fromString("1"));
  trades.loseCountWithFee = trades.loseCountWithFee.plus(
    BigInt.fromString("1")
  );

  trades.save();
}

function initializeAnalyticsEntity(account): TraderAnalytics {
  let trades = TraderAnalytics.load(account.toHexString());

  if (trades !== null) return trades;

  trades = new TraderAnalytics(account.toHexString());
  trades.id = account.toHexString();
  trades.account = account.toHexString();
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
