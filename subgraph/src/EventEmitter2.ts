import { Address, ethereum, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  EventLog2EventDataAddressItemsItemsStruct,
  EventLog2EventDataUintItemsItemsStruct,
  EventLog2EventDataStruct,
  EventLog2EventDataAddressItemsArrayItemsStruct,
  EventLog2EventDataUintItemsArrayItemsStruct,
  EventLog2EventDataBytesItemsItemsStruct,
  EventLog2EventDataBytes32ItemsItemsStruct,
  EventLog2EventDataBytesItemsArrayItemsStruct,
  EventLog2EventDataStringItemsArrayItemsStruct,
  EventLog2EventDataIntItemsItemsStruct,
  EventLogEventDataStruct,
} from "../generated/EventEmitter/EventEmitter";

export class EventData2 {
  constructor(public rawData: EventLog2EventDataStruct) {}

  getAddressItem(key: string): Address | null {
    return getItemByKey<Address, EventLog2EventDataAddressItemsItemsStruct>(
      this.rawData.addressItems.items,
      key
    );
  }

  getAddressItemString(key: string): string | null {
    let item = this.getAddressItem(key);

    if (item !== null) {
      return item.toHexString();
    }
    return null;
  }

  getAddressArrayItem(key: string): Array<Address> | null {
    return getItemByKey<
      Array<Address>,
      EventLog2EventDataAddressItemsArrayItemsStruct
    >(this.rawData.addressItems.arrayItems, key);
  }

  getAddressArrayItemString(key: string): Array<string> | null {
    let items = this.getAddressArrayItem(key);

    if (items !== null) {
      let _items = items as Array<Address>;
      let strigsArray = new Array<string>(items.length);

      for (let i = 0; i < _items.length; i++) {
        let item = _items[i] as Address;
        strigsArray[i] = item.toHexString();
      }

      return strigsArray;
    }

    return null;
  }

  getStringItem(key: string): string | null {
    let items = this.rawData.stringItems.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].key == key) {
        return items[i].value;
      }
    }

    return null;
  }

  getStringArrayItem(key: string): Array<string> | null {
    return getItemByKey<
      Array<string>,
      EventLog2EventDataStringItemsArrayItemsStruct
    >(this.rawData.stringItems.arrayItems, key);
  }

  getUintItem(key: string): BigInt | null {
    return getItemByKey<BigInt, EventLog2EventDataUintItemsItemsStruct>(
      this.rawData.uintItems.items,
      key
    );
  }

  getUintArrayItem(key: string): Array<BigInt> | null {
    return getItemByKey<
      Array<BigInt>,
      EventLog2EventDataUintItemsArrayItemsStruct
    >(this.rawData.uintItems.arrayItems, key);
  }

  getIntItem(key: string): BigInt | null {
    return getItemByKey<BigInt, EventLog2EventDataIntItemsItemsStruct>(
      this.rawData.intItems.items as Array<
        EventLog2EventDataIntItemsItemsStruct
      >,
      key
    );
  }

  getIntArrayItem(key: string): Array<BigInt> | null {
    return getItemByKey<
      Array<BigInt>,
      EventLog2EventDataUintItemsArrayItemsStruct
    >(this.rawData.intItems.arrayItems, key);
  }

  getBytesItem(key: string): Bytes | null {
    return getItemByKey<Bytes, EventLog2EventDataBytesItemsItemsStruct>(
      this.rawData.bytesItems.items,
      key
    );
  }

  getBytesArrayItem(key: string): Array<Bytes> | null {
    return getItemByKey<
      Array<Bytes>,
      EventLog2EventDataBytesItemsArrayItemsStruct
    >(this.rawData.bytesItems.arrayItems, key);
  }

  getBytes32Item(key: string): Bytes | null {
    return getItemByKey<Bytes, EventLog2EventDataBytes32ItemsItemsStruct>(
      this.rawData.bytes32Items.items as Array<EventLog2EventDataBytes32ItemsItemsStruct>,
      key
    );
  }

  getBytes32ArrayItem(key: string): Array<Bytes> | null {
    return getItemByKey<
      Array<Bytes>,
      EventLog2EventDataBytesItemsArrayItemsStruct
    >(this.rawData.bytes32Items.arrayItems, key);
  }

  // boolean type is not nullable in AssemblyScript, so we return false if the key is not found
  getBoolItem(key: string): boolean {
    let items = this.rawData.boolItems.items;

    for (let i = 0; i < items.length; i++) {
      if (items[i].key == key) {
        return items[i].value;
      }
    }

    return false;
  }
}

class EventDataItem<T> extends ethereum.Tuple {
  get key(): string {
    return this[0].toString();
  }

  get value(): T {
    return this[1] as T;
  }
}

function getItemByKey<T, TItem extends EventDataItem<T>>(
  items: Array<TItem>,
  key: string
): T | null {
  for (let i = 0; i < items.length; i++) {
    if (items[i].key == key) {
      return items[i].value;
    }
  }

  return null;
}
