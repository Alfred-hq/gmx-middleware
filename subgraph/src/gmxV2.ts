import {
  EventLog as EventLogEvent,
  EventLog1 as EventLog1Event,
  EventLog1EventDataStruct,
  EventLog2 as EventLog2Event,
  EventLogEventDataStringItemsArrayItemsStruct,
  EventLogEventDataStruct,
} from "../generated/EventEmitter/EventEmitter";
import { handleDecreasePositionEventV2 } from "./decreasePosition";
import { EventData } from "./EventEmitter";
import { handleIncreasePositionEventV2 } from "./increasePosition";
import { log } from "@graphprotocol/graph-ts";
import { handleFeeEventV2 } from "./gmxV2Fee";
import {
  DecreasePositionV2,
  feeV2,
  PositionSettledV2,
  PositionSlotV2,
  IncreasePositionV2,
  TradesV2,
  Market,
} from "../generated/schema";
import { EventLog1 } from "../generated/EventEmitter/EventEmitter";
import { handleOraclePriceUpdateEvent } from "./gmxv2Prices";
import { returnAddressOrZeroAddress } from "./common";
import { handleOrderCreatedEventV2, handleOrderCancelledEventV2, handleOrderUpdatedEventV2 } from "./ordersV2";
// export function handleEventLog(event: EventLogEvent): void {
//   log.info("event log",[])
//   return
// }

export function handleEventLog1(event: EventLog1Event): void {
  log.info("event log 1", []);
  const eventName = event.params.eventName;
  const isFeeEvent = eventName == "PositionFeesCollected";
  const isIncEvent = eventName == "PositionIncrease";
  const isDecEvent = eventName == "PositionDecrease";
  const isPriceEvent = eventName == "OraclePriceUpdate";
  const isMarketCreatedEvent = eventName == "MarketCreated";
  const isOrderCreatedEvent = eventName == "OrderCreated";
  const isOrderUpdatedEvent = eventName == "OrderUpdated";
  const isOrderCancelledEvent = eventName == "OrderCancelled";

  const data = new EventData(event.params.eventData);
  if (
    !isFeeEvent &&
    !isIncEvent &&
    !isDecEvent &&
    !isPriceEvent &&
    !isMarketCreatedEvent &&
    !isOrderCreatedEvent &&
    !isOrderUpdatedEvent &&
    !isOrderCancelledEvent
  ) {
    return;
  }
  if (isIncEvent) {
    log.debug("increase event ", []);
    handleIncreasePositionEventV2(event, data);
  }
  if (isDecEvent) {
    log.debug("decrease event ", []);
    handleDecreasePositionEventV2(event, data);
  }
  if (isFeeEvent) {
    log.debug("fee event ", []);
    handleFeeEventV2(event, data);
  }
  if (isPriceEvent) {
    log.debug("price event", []);
    handleOraclePriceUpdateEvent(event, data);
  }
  if (isMarketCreatedEvent) {
    log.debug("market event", []);
    handleMarketCreatedEvent(event, data);
  }
  if (isOrderCreatedEvent) {
    log.debug("order created event ", []);
    handleOrderCreatedEventV2(event, data);
  }
  if (isOrderUpdatedEvent) {
    log.debug("order updated event ", []);
    handleOrderUpdatedEventV2(event, data);
  }
  if (isOrderCancelledEvent) {
    log.debug("order cancelled event ", []);
    handleOrderCancelledEventV2(event, data);
  }
  return;
}

export function handleMarketCreatedEvent(
  event: EventLog1,
  data: EventData
): void {
  //address item
  //   marketToken
  // indexToken
  // longToken
  // shortToken
  const indexToken = returnAddressOrZeroAddress(
    data.getAddressItemString("indexToken")
  );
  const marketToken = returnAddressOrZeroAddress(
    data.getAddressItemString("marketToken")
  );
  const longToken = returnAddressOrZeroAddress(
    data.getAddressItemString("longToken")
  );
  const shortToken = returnAddressOrZeroAddress(
    data.getAddressItemString("shortToken")
  );
  const market = new Market(marketToken);
  market.indexToken = indexToken;
  market.longToken = longToken;
  market.shortToken = shortToken;
  market.marketToken = marketToken;
  market.save();
}

// export function handleEventLog2(event: EventLog2Event): void {
//   log.info("event log 2",[])
//   return
// }
