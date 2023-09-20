import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  ClosePosition as ClosePositionEvent,
  DecreasePosition as DecreasePositionEvent,
  IncreasePosition as IncreasePositionEvent,
  LiquidatePosition as LiquidatePositionEvent,
  Swap as SwapEvent,
  UpdatePosition as UpdatePositionEvent,
} from "../generated/Vault/Vault";
import {
  ClosePosition,
  DecreasePosition,
  IncreasePosition,
  LiquidatePosition,
  PositionSettled,
  PositionSlot,
  Swap,
  PositionLink,
  UpdatePosition,
} from "../generated/schema";
import * as vaultPricefeed from "../generated/Vault/VaultPricefeed";
import { ZERO_BI } from "./const";
import {
  handleIncreaseTrades,
  handleUpdateTrades,
  handleDecreaseTrades,
  handleCloseTrades,
  handleLiquidateTrades,
} from "./groupedTrade";
import {
  updateIncreaseTradeAnalytics,
  updateDecreaseTradeAnalytics,
  updateUpdateTradeAnalytics,
  updateCloseTradeAnalytics,
  updateLiquidateTradeAnalytics,
} from "./traderAnalytics";

const vaultPricefeedAddress = Address.fromString(
  "0x2d68011bcA022ed0E474264145F46CC4de96a002"
);

const getPositionLinkId = (id: i32, key: Bytes): Bytes => {
  return Bytes.fromUTF8("PositionLink").concatI32(id).concat(key);
};

export function handleIncreasePosition(event: IncreasePositionEvent): void {
  let positionSlot = PositionSlot.load(event.params.key.toHexString());

  // init slot
  if (positionSlot === null) {
    positionSlot = new PositionSlot(event.params.key.toHexString());

    positionSlot.account = event.params.account.toHexString();
    positionSlot.collateralToken = event.params.collateralToken.toHexString();
    positionSlot.indexToken = event.params.indexToken.toHexString();
    positionSlot.isLong = event.params.isLong;
    positionSlot.key = event.params.key.toHexString();

    _resetPositionSlot(positionSlot);
  }

  const countId = positionSlot.size.equals(ZERO_BI)
    ? positionSlot.idCount + 1
    : positionSlot.idCount;
  positionSlot.blockTimestamp = positionSlot.size.equals(ZERO_BI)
    ? event.block.timestamp
    : positionSlot.blockTimestamp;
  positionSlot.blockNumber = positionSlot.size.equals(ZERO_BI)
    ? event.block.number
    : positionSlot.blockNumber;
  positionSlot.numberOfIncrease = positionSlot.numberOfIncrease.plus(
    BigInt.fromString("1")
  );
  positionSlot.lastIncreasedTimestamp = event.block.timestamp;
  const PositionLinkId = getPositionLinkId(countId, event.params.key);

  positionSlot.link = PositionLinkId.toHexString();
  positionSlot.idCount = countId;

  positionSlot.cumulativeCollateral = positionSlot.size.plus(
    event.params.collateralDelta
  );
  positionSlot.cumulativeSize = positionSlot.size.plus(event.params.sizeDelta);
  positionSlot.cumulativeFee = positionSlot.cumulativeFee.plus(
    event.params.fee
  );

  if (PositionLink.load(PositionLinkId.toHexString()) === null) {
    const positionLink = new PositionLink(PositionLinkId.toHexString());

    positionLink.account = event.params.account.toHexString();
    positionLink.collateralToken = event.params.collateralToken.toHexString();
    positionLink.indexToken = event.params.indexToken.toHexString();
    positionLink.isLong = event.params.isLong;
    positionLink.key = event.params.key.toHexString();

    positionLink.blockNumber = event.block.number;
    positionLink.blockTimestamp = event.block.timestamp;
    positionLink.transactionHash = event.transaction.hash.toHexString();
    positionLink.transactionIndex = event.transaction.index;
    positionLink.logIndex = event.logIndex;

    positionLink.cumulativeCollateral = positionSlot.cumulativeCollateral;
    positionLink.cumulativeFee = positionSlot.cumulativeFee;
    positionLink.cumulativeSize = positionSlot.cumulativeSize;
    positionLink.averagePrice = ZERO_BI;
    positionLink.entryFundingRate = ZERO_BI;
    positionLink.reserveAmount = ZERO_BI;
    positionLink.realisedPnl = ZERO_BI;

    positionLink.maxSize = ZERO_BI;
    positionLink.maxCollateral = ZERO_BI;

    positionLink.settlePrice = ZERO_BI;
    positionLink.isLiquidated = false;
    positionLink.size = ZERO_BI;
    positionLink.collateral = ZERO_BI;
    positionLink.save();
  }

  handleIncreaseTrades(event, PositionLinkId);
  updateIncreaseTradeAnalytics(event);

  const entity = new IncreasePosition(
    event.transaction.hash.concatI32(event.logIndex.toI32()).toHexString()
  );
  entity.link = PositionLinkId.toHexString();
  entity.key = event.params.key.toHexString();
  entity.account = event.params.account.toHexString();
  entity.collateralToken = event.params.collateralToken.toHexString();
  entity.indexToken = event.params.indexToken.toHexString();
  entity.collateralDelta = event.params.collateralDelta;
  entity.sizeDelta = event.params.sizeDelta;
  entity.isLong = event.params.isLong;
  entity.price = event.params.price;
  entity.fee = event.params.fee;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash.toHexString();
  entity.transactionIndex = event.transaction.index;
  entity.logIndex = event.logIndex;

  positionSlot.save();
  entity.save();
}

export function handleDecreasePosition(event: DecreasePositionEvent): void {
  const positionSlot = PositionSlot.load(event.params.key.toHexString());

  if (positionSlot === null) {
    return;
    // throw new Error("PositionLink is null")
  }

  positionSlot.cumulativeFee = positionSlot.cumulativeFee.plus(
    event.params.fee
  );
  positionSlot.numberOfDecrease = positionSlot.numberOfDecrease.plus(
    BigInt.fromString("1")
  );
  positionSlot.lastDecreasedTimestamp = event.block.timestamp;
  positionSlot.lastDecreasedPrice = event.params.price;
  const positionLink = PositionLink.load(positionSlot.link);
  if (positionLink != null) {
    positionLink.cumulativeFee = positionSlot.cumulativeFee;
    positionLink.save();
  }

  const positionLinkId = getPositionLinkId(
    positionSlot.idCount,
    event.params.key
  );

  handleDecreaseTrades(event, positionLinkId);
  updateDecreaseTradeAnalytics(event);

  const entity = new DecreasePosition(
    event.transaction.hash.concatI32(event.logIndex.toI32()).toHexString()
  );
  entity.link = positionLinkId.toHexString();
  entity.key = event.params.key.toHexString();
  entity.account = event.params.account.toHexString();
  entity.collateralToken = event.params.collateralToken.toHexString();
  entity.indexToken = event.params.indexToken.toHexString();
  entity.collateralDelta = event.params.collateralDelta;
  entity.sizeDelta = event.params.sizeDelta;
  entity.isLong = event.params.isLong;
  entity.price = event.params.price;
  entity.fee = event.params.fee;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash.toHexString();
  entity.transactionIndex = event.transaction.index;
  entity.logIndex = event.logIndex;

  positionSlot.save();
  entity.save();
}

export function handleUpdatePosition(event: UpdatePositionEvent): void {
  const positionSlot = PositionSlot.load(event.params.key.toHexString());

  if (positionSlot === null) {
    return;
    // throw new Error("PositionLink is null")
  }

  positionSlot.collateral = event.params.collateral;
  positionSlot.realisedPnl = event.params.realisedPnl;
  positionSlot.averagePrice = event.params.averagePrice;
  positionSlot.size = event.params.size;
  positionSlot.reserveAmount = event.params.reserveAmount;
  positionSlot.entryFundingRate = event.params.entryFundingRate;
  positionSlot.maxCollateral =
    event.params.collateral > positionSlot.maxCollateral
      ? event.params.collateral
      : positionSlot.maxCollateral;
  positionSlot.maxSize =
    event.params.size > positionSlot.maxSize
      ? event.params.size
      : positionSlot.maxSize;

  positionSlot.save();
  const positionLink = PositionLink.load(positionSlot.link);
  if (positionLink != null) {
    positionLink.collateral = positionSlot.collateral;
    positionLink.averagePrice = positionSlot.averagePrice;
    positionLink.size = positionSlot.size;
    positionLink.reserveAmount = positionSlot.reserveAmount;
    positionLink.entryFundingRate = positionSlot.entryFundingRate;
    positionLink.maxCollateral = positionSlot.maxCollateral;
    positionLink.maxSize = positionSlot.maxSize;
    positionLink.save();
  }

  handleUpdateTrades(event);
  updateUpdateTradeAnalytics(event);

  const entity = new UpdatePosition(
    event.transaction.hash.concatI32(event.logIndex.toI32()).toHexString()
  );

  let price = ZERO_BI;
  if (event.block.number.gt(BigInt.fromString("30020987"))) {
    let priceCallResult = vaultPricefeed.VaultPricefeed.bind(
      vaultPricefeedAddress
    ).try_getPrimaryPrice(Address.fromString(positionSlot.indexToken), false);
    price = priceCallResult.reverted ? ZERO_BI : priceCallResult.value;
  }
  entity.link = getPositionLinkId(
    positionSlot.idCount,
    event.params.key
  ).toHexString();
  entity.account = positionSlot.account;
  entity.key = event.params.key.toHexString();
  entity.size = event.params.size;
  entity.collateral = event.params.collateral;
  entity.averagePrice = event.params.averagePrice;
  entity.entryFundingRate = event.params.entryFundingRate;
  entity.reserveAmount = event.params.reserveAmount;
  entity.realisedPnl = event.params.realisedPnl;
  entity.markPrice = price;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash.toHexString();
  entity.transactionIndex = event.transaction.index;
  entity.logIndex = event.logIndex;

  entity.save();
}

export function handleLiquidatePosition(event: LiquidatePositionEvent): void {
  const positionSlot = PositionSlot.load(event.params.key.toHexString());

  if (positionSlot === null) {
    return;
    // throw new Error("PositionLink is null")
  }
  const positionLink = PositionLink.load(positionSlot.link);
  if (positionLink != null) {
    positionLink.cumulativeCollateral = positionSlot.cumulativeCollateral;
    positionLink.maxCollateral = positionSlot.maxCollateral;
    positionLink.cumulativeFee = positionSlot.cumulativeFee;
    positionLink.cumulativeSize = positionSlot.cumulativeSize;
    positionLink.maxSize = positionSlot.maxSize;
    positionLink.averagePrice = positionSlot.averagePrice;
    positionLink.settlePrice = event.params.markPrice;
    positionLink.realisedPnl = positionSlot.realisedPnl;
    positionLink.entryFundingRate = positionSlot.entryFundingRate;
    positionLink.reserveAmount = positionSlot.reserveAmount;
    positionLink.isLiquidated = true;
    positionLink.size = positionSlot.size;
    positionLink.collateral = positionSlot.collateral;
    positionLink.save();
  }
  const positionSettled = new PositionSettled(
    Bytes.fromUTF8("PositionSettled")
      .concat(event.transaction.hash.concatI32(event.logIndex.toI32()))
      .toHexString()
  );
  positionSettled.idCount = positionSlot.idCount;
  positionSettled.link = positionSlot.link;

  positionSettled.account = positionSlot.account;
  positionSettled.collateralToken = positionSlot.collateralToken;
  positionSettled.indexToken = positionSlot.indexToken;
  positionSettled.isLong = positionSlot.isLong;
  positionSettled.key = positionSlot.key;

  positionSettled.collateral = positionSlot.collateral;
  positionSettled.size = positionSlot.size;
  positionSettled.averagePrice = positionSlot.averagePrice;
  positionSettled.entryFundingRate = positionSlot.entryFundingRate;
  positionSettled.realisedPnl = event.params.realisedPnl;
  positionSettled.reserveAmount = event.params.reserveAmount;

  positionSettled.cumulativeCollateral = positionSlot.cumulativeCollateral;
  positionSettled.cumulativeSize = positionSlot.cumulativeSize;
  positionSettled.cumulativeFee = positionSlot.cumulativeFee;

  positionSettled.maxCollateral = positionSlot.maxCollateral;
  positionSettled.maxSize = positionSlot.maxSize;

  positionSettled.settlePrice = event.params.markPrice;
  positionSettled.isLiquidated = true;

  positionSettled.blockNumber = event.block.number;
  positionSettled.blockTimestamp = event.block.timestamp;
  positionSettled.transactionHash = event.transaction.hash.toHexString();
  positionSettled.transactionIndex = event.transaction.index;
  positionSettled.logIndex = event.logIndex;
  positionSettled.openTime = positionSlot.blockTimestamp;
  positionSettled.closeTime = event.block.timestamp;
  positionSettled.numberOfIncrease = positionSlot.numberOfIncrease;
  positionSettled.numberOfDecrease = positionSlot.numberOfDecrease;

  _resetPositionSlot(positionSlot);
  positionSlot.save();
  positionSettled.save();

  const positionLinkId = getPositionLinkId(
    positionSlot.idCount,
    event.params.key
  );

  handleLiquidateTrades(event, positionLinkId);
  updateLiquidateTradeAnalytics(event);

  const entity = new LiquidatePosition(
    event.transaction.hash.concatI32(event.logIndex.toI32()).toHexString()
  );

  entity.link = positionLinkId.toHexString();
  entity.key = event.params.key.toHexString();
  entity.account = event.params.account.toHexString();
  entity.collateralToken = event.params.collateralToken.toHexString();
  entity.indexToken = event.params.indexToken.toHexString();
  entity.isLong = event.params.isLong;
  entity.size = event.params.size;
  entity.collateral = event.params.collateral;
  entity.reserveAmount = event.params.reserveAmount;
  entity.realisedPnl = event.params.realisedPnl;
  entity.markPrice = event.params.markPrice;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash.toHexString();
  entity.transactionIndex = event.transaction.index;
  entity.logIndex = event.logIndex;

  entity.save();
}

export function handleSwap(event: SwapEvent): void {
  const entity = new Swap(
    event.transaction.hash.concatI32(event.logIndex.toI32()).toHexString()
  );
  entity.account = event.params.account.toHexString();
  entity.tokenIn = event.params.tokenIn.toHexString();
  entity.tokenOut = event.params.tokenOut.toHexString();
  entity.amountIn = event.params.amountIn;
  entity.amountOut = event.params.amountOut;
  entity.amountOutAfterFees = event.params.amountOutAfterFees;
  entity.feeBasisPoints = event.params.feeBasisPoints;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash.toHexString();
  entity.transactionIndex = event.transaction.index;
  entity.logIndex = event.logIndex;

  entity.save();
}

export function handleClosePosition(event: ClosePositionEvent): void {
  const positionSlot = PositionSlot.load(event.params.key.toHexString());

  if (positionSlot === null) {
    return;
    // throw new Error("PositionLink is null")
  }
  const positionSettled = new PositionSettled(
    Bytes.fromUTF8("PositionSettled")
      .concat(event.transaction.hash.concatI32(event.logIndex.toI32()))
      .toHexString()
  );
  let price = ZERO_BI;
  if (event.block.number.gt(BigInt.fromString("30020987"))) {
    let priceCallResult = vaultPricefeed.VaultPricefeed.bind(
      vaultPricefeedAddress
    ).try_getPrimaryPrice(Address.fromString(positionSlot.indexToken), false);
    price = priceCallResult.reverted ? ZERO_BI : priceCallResult.value;
  }
  const positionLink = PositionLink.load(positionSlot.link);
  if (positionLink != null) {
    positionLink.cumulativeCollateral = positionSlot.cumulativeCollateral;
    positionLink.maxCollateral = positionSlot.maxCollateral;
    positionLink.cumulativeFee = positionSlot.cumulativeFee;
    positionLink.cumulativeSize = positionSlot.cumulativeSize;
    positionLink.maxSize = positionSlot.maxSize;
    positionLink.averagePrice = positionSlot.averagePrice;
    positionLink.settlePrice = price;
    positionLink.realisedPnl = positionSlot.realisedPnl;
    positionLink.entryFundingRate = positionSlot.entryFundingRate;
    positionLink.reserveAmount = positionSlot.reserveAmount;
    positionLink.isLiquidated = false;
    positionLink.size = positionSlot.size;
    positionLink.collateral = positionSlot.collateral;
    positionLink.save();
  }
  positionSettled.idCount = positionSlot.idCount;
  positionSettled.link = positionSlot.link;

  positionSettled.account = positionSlot.account;
  positionSettled.collateralToken = positionSlot.collateralToken;
  positionSettled.indexToken = positionSlot.indexToken;
  positionSettled.isLong = positionSlot.isLong;
  positionSettled.key = positionSlot.key;

  positionSettled.collateral = positionSlot.collateral;
  positionSettled.size = positionSlot.size;
  positionSettled.averagePrice = positionSlot.averagePrice;
  positionSettled.entryFundingRate = positionSlot.entryFundingRate;
  positionSettled.realisedPnl = event.params.realisedPnl;
  positionSettled.reserveAmount = event.params.reserveAmount;

  positionSettled.cumulativeCollateral = positionSlot.cumulativeCollateral;
  positionSettled.cumulativeSize = positionSlot.cumulativeSize;
  positionSettled.cumulativeFee = positionSlot.cumulativeFee;

  positionSettled.maxCollateral = positionSlot.maxCollateral;
  positionSettled.maxSize = positionSlot.maxSize;

  positionSettled.settlePrice = positionSlot.lastDecreasedPrice;
  positionSettled.isLiquidated = false;

  positionSettled.blockNumber = event.block.number;
  positionSettled.blockTimestamp = event.block.timestamp;
  positionSettled.transactionHash = event.transaction.hash.toHexString();
  positionSettled.transactionIndex = event.transaction.index;
  positionSettled.logIndex = event.logIndex;
  positionSettled.openTime = positionSlot.blockTimestamp;
  positionSettled.closeTime = event.block.timestamp;
  positionSettled.numberOfIncrease = positionSlot.numberOfIncrease;
  positionSettled.numberOfDecrease = positionSlot.numberOfDecrease;

  _resetPositionSlot(positionSlot);
  positionSlot.save();
  positionSettled.save();

  const entity = new ClosePosition(
    event.transaction.hash.concatI32(event.logIndex.toI32()).toHexString()
  );

  if (positionSlot === null) {
    throw new Error("positionSlot is null");
  }

  handleCloseTrades(event);
  updateCloseTradeAnalytics(event);

  entity.link = getPositionLinkId(
    positionSlot.idCount,
    event.params.key
  ).toHexString();
  entity.account = positionSlot.account;
  entity.key = event.params.key.toHexString();
  entity.size = event.params.size;
  entity.collateral = event.params.collateral;
  entity.averagePrice = event.params.averagePrice;
  entity.entryFundingRate = event.params.entryFundingRate;
  entity.reserveAmount = event.params.reserveAmount;
  entity.realisedPnl = event.params.realisedPnl;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash.toHexString();
  entity.transactionIndex = event.transaction.index;
  entity.logIndex = event.logIndex;

  entity.save();
}

function _resetPositionSlot(positionSlot: PositionSlot): PositionSlot {
  positionSlot.collateral = ZERO_BI;
  positionSlot.size = ZERO_BI;
  positionSlot.averagePrice = ZERO_BI;
  positionSlot.entryFundingRate = ZERO_BI;
  positionSlot.realisedPnl = ZERO_BI;
  positionSlot.reserveAmount = ZERO_BI;

  positionSlot.cumulativeCollateral = ZERO_BI;
  positionSlot.cumulativeSize = ZERO_BI;
  positionSlot.cumulativeFee = ZERO_BI;

  positionSlot.maxCollateral = ZERO_BI;
  positionSlot.maxSize = ZERO_BI;
  positionSlot.blockNumber = ZERO_BI;
  positionSlot.blockTimestamp = ZERO_BI;
  positionSlot.numberOfIncrease = ZERO_BI;
  positionSlot.numberOfDecrease = ZERO_BI;
  positionSlot.lastIncreasedTimestamp = ZERO_BI;
  positionSlot.lastDecreasedTimestamp = ZERO_BI;
  positionSlot.lastDecreasedPrice = ZERO_BI;
  return positionSlot;
}
