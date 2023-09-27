import {
  EventLog as EventLogEvent,
  EventLog1 as EventLog1Event,
  EventLog1EventDataStruct,
  EventLog2 as EventLog2Event,
  EventLogEventDataStringItemsArrayItemsStruct,
  EventLogEventDataStruct
} from "../generated/EventEmitter/EventEmitter"
import { handleDecreasePositionEventV2 } from "./decreasePosition";
import { EventData } from "./EventEmitter"
import { handleIncreasePositionEventV2 } from "./increasePosition";
import { log } from '@graphprotocol/graph-ts'
import { handleFeeEventV2 } from "./gmxV2Fee";
import { DecreasePositionV2, feeV2, PositionSettledV2, PositionSlotV2, IncreasePositionV2, TradesV2 } from "../generated/schema"
import { EventLog1 } from "../generated/EventEmitter/EventEmitter";


// export function handleEventLog(event: EventLogEvent): void {
//   log.info("event log",[])
//   return
// }

export function handleEventLog1(event: EventLog1Event): void {
  log.info("event log 1",[])
  const eventName = event.params.eventName;
  const isFeeEvent = eventName == "PositionFeesCollected"
  const isIncEvent = eventName == "PositionIncrease"
  const isDecEvent = eventName == "PositionDecrease"
  const data = new EventData(event.params.eventData)
  if (!isFeeEvent && !isIncEvent && !isDecEvent) {
    return
  }
  if(isIncEvent){
    log.debug("increase event ",[])
      handleIncreasePositionEventV2(event,data)
  }
  if(isDecEvent){
      log.debug("decrease event ",[])
      handleDecreasePositionEventV2(event,data)
  }
  if(isFeeEvent){
    log.debug("fee event ",[])
    handleFeeEventV2(event,data)
  }
  return
}

// export function handleEventLog2(event: EventLog2Event): void {
//   log.info("event log 2",[])
//   return
// }

