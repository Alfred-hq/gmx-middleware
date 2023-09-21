import {
  EventLog as EventLogEvent,
  EventLog1 as EventLog1Event,
  EventLog1EventDataStruct,
  EventLog2 as EventLog2Event,
  EventLogEventDataStruct
} from "../generated/EventEmitter/EventEmitter"
import { EventLog, EventLog1, EventLog2 } from "../generated/schema"
import { handleDecreasePositionEventV2 } from "./decreasePosition";
import { EventData } from "./EventEmitter"
import { handleIncreasePositionEventV2 } from "./increasePosition";

export function handleEventLog(event: EventLogEvent): void {
  // let entity = new EventLog(
  //   event.transaction.hash.concatI32(event.logIndex.toI32())
  // )
  // entity.msgSender = event.params.msgSender
  // entity.eventName = event.params.eventName
  // entity.eventNameHash = event.params.eventNameHash
  // entity.eventData_addressItems_items =
  //   event.params.eventData.addressItems.items
  // entity.eventData_addressItems_arrayItems =
  //   event.params.eventData.addressItems.arrayItems
  // entity.eventData_uintItems_items = event.params.eventData.uintItems.items
  // entity.eventData_uintItems_arrayItems =
  //   event.params.eventData.uintItems.arrayItems
  // entity.eventData_intItems_items = event.params.eventData.intItems.items
  // entity.eventData_intItems_arrayItems =
  //   event.params.eventData.intItems.arrayItems
  // entity.eventData_boolItems_items = event.params.eventData.boolItems.items
  // entity.eventData_boolItems_arrayItems =
  //   event.params.eventData.boolItems.arrayItems
  // entity.eventData_bytes32Items_items =
  //   event.params.eventData.bytes32Items.items
  // entity.eventData_bytes32Items_arrayItems =
  //   event.params.eventData.bytes32Items.arrayItems
  // entity.eventData_bytesItems_items = event.params.eventData.bytesItems.items
  // entity.eventData_bytesItems_arrayItems =
  //   event.params.eventData.bytesItems.arrayItems
  // entity.eventData_stringItems_items = event.params.eventData.stringItems.items
  // entity.eventData_stringItems_arrayItems =
  //   event.params.eventData.stringItems.arrayItems

  // entity.blockNumber = event.block.number
  // entity.blockTimestamp = event.block.timestamp
  // entity.transactionHash = event.transaction.hash

  // entity.save()



  return
}

export function handleEventLog1(event: EventLog1Event): void {
  // let entity = new EventLog1(
  //   event.transaction.hash.concatI32(event.logIndex.toI32())
  // )
  // entity.msgSender = event.params.msgSender
  // entity.eventName = event.params.eventName
  // entity.eventNameHash = event.params.eventNameHash
  // entity.topic1 = event.params.topic1
  // entity.eventData_addressItems_items =
  //   event.params.eventData.addressItems.items
  // entity.eventData_addressItems_arrayItems =
  //   event.params.eventData.addressItems.arrayItems
  // entity.eventData_uintItems_items = event.params.eventData.uintItems.items
  // entity.eventData_uintItems_arrayItems =
  //   event.params.eventData.uintItems.arrayItems
  // entity.eventData_intItems_items = event.params.eventData.intItems.items
  // entity.eventData_intItems_arrayItems =
  //   event.params.eventData.intItems.arrayItems
  // entity.eventData_boolItems_items = event.params.eventData.boolItems.items
  // entity.eventData_boolItems_arrayItems =
  //   event.params.eventData.boolItems.arrayItems
  // entity.eventData_bytes32Items_items =
  //   event.params.eventData.bytes32Items.items
  // entity.eventData_bytes32Items_arrayItems =
  //   event.params.eventData.bytes32Items.arrayItems
  // entity.eventData_bytesItems_items = event.params.eventData.bytesItems.items
  // entity.eventData_bytesItems_arrayItems =
  //   event.params.eventData.bytesItems.arrayItems
  // entity.eventData_stringItems_items = event.params.eventData.stringItems.items
  // entity.eventData_stringItems_arrayItems =
  //   event.params.eventData.stringItems.arrayItems

  // entity.blockNumber = event.block.number
  // entity.blockTimestamp = event.block.timestamp
  // entity.transactionHash = event.transaction.hash

  // entity.save()
  const eventName = event.params.eventName;
  const isFeeEvent = eventName == "PositionFeesCollected"
  const isIncEvent = eventName == "PositionIncrease"
  const isDecEvent = eventName == "PositionDecrease"
  const data = new EventData(event.params.eventData as EventLog1EventDataStruct)

  if (!isFeeEvent && !isIncEvent && !isDecEvent) {
    return
  }
  if(isIncEvent){
      handleIncreasePositionEventV2(event,data)
  }
  // if(isDecEvent){
  //     handleDecreasePositionEventV2(event,data)
  // }
  return
}

export function handleEventLog2(event: EventLog2Event): void {
  // let entity = new EventLog2(
  //   event.transaction.hash.concatI32(event.logIndex.toI32())
  // )
  // entity.msgSender = event.params.msgSender
  // entity.eventName = event.params.eventName
  // entity.eventNameHash = event.params.eventNameHash
  // entity.topic1 = event.params.topic1
  // entity.topic2 = event.params.topic2
  // entity.eventData_addressItems_items =
  //   event.params.eventData.addressItems.items
  // entity.eventData_addressItems_arrayItems =
  //   event.params.eventData.addressItems.arrayItems
  // entity.eventData_uintItems_items = event.params.eventData.uintItems.items
  // entity.eventData_uintItems_arrayItems =
  //   event.params.eventData.uintItems.arrayItems
  // entity.eventData_intItems_items = event.params.eventData.intItems.items
  // entity.eventData_intItems_arrayItems =
  //   event.params.eventData.intItems.arrayItems
  // entity.eventData_boolItems_items = event.params.eventData.boolItems.items
  // entity.eventData_boolItems_arrayItems =
  //   event.params.eventData.boolItems.arrayItems
  // entity.eventData_bytes32Items_items =
  //   event.params.eventData.bytes32Items.items
  // entity.eventData_bytes32Items_arrayItems =
  //   event.params.eventData.bytes32Items.arrayItems
  // entity.eventData_bytesItems_items = event.params.eventData.bytesItems.items
  // entity.eventData_bytesItems_arrayItems =
  //   event.params.eventData.bytesItems.arrayItems
  // entity.eventData_stringItems_items = event.params.eventData.stringItems.items
  // entity.eventData_stringItems_arrayItems =
  //   event.params.eventData.stringItems.arrayItems

  // entity.blockNumber = event.block.number
  // entity.blockTimestamp = event.block.timestamp
  // entity.transactionHash = event.transaction.hash

  // entity.save()
  return
}
