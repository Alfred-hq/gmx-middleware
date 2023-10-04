import { TraderAnalytics, Trades, PositionSettled } from "../generated/schema";
import {
  ClosePosition as ClosePositionEvent,
  DecreasePosition as DecreasePositionEvent,
  IncreasePosition as IncreasePositionEvent,
  LiquidatePosition as LiquidatePositionEvent,
  UpdatePosition as UpdatePositionEvent,
} from "../generated/Vault/Vault";
import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ZERO_BI } from "./const";

export function updateIncreaseTradeAnalytics(
  event: IncreasePositionEvent
): void {
  const trades = initializeAnalyticsEntity(event.params.account.toHexString());

  trades.increaseCount = trades.increaseCount.plus(BigInt.fromString("1"));
  trades.cumulativeSizeOpen = event.params.sizeDelta.plus(trades.cumulativeSize);
  trades.cumulativeCollateralOpen = event.params.collateralDelta.plus(
    trades.cumulativeCollateral
  );
  trades.cumulativeFeeOpen = event.params.fee.plus(trades.cumulativeFee);

  trades.save();
}

export function updateDecreaseTradeAnalytics(
  event: DecreasePositionEvent
): void {
  const trades = initializeAnalyticsEntity(event.params.account.toHexString());

  trades.decreaseCount = trades.decreaseCount.plus(BigInt.fromString("1"));
  trades.cumulativeFeeOpen = event.params.fee.plus(trades.cumulativeFee);

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

  trades.maxCollateral = event.params.collateral.gt(trades.maxCollateral)
    ? event.params.collateral
    : trades.maxCollateral;
  trades.maxSize = event.params.size.gt(trades.maxSize)
    ? event.params.size
    : trades.maxSize;

  // last open position count is not changed if there is no new position
  trades.openCount =
    tradesTable.status == "Open"
      ? trades.openCount.plus(BigInt.fromString("1"))
      : trades.openCount;

  // last open position will be forwarded if there is no new open position event
  trades.lastOpenPositionAt =
    tradesTable.status == "Open"
      ? event.block.timestamp
      : trades.lastOpenPositionAt;

  trades.save();
}

export function updateCloseTradeAnalytics(event: ClosePositionEvent): void {
  const tradesTable = Trades.load(
    `${event.transaction.hash.toHexString()}_${event.logIndex
      .minus(BigInt.fromString("1"))
      .toString()}`
  );

  if (!tradesTable) return;
  if (tradesTable.account === null) return;

  // Fetching realised pnl from position settled
  const positionSettled = PositionSettled.load(
    Bytes.fromUTF8("PositionSettled")
      .concat(event.transaction.hash.concatI32(event.logIndex.toI32()))
      .toHexString()
  );

  if (positionSettled === null) return;

  const netPnl = positionSettled.realisedPnl.minus(
    positionSettled.cumulativeFee
  );

  const trades = initializeAnalyticsEntity(tradesTable.account);

  trades.lastSettledPositionAt = event.block.timestamp;
  trades.cumulativePnl = trades.cumulativePnl.plus(event.params.realisedPnl);
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
  trades.winCount = positionSettled.realisedPnl.gt(BigInt.fromString("0"))
    ? trades.winCount.plus(BigInt.fromString("1"))
    : trades.winCount;
  trades.loseCount = positionSettled.realisedPnl.le(BigInt.fromString("0"))
    ? trades.loseCount.plus(BigInt.fromString("1"))
    : trades.loseCount;
  trades.cumulativeCollateral=trades.cumulativeCollateral.plus(positionSettled.maxCollateral)
  trades.cumulativeFee=trades.cumulativeFee.plus(positionSettled.cumulativeFee)
  trades.cumulativeSize=trades.cumulativeSize.plus(positionSettled.maxSize)
  trades.save();
}

export function updateLiquidateTradeAnalytics(
  event: LiquidatePositionEvent
): void {
  const positionSettled = PositionSettled.load(
    Bytes.fromUTF8("PositionSettled")
      .concat(event.transaction.hash.concatI32(event.logIndex.toI32()))
      .toHexString()
  );
  if (positionSettled === null) return;
  const trades = initializeAnalyticsEntity(event.params.account.toHexString());

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
  trades.cumulativeCollateral=trades.cumulativeCollateral.plus(positionSettled.maxCollateral)
  trades.cumulativeFee=trades.cumulativeFee.plus(positionSettled.cumulativeFee)
  trades.cumulativeSize=trades.cumulativeSize.plus(positionSettled.maxSize)
  trades.save();
}

function initializeAnalyticsEntity(account: string): TraderAnalytics {
  let trades = TraderAnalytics.load(account);

  if (trades !== null) return trades;

  trades = new TraderAnalytics(account);
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
  trades.cumulativeCollateralOpen=ZERO_BI;
  trades.cumulativeFeeOpen=ZERO_BI;
  trades.cumulativeSizeOpen=ZERO_BI;

  return trades;
}
