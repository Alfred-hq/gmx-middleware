import { ethereum } from "@graphprotocol/graph-ts"

export function getIntervalId(interval: intervalUnixTime, event: ethereum.Event): i32 {
    return event.block.timestamp.toI32() / interval
  }
export enum intervalUnixTime {
    SEC = 1,
    SEC60 = 60,
    MIN5 = 300,
    MIN15 = 900,
    MIN30 = 1800,
    MIN60 = 3600,
    HR2 = 7200,
    HR4 = 14400,
    HR8 = 28800,
    HR24 = 86400,
    DAY7 = 604800,
    MONTH = 2628000,
    MONTH2 = 5256000
  }

  export function getHourlyId(event: ethereum.Event): i32 {
    return getIntervalId(3600, event)
  }
  export function getDailyId(event: ethereum.Event): i32 {
    return getIntervalId(86400, event)
  }