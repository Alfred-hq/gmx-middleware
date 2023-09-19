import { Trades } from "../generated/schema";
import {
  ClosePosition as ClosePositionEvent,
  DecreasePosition as DecreasePositionEvent,
  IncreasePosition as IncreasePositionEvent,
  LiquidatePosition as LiquidatePositionEvent,
  UpdatePosition as UpdatePositionEvent,
} from "../generated/Vault/Vault";
import BigInt from "@graphprotocol/graph-ts";

export function handleIncreaseTrades(
  event: IncreasePositionEvent,
  PositionLinkId
): void {
  const trades = new Trades(
    `${event.params.transactionHash}_${event.params.logIndex}`
  );

  trades.id = `${event.params.transactionHash}_${event.params.logIndex}`;
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

  trades.save();
}

export function handleUpdateTrades(event: UpdatePositionEvent): void {
  const trades = Trades.load(
    `${event.params.transactionHash}_${event.params.logIndex - 1}`
  );

  if (trades === null) return;

  trades.size = event.params.size;
  trades.collateral = event.params.collateral;
  trades.averagePrice = event.params.averagePrice;
  trades.entryFundingRate = event.params.entryFundingRate;
  trades.reserveAmount = event.params.reserveAmount;
  trades.realisedPnl = event.params.realisedPnl;
  trades.status =
    event.params.size == event.params.sizeDelta ? "Open" : "Increase";

  trades.save();
}

export function handleDecreaseTrades(
  event: DecreasePositionEvent,
  PositionLinkId
): void {
  const trades = new Trades(
    `${event.params.transactionHash}_${event.params.logIndex}`
  );

  trades.link = PositionLinkId.toHexString();
  trades.key = event.params.key.toHexString();
  trades.account = event.params.account.toHexString();
  trades.collateralToken = event.params.collateralToken.toHexString();
  trades.indexToken = event.params.indexToken.toHexString();
  trades.collateralDelta = event.params.collateralDelta;
  trades.sizeDelta = event.params.sizeDelta;
  trades.isLong = event.params.isLong;
  trades.price = event.params.price;
  trades.fee = event.params.fee;
  trades.blockNumber = event.block.number;
  trades.blockTimestamp = event.block.timestamp;
  trades.transactionHash = event.transaction.hash.toHexString();
  trades.logIndex = event.logIndex;

  trades.save();
}

export function handleCloseTrades(event: ClosePositionEvent): void {
  const trades = Trades.load(
    `${event.params.transactionHash}_${event.params.logIndex - 1}`
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
  PositionLinkId
) {
  const trades = new Trades(
    `${event.params.transactionHash}_${event.params.logIndex}`
  );

  trades.id = `${event.params.transactionHash}_${event.params.logIndex}`;
  trades.link = PositionLinkId.toHexString();
  trades.key = event.params.key.toHexString();
  trades.account = event.params.account.toHexString();
  trades.collateralToken = event.params.collateralToken.toHexString();
  trades.indexToken = event.params.indexToken.toHexString();
  trades.collateralDelta = event.params.collateral;
  trades.sizeDelta = event.params.size;
  trades.positionSide = event.params.isLong ? "LONG" : "SHORT";
  trades.price = event.params.price;
  trades.fee = BigInt.fromString('0');
  trades.blockNumber = event.block.number;
  trades.blockTimestamp = event.block.timestamp;
  trades.transactionHash = event.transaction.hash.toHexString();
  trades.logIndex = event.logIndex;
  trades.size = event.params.size;
  trades.collateral = event.params.collateral;
  trades.averagePrice = BigInt.fromString("0");
  trades.entryFundingRate = event.params.entryFundingRate;
  trades.reserveAmount = event.params.reserveAmount;
  trades.realisedPnl = event.params.realisedPnl;
  trades.status = "Liquidated";

  trades.save();
}
