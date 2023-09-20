import { Trades } from "../generated/schema";
import {
  ClosePosition as ClosePositionEvent,
  DecreasePosition as DecreasePositionEvent,
  IncreasePosition as IncreasePositionEvent,
  LiquidatePosition as LiquidatePositionEvent,
  UpdatePosition as UpdatePositionEvent,
} from "../generated/Vault/Vault";
import {BigInt, Bytes} from "@graphprotocol/graph-ts";

export function handleIncreaseTrades(
  event: IncreasePositionEvent,
  PositionLinkId: Bytes
): void {
  const trades = new Trades(
    `${event.transaction.hash}_${event.logIndex}`
  );

  trades.id = `${event.transaction.hash.toHexString()}_${event.logIndex.toString()}`;
  trades.link = PositionLinkId.toHexString();
  trades.key = event.params.key.toHexString();
  trades.account = event.params.account.toHexString();
  trades.collateralToken = event.params.collateralToken.toHexString();
  trades.indexToken = event.params.indexToken.toHexString();
  trades.collateralDelta = event.params.collateralDelta;
  trades.sizeDelta = event.params.sizeDelta;
  trades.positionSide = event.params.isLong ? "LONG" : "SHORT";
  trades.price = event.params.price;
  trades.fee = event.params.fee;
  trades.blockNumber = event.block.number;
  trades.blockTimestamp = event.block.timestamp;
  trades.transactionHash = event.transaction.hash.toHexString();
  trades.logIndex = event.logIndex;
  trades.status = "Increase";

  trades.save();
}

export function handleUpdateTrades(event: UpdatePositionEvent): void {
  const trades = Trades.load(
    `${event.transaction.hash.toHexString()}_${event.logIndex.minus(BigInt.fromString('1')).toString()}`
  );

  if (trades === null) return;

  trades.size = event.params.size;
  trades.collateral = event.params.collateral;
  trades.averagePrice = event.params.averagePrice;
  trades.entryFundingRate = event.params.entryFundingRate;
  trades.reserveAmount = event.params.reserveAmount;
  trades.realisedPnl = event.params.realisedPnl;
  trades.status =
    trades.status != "Decrease" && event.params.size.equals(trades.sizeDelta)
      ? "Open"
      : trades.status;

  trades.save();
}

export function handleDecreaseTrades(
  event: DecreasePositionEvent,
  PositionLinkId: Bytes
): void {
  const trades = new Trades(
    `${event.transaction.hash.toHexString()}_${event.logIndex}`
  );

  trades.link = PositionLinkId.toHexString();
  trades.key = event.params.key.toHexString();
  trades.account = event.params.account.toHexString();
  trades.collateralToken = event.params.collateralToken.toHexString();
  trades.indexToken = event.params.indexToken.toHexString();
  trades.collateralDelta = event.params.collateralDelta;
  trades.sizeDelta = event.params.sizeDelta;
  trades.positionSide = event.params.isLong ? "LONG" : "SHORT";
  trades.price = event.params.price;
  trades.fee = event.params.fee;
  trades.blockNumber = event.block.number;
  trades.blockTimestamp = event.block.timestamp;
  trades.transactionHash = event.transaction.hash.toHexString();
  trades.logIndex = event.logIndex;
  trades.status = "Decrease";

  trades.save();
}

export function handleCloseTrades(event: ClosePositionEvent): void {
  
  const trades = Trades.load(
    `${event.transaction.hash.toHexString()}_${event.logIndex.minus(BigInt.fromString('1')).toString()}`
  );

  if (trades === null) return;

  trades.size = event.params.size;
  trades.collateral = event.params.collateral;
  trades.averagePrice = event.params.averagePrice;
  trades.entryFundingRate = event.params.entryFundingRate;
  trades.reserveAmount = event.params.reserveAmount;
  trades.realisedPnl = event.params.realisedPnl;
  trades.status = "Close";

  trades.save();
}

export function handleLiquidateTrades(
  event: LiquidatePositionEvent,
  PositionLinkId: Bytes
):void {
  const trades = new Trades(
    `${event.transaction.hash.toHexString()}_${event.logIndex}`
  );

  trades.id = `${event.transaction.hash.toHexString()}_${event.logIndex}`;
  trades.link = PositionLinkId.toHexString();
  trades.key = event.params.key.toHexString();
  trades.account = event.params.account.toHexString();
  trades.collateralToken = event.params.collateralToken.toHexString();
  trades.indexToken = event.params.indexToken.toHexString();
  trades.collateralDelta = event.params.collateral;
  trades.sizeDelta = event.params.size;
  trades.positionSide = event.params.isLong ? "LONG" : "SHORT";
  trades.price = event.params.markPrice;
  trades.fee = BigInt.fromString("0");
  trades.blockNumber = event.block.number;
  trades.blockTimestamp = event.block.timestamp;
  trades.transactionHash = event.transaction.hash.toHexString();
  trades.logIndex = event.logIndex;
  trades.size = event.params.size;
  trades.collateral = event.params.collateral;
  trades.averagePrice = BigInt.fromString("0");
  trades.entryFundingRate = BigInt.fromString("0");
  trades.reserveAmount = event.params.reserveAmount;
  trades.realisedPnl = event.params.realisedPnl;
  trades.status = "Liquidated";

  trades.save();
}
