import { ethereum, json } from "@graphprotocol/graph-ts";
import { EventLog1 } from "../generated/EventEmitter/EventEmitter"
import { oraclePrice ,Token } from "../generated/schema";
import { checkContract, returnAddressOrZeroAddress } from "./common";
import { EventData } from "./EventEmitter";
import { returnValueOrZero } from "./increasePosition";
//field for oracle prices
//address item 
//1 token
//uint items
//1 min price
//2 max price
//bool item 
//isPriceFeed


export function handleOraclePriceUpdateEvent(event: EventLog1,data: EventData): void{
    const tokenAddress=returnAddressOrZeroAddress(data.getAddressItemString("token"))
    const token=handleToken(tokenAddress)

    const minPrice=returnValueOrZero(data.getUintItem("minPrice"))
    const maxPrice=returnValueOrZero(data.getUintItem("maxPrice"))
    const isPriceFeed=data.getBoolItem("isPriceFeed")
    const priceUpdate=new oraclePrice(`${tokenAddress}_${event.block.number}`)
    priceUpdate.tokenAddress=tokenAddress;
    priceUpdate.blockNumber=event.block.number
    priceUpdate.minPrice=minPrice
    priceUpdate.maxPrice=maxPrice
    priceUpdate.blockTimestamp=event.block.timestamp
    priceUpdate.transactionHash=event.transaction.hash.toHexString()
    priceUpdate.isPriceFeed=isPriceFeed
    priceUpdate.logIndex=event.logIndex
    priceUpdate.token=token.id
    priceUpdate.save()
    return 
}
export function handleToken(tokenAddress:string):Token {
    let token = Token.load(tokenAddress)
    if(token){
        return token
    }
    token= new Token(tokenAddress)
    let isSyn=false
    isSyn=checkContract(tokenAddress)
    token.token=tokenAddress
    token.isSyn=isSyn
    token.save()
    return token
}
