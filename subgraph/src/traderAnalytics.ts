import {
  TraderAnalytics,
  UpdatePosition,
  IncreasePosition,
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
import BigInt from "@graphprotocol/graph-ts";

export function updateIncreaseTradeAnalytics(
  event: IncreasePositionEvent
): void {
  let trades = TraderAnalytics.load(event.params.account.toString());

  if (trades === null) {
    trades = new TraderAnalytics(event.params.account.toString());
    trades.id = event.params.account.toString();
    trades.account = event.params.account.toString();
    trades.cumulativeSize = event.params.sizeDelta;
    trades.cumulativeCollateral = event.params.collateralDelta;
    trades.cumulativeFee = event.params.fee;
    trades.maxSize = event.params.sizeDelta;
    trades.maxCollateral = event.params.collateralDelta;
    trades.cumulativePnl = BigInt.fromString("0");
    trades.openCount = BigInt.fromString("0");
    trades.totalPositions = BigInt.fromString("0");
    trades.increaseCount = BigInt.fromString("1");
    trades.decreaseCount = BigInt.fromString("0");
    trades.lastSettledPositionAt = BigInt.fromString("0");
    trades.lastOpenPositionAt = BigInt.fromString("0");
    trades.totalLiquidated = BigInt.fromString("0");

    trades.save();

    return;
  }

  trades.increaseCount = trades.increaseCount + BigInt.fromString("1");
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
  let trades = TraderAnalytics.load(event.params.account.toString());

  if (trades === null) {
    trades = new TraderAnalytics(event.params.account.toString());
    trades.id = event.params.account.toString();
    trades.account = event.params.account.toString();
    trades.cumulativeSize = BigInt.fromString("0");
    trades.cumulativeCollateral = BigInt.fromString("0");
    trades.cumulativeFee = event.params.fee;
    trades.maxSize = BigInt.fromString("0");
    trades.maxCollateral = BigInt.fromString("0");
    trades.cumulativePnl = BigInt.fromString("0");
    trades.openCount = BigInt.fromString("0");
    trades.totalPositions = BigInt.fromString("0");
    trades.increaseCount = BigInt.fromString("0");
    trades.decreaseCount = BigInt.fromString("1");
    trades.lastSettledPositionAt = BigInt.fromString("0");
    trades.lastOpenPositionAt = BigInt.fromString("0");
    trades.totalLiquidated = BigInt.fromString("0");

    trades.save();

    return;
  }

  trades.decreaseCount = trades.decreaseCount + BigInt.fromString("1");
  trades.cumulativeFee = event.params.fee.plus(trades.cumulativeFee);

  trades.save();
}

export function updateUpdateTradeAnalytics(event: UpdatePositionEvent): void {
  const updatePositionTable = UpdatePosition.load(
    event.transaction.hash.concatI32(event.logIndex.toI32()).toHexString()
  );

  const tradesTable = Trades.load(
    `${event.transaction.hash.toHexString()}_${event.logIndex
      .minus(BigInt.fromString("1"))
      .toString()}`
  );

  let trades = TraderAnalytics.load(updatePositionTable.account);

  if (trades === null) {
    trades = new TraderAnalytics(updatePositionTable.account);
    trades.id = updatePositionTable.account;
    trades.account = updatePositionTable.account;
    trades.cumulativeSize = BigInt.fromString("0");
    trades.cumulativeCollateral = BigInt.fromString("0");
    trades.cumulativeFee = BigInt.fromString("0");
    trades.maxSize = event.params.size;
    trades.maxCollateral = event.params.collateral;
    trades.cumulativePnl = event.params.realisedPnl;
    trades.openCount =
      tradesTable.status === "Open"
        ? BigInt.fromString("1")
        : BigInt.fromString("0");
    trades.totalPositions = BigInt.fromString("0");
    trades.increaseCount = BigInt.fromString("0");
    trades.decreaseCount = BigInt.fromString("0");
    trades.lastSettledPositionAt = BigInt.fromString("0");
    trades.lastOpenPositionAt =
      tradesTable.status === "Open"
        ? event.block.timestamp
        : BigInt.fromString("0");
    trades.totalLiquidated = BigInt.fromString("0");

    trades.save();

    return;
  }

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

  let trades = TraderAnalytics.load(decreasePositionTable.account);

  if (trades === null) {
    trades = new TraderAnalytics(decreasePositionTable.account);
    trades.id = decreasePositionTable.account;
    trades.account = decreasePositionTable.account;
    trades.cumulativeSize = BigInt.fromString("0");
    trades.cumulativeCollateral = BigInt.fromString("0");
    trades.cumulativeFee = BigInt.fromString("0");
    trades.maxSize = BigInt.fromString("0");
    trades.maxCollateral = BigInt.fromString("0");
    trades.cumulativePnl = BigInt.fromString("0");
    trades.openCount =
      trades.openCount <= BigInt.fromString("0")
        ? BigInt.fromString("0")
        : trades.openCount.minus(BigInt.fromString("1"));
    trades.totalPositions = BigInt.fromString("1");
    trades.increaseCount = BigInt.fromString("0");
    trades.decreaseCount = BigInt.fromString("0");
    trades.lastSettledPositionAt = event.block.timestamp;
    trades.lastOpenPositionAt = BigInt.fromString("0");
    trades.totalLiquidated = BigInt.fromString("0");

    trades.save();

    return;
  }

  trades.lastSettledPositionAt = event.block.timestamp;
  trades.openCount =
    trades.openCount <= BigInt.fromString("0")
      ? BigInt.fromString("0")
      : trades.openCount.minus(BigInt.fromString("1"));
  trades.totalPositions = trades.totalPositions.plus(BigInt.String("1"));

  trades.save();
}

export function updateLiquidateTradeAnalytics(
  event: LiquidatePositionEvent
): void {
  let trades = TraderAnalytics.load(event.params.account.toString());

  if (trades === null) {
    trades = new TraderAnalytics(event.params.account.toString());
    trades.id = event.params.account.toString();
    trades.account = event.params.account.toString();
    trades.cumulativeSize = BigInt.fromString("0");
    trades.cumulativeCollateral = BigInt.fromString("0");
    trades.cumulativeFee = BigInt.fromString("0");
    trades.maxSize = BigInt.fromString("0");
    trades.maxCollateral = BigInt.fromString("0");
    trades.cumulativePnl = BigInt.fromString("0");
    trades.openCount =
      trades.openCount <= BigInt.fromString("0")
        ? BigInt.fromString("0")
        : trades.openCount.minus(BigInt.fromString("1"));
    trades.totalPositions = BigInt.fromString("1");
    trades.increaseCount = BigInt.fromString("0");
    trades.decreaseCount = BigInt.fromString("0");
    trades.lastSettledPositionAt = event.block.timestamp;
    trades.lastOpenPositionAt = BigInt.fromString("0");
    trades.totalLiquidated = BigInt.fromString("1");

    trades.save();

    return;
  }

  trades.totalPositions = trades.totalPositions.plus(BigInt.String("1"));
  trades.totalLiquidated = trades.totalLiquidated.plus(BigInt.String("1"));
  trades.lastSettledPositionAt = event.block.timestamp;
  trades.openCount =
    trades.openCount <= BigInt.fromString("0")
      ? BigInt.fromString("0")
      : trades.openCount.minus(BigInt.fromString("1"));

  trades.save();
}
