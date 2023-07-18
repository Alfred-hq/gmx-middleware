import { Bytes } from "@graphprotocol/graph-ts"
import {
  CancelDecreaseOrder as CancelDecreaseOrderEvent,
  CancelIncreaseOrder as CancelIncreaseOrderEvent,
  CancelSwapOrder as CancelSwapOrderEvent,
  CreateDecreaseOrder as CreateDecreaseOrderEvent,
  CreateIncreaseOrder as CreateIncreaseOrderEvent,
  CreateSwapOrder as CreateSwapOrderEvent,
  ExecuteDecreaseOrder as ExecuteDecreaseOrderEvent,
  ExecuteIncreaseOrder as ExecuteIncreaseOrderEvent,
  ExecuteSwapOrder as ExecuteSwapOrderEvent,
  Initialize as InitializeEvent,
  UpdateDecreaseOrder as UpdateDecreaseOrderEvent,
  UpdateGov as UpdateGovEvent,
  UpdateIncreaseOrder as UpdateIncreaseOrderEvent,
  UpdateMinExecutionFee as UpdateMinExecutionFeeEvent,
  UpdateMinPurchaseTokenAmountUsd as UpdateMinPurchaseTokenAmountUsdEvent,
  UpdateSwapOrder as UpdateSwapOrderEvent
} from "../generated/OrderBookContract/OrderBookContract"
import {
  CancelDecreaseOrder,
  CancelIncreaseOrder,
  CancelSwapOrder,
  CreateDecreaseOrder,
  CreateIncreaseOrder,
  CreateSwapOrder,
  ExecuteDecreaseOrder,
  ExecuteIncreaseOrder,
  ExecuteSwapOrder,
  Initialize,
  UpdateDecreaseOrder,
  UpdateGov,
  UpdateIncreaseOrder,
  UpdateMinExecutionFee,
  UpdateMinPurchaseTokenAmountUsd,
  UpdateSwapOrder
} from "../generated/schema"

export function handleCancelDecreaseOrder(
  event: CancelDecreaseOrderEvent
): void {
  let entity = new CancelDecreaseOrder(
    event.transaction.hash.concatI32(event.logIndex.toI32()).toHexString()
  )
  entity.account = event.params.account.toHexString()
  entity.orderIndex = event.params.orderIndex
  entity.collateralToken = event.params.collateralToken.toHexString()
  entity.collateralDelta = event.params.collateralDelta
  entity.indexToken = event.params.indexToken.toHexString()
  entity.sizeDelta = event.params.sizeDelta
  entity.isLong = event.params.isLong
  entity.triggerPrice = event.params.triggerPrice
  entity.triggerAboveThreshold = event.params.triggerAboveThreshold
  entity.executionFee = event.params.executionFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash.toHexString()

  entity.save()
}

export function handleCancelIncreaseOrder(
  event: CancelIncreaseOrderEvent
): void {
  let entity = new CancelIncreaseOrder(
    event.transaction.hash.concatI32(event.logIndex.toI32()).toHexString()
  )
  entity.account = event.params.account.toHexString()
  entity.orderIndex = event.params.orderIndex
  entity.purchaseToken = event.params.purchaseToken.toHexString()
  entity.purchaseTokenAmount = event.params.purchaseTokenAmount
  entity.collateralToken = event.params.collateralToken.toHexString()
  entity.indexToken = event.params.indexToken.toHexString()
  entity.sizeDelta = event.params.sizeDelta
  entity.isLong = event.params.isLong
  entity.triggerPrice = event.params.triggerPrice
  entity.triggerAboveThreshold = event.params.triggerAboveThreshold
  entity.executionFee = event.params.executionFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash.toHexString()

  entity.save()
}

export function handleCancelSwapOrder(event: CancelSwapOrderEvent): void {
  let entity = new CancelSwapOrder(
    event.transaction.hash.concatI32(event.logIndex.toI32()).toHexString()
  )
  entity.account = event.params.account.toHexString()
  entity.orderIndex = event.params.orderIndex
  entity.path = event.params.path.map<string>((e: Bytes) => e.toHexString())
  entity.amountIn = event.params.amountIn
  entity.minOut = event.params.minOut
  entity.triggerRatio = event.params.triggerRatio
  entity.triggerAboveThreshold = event.params.triggerAboveThreshold
  entity.shouldUnwrap = event.params.shouldUnwrap
  entity.executionFee = event.params.executionFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash.toHexString()

  entity.save()
}

export function handleCreateDecreaseOrder(
  event: CreateDecreaseOrderEvent
): void {
  let entity = new CreateDecreaseOrder(
    event.transaction.hash.concatI32(event.logIndex.toI32()).toHexString()
  )
  entity.account = event.params.account.toHexString()
  entity.orderIndex = event.params.orderIndex
  entity.collateralToken = event.params.collateralToken.toHexString()
  entity.collateralDelta = event.params.collateralDelta
  entity.indexToken = event.params.indexToken.toHexString()
  entity.sizeDelta = event.params.sizeDelta
  entity.isLong = event.params.isLong
  entity.triggerPrice = event.params.triggerPrice
  entity.triggerAboveThreshold = event.params.triggerAboveThreshold
  entity.executionFee = event.params.executionFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash.toHexString()

  entity.save()
}

export function handleCreateIncreaseOrder(
  event: CreateIncreaseOrderEvent
): void {
  let entity = new CreateIncreaseOrder(
    event.transaction.hash.concatI32(event.logIndex.toI32()).toHexString()
  )
  entity.account = event.params.account.toHexString()
  entity.orderIndex = event.params.orderIndex
  entity.purchaseToken = event.params.purchaseToken.toHexString()
  entity.purchaseTokenAmount = event.params.purchaseTokenAmount
  entity.collateralToken = event.params.collateralToken.toHexString()
  entity.indexToken = event.params.indexToken.toHexString()
  entity.sizeDelta = event.params.sizeDelta
  entity.isLong = event.params.isLong
  entity.triggerPrice = event.params.triggerPrice
  entity.triggerAboveThreshold = event.params.triggerAboveThreshold
  entity.executionFee = event.params.executionFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash.toHexString()

  entity.save()
}

export function handleCreateSwapOrder(event: CreateSwapOrderEvent): void {
  let entity = new CreateSwapOrder(
    event.transaction.hash.concatI32(event.logIndex.toI32()).toHexString()
  )
  entity.account = event.params.account.toHexString()
  entity.orderIndex = event.params.orderIndex
  entity.path = event.params.path.map<string>((e: Bytes) => e.toHexString())
  entity.amountIn = event.params.amountIn
  entity.minOut = event.params.minOut
  entity.triggerRatio = event.params.triggerRatio
  entity.triggerAboveThreshold = event.params.triggerAboveThreshold
  entity.shouldUnwrap = event.params.shouldUnwrap
  entity.executionFee = event.params.executionFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash.toHexString()

  entity.save()
}

export function handleExecuteDecreaseOrder(
  event: ExecuteDecreaseOrderEvent
): void {
  let entity = new ExecuteDecreaseOrder(
    event.transaction.hash.concatI32(event.logIndex.toI32()).toHexString()
  )
  entity.account = event.params.account.toHexString()
  entity.orderIndex = event.params.orderIndex
  entity.collateralToken = event.params.collateralToken.toHexString()
  entity.collateralDelta = event.params.collateralDelta
  entity.indexToken = event.params.indexToken.toHexString()
  entity.sizeDelta = event.params.sizeDelta
  entity.isLong = event.params.isLong
  entity.triggerPrice = event.params.triggerPrice
  entity.triggerAboveThreshold = event.params.triggerAboveThreshold
  entity.executionFee = event.params.executionFee
  entity.executionPrice = event.params.executionPrice

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash.toHexString()

  entity.save()
}

export function handleExecuteIncreaseOrder(
  event: ExecuteIncreaseOrderEvent
): void {
  let entity = new ExecuteIncreaseOrder(
    event.transaction.hash.concatI32(event.logIndex.toI32()).toHexString()
  )
  entity.account = event.params.account.toHexString()
  entity.orderIndex = event.params.orderIndex
  entity.purchaseToken = event.params.purchaseToken.toHexString()
  entity.purchaseTokenAmount = event.params.purchaseTokenAmount
  entity.collateralToken = event.params.collateralToken.toHexString()
  entity.indexToken = event.params.indexToken.toHexString()
  entity.sizeDelta = event.params.sizeDelta
  entity.isLong = event.params.isLong
  entity.triggerPrice = event.params.triggerPrice
  entity.triggerAboveThreshold = event.params.triggerAboveThreshold
  entity.executionFee = event.params.executionFee
  entity.executionPrice = event.params.executionPrice

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash.toHexString()

  entity.save()
}

export function handleExecuteSwapOrder(event: ExecuteSwapOrderEvent): void {
  let entity = new ExecuteSwapOrder(
    event.transaction.hash.concatI32(event.logIndex.toI32()).toHexString()
  )
  entity.account = event.params.account.toHexString()
  entity.orderIndex = event.params.orderIndex
  entity.path = event.params.path.map<string>((e: Bytes) => e.toHexString())
  entity.amountIn = event.params.amountIn
  entity.minOut = event.params.minOut
  entity.amountOut = event.params.amountOut
  entity.triggerRatio = event.params.triggerRatio
  entity.triggerAboveThreshold = event.params.triggerAboveThreshold
  entity.shouldUnwrap = event.params.shouldUnwrap
  entity.executionFee = event.params.executionFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash.toHexString()

  entity.save()
}

export function handleInitialize(event: InitializeEvent): void {
  let entity = new Initialize(
    event.transaction.hash.concatI32(event.logIndex.toI32()).toHexString()
  )
  entity.router = event.params.router.toHexString()
  entity.vault = event.params.vault.toHexString()
  entity.weth = event.params.weth.toHexString()
  entity.usdg = event.params.usdg.toHexString()
  entity.minExecutionFee = event.params.minExecutionFee
  entity.minPurchaseTokenAmountUsd = event.params.minPurchaseTokenAmountUsd

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash.toHexString()

  entity.save()
}

export function handleUpdateDecreaseOrder(
  event: UpdateDecreaseOrderEvent
): void {
  let entity = new UpdateDecreaseOrder(
    event.transaction.hash.concatI32(event.logIndex.toI32()).toHexString()
  )
  entity.account = event.params.account.toHexString()
  entity.orderIndex = event.params.orderIndex
  entity.collateralToken = event.params.collateralToken.toHexString()
  entity.collateralDelta = event.params.collateralDelta
  entity.indexToken = event.params.indexToken.toHexString()
  entity.sizeDelta = event.params.sizeDelta
  entity.isLong = event.params.isLong
  entity.triggerPrice = event.params.triggerPrice
  entity.triggerAboveThreshold = event.params.triggerAboveThreshold

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash.toHexString()

  entity.save()
}

export function handleUpdateGov(event: UpdateGovEvent): void {
  let entity = new UpdateGov(
    event.transaction.hash.concatI32(event.logIndex.toI32()).toHexString()
  )
  entity.gov = event.params.gov.toHexString()

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash.toHexString()

  entity.save()
}

export function handleUpdateIncreaseOrder(
  event: UpdateIncreaseOrderEvent
): void {
  let entity = new UpdateIncreaseOrder(
    event.transaction.hash.concatI32(event.logIndex.toI32()).toHexString()
  )
  entity.account = event.params.account.toHexString()
  entity.orderIndex = event.params.orderIndex
  entity.collateralToken = event.params.collateralToken.toHexString()
  entity.indexToken = event.params.indexToken.toHexString()
  entity.isLong = event.params.isLong
  entity.sizeDelta = event.params.sizeDelta
  entity.triggerPrice = event.params.triggerPrice
  entity.triggerAboveThreshold = event.params.triggerAboveThreshold

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash.toHexString()

  entity.save()
}

export function handleUpdateMinExecutionFee(
  event: UpdateMinExecutionFeeEvent
): void {
  let entity = new UpdateMinExecutionFee(
    event.transaction.hash.concatI32(event.logIndex.toI32()).toHexString()
  )
  entity.minExecutionFee = event.params.minExecutionFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash.toHexString()

  entity.save()
}

export function handleUpdateMinPurchaseTokenAmountUsd(
  event: UpdateMinPurchaseTokenAmountUsdEvent
): void {
  let entity = new UpdateMinPurchaseTokenAmountUsd(
    event.transaction.hash.concatI32(event.logIndex.toI32()).toHexString()
  )
  entity.minPurchaseTokenAmountUsd = event.params.minPurchaseTokenAmountUsd

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash.toHexString()

  entity.save()
}

export function handleUpdateSwapOrder(event: UpdateSwapOrderEvent): void {
  let entity = new UpdateSwapOrder(
    event.transaction.hash.concatI32(event.logIndex.toI32()).toHexString()
  )
  entity.account = event.params.account.toHexString()
  entity.ordexIndex = event.params.ordexIndex
  entity.path = event.params.path.map<string>((e: Bytes) => e.toHexString())
  entity.amountIn = event.params.amountIn
  entity.minOut = event.params.minOut
  entity.triggerRatio = event.params.triggerRatio
  entity.triggerAboveThreshold = event.params.triggerAboveThreshold
  entity.shouldUnwrap = event.params.shouldUnwrap
  entity.executionFee = event.params.executionFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash.toHexString()

  entity.save()
}
