import { EventLog2 } from "../generated/EventEmitter/EventEmitter";
import { OrderV2 } from "../generated/schema";
import { EventData2 } from "./EventEmitter2";
import { returnAddressOrZeroAddress } from "./common";
import { returnValueOrZero } from "./increasePosition";

export function handleOrderCreatedEventV2(
  event: EventLog2,
  data: EventData2
): void {
  const keyBytes32 = data.getBytes32Item("key");
  if (!keyBytes32) {
    return;
  }
  const key = keyBytes32.toHexString();
  let Order = new OrderV2(key);
  Order.key = key;
  Order.account = returnAddressOrZeroAddress(
    data.getAddressItemString("account")
  );
  Order.receiver = returnAddressOrZeroAddress(
    data.getAddressItemString("receiver")
  );
  Order.uiFeeReceiver = returnAddressOrZeroAddress(
    data.getAddressItemString("uiFeeReceiver")
  );
  Order.market = returnAddressOrZeroAddress(
    data.getAddressItemString("market")
  );
  Order.initialCollateralToken = returnAddressOrZeroAddress(
    data.getAddressItemString("initialCollateralToken")
  );
  Order.orderType = returnValueOrZero(data.getUintItem("orderType"));
  Order.decreasePositionSwapType = returnValueOrZero(
    data.getUintItem("decreasePositionSwapType")
  );
  Order.sizeDeltaUsd = returnValueOrZero(data.getUintItem("sizeDeltaUsd"));
  Order.initialCollateralDeltaAmount = returnValueOrZero(
    data.getUintItem("initialCollateralDeltaAmount")
  );
  Order.triggerPrice = returnValueOrZero(data.getUintItem("triggerPrice"));
  Order.acceptablePrice = returnValueOrZero(
    data.getUintItem("acceptablePrice")
  );
  Order.executionFee = returnValueOrZero(data.getUintItem("executionFee"));
  Order.callbackGasLimit = returnValueOrZero(
    data.getUintItem("callbackGasLimit")
  );
  Order.minOutputAmount = returnValueOrZero(
    data.getUintItem("minOutputAmount")
  );
  Order.updatedAtBlock = returnValueOrZero(data.getUintItem("updatedAtBlock"));

  Order.isLong = data.getBoolItem("isLong");
  Order.shouldUnwrapNativeToken = data.getBoolItem("shouldUnwrapNativeToken");
  Order.isFrozen = data.getBoolItem("isFrozen");

  Order.blockNumber = event.block.number;
  Order.blockTimestamp = event.block.timestamp;
  Order.transactionHash = event.transaction.hash.toHexString();
  Order.logIndex = event.logIndex;
  Order.isCancelled = false;
  Order.isExecuted = false;
  Order.save();
  return;
}

export function handleOrderUpdatedEventV2(
  event: EventLog2,
  data: EventData2
): void {
  const keyBytes32 = data.getBytes32Item("key");
  if (!keyBytes32) {
    return;
  }
  const key = keyBytes32.toHexString();
  let Order = OrderV2.load(key);
  if (Order) {
    Order.sizeDeltaUsd = returnValueOrZero(data.getUintItem("sizeDeltaUsd"));
    Order.triggerPrice = returnValueOrZero(data.getUintItem("triggerPrice"));
    Order.acceptablePrice = returnValueOrZero(
      data.getUintItem("acceptablePrice")
    );
    Order.minOutputAmount = returnValueOrZero(
      data.getUintItem("minOutputAmount")
    );

    Order.blockNumber = event.block.number;
    Order.blockTimestamp = event.block.timestamp;
    Order.transactionHash = event.transaction.hash.toHexString();
    Order.logIndex = event.logIndex;
    
    Order.save();
  }

  return;
}

export function handleOrderCancelledEventV2(
  event: EventLog2,
  data: EventData2
): void {
  const keyBytes32 = data.getBytes32Item("key");
  if (!keyBytes32) {
    return;
  }
  const key = keyBytes32.toHexString();
  let Order = OrderV2.load(key);
  if(Order) {
    Order.isCancelled = true;
    Order.reason = data.getStringItem("reason");
    Order.reasonBytes = data.getBytesItem("reasonBytes");

    Order.blockNumber = event.block.number;
    Order.blockTimestamp = event.block.timestamp;
    Order.transactionHash = event.transaction.hash.toHexString();
    Order.logIndex = event.logIndex;

    Order.save();
  }
  return;
}

export function handleOrderExecutedEventV2(
  event: EventLog2,
  data: EventData2
): void {
  const keyBytes32 = data.getBytes32Item("key");
  if (!keyBytes32) {
    return;
  }
  const key = keyBytes32.toHexString();
  let Order = OrderV2.load(key);
  if(Order) {
    Order.secondaryOrderType = returnValueOrZero(data.getUintItem("secondaryOrderType"));
    Order.isExecuted = true;

    Order.blockNumber = event.block.number;
    Order.blockTimestamp = event.block.timestamp;
    Order.transactionHash = event.transaction.hash.toHexString();
    Order.logIndex = event.logIndex;

    Order.save();
  }
  return;
}

