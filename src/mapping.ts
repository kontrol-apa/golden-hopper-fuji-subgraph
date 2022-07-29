import { Address, BigInt, log, store } from "@graphprotocol/graph-ts"
import {
  GH,
  Approval,
  ApprovalForAll,
  OwnerUpdated,
  Transfer
} from "../generated/GH/GH"
import { Owner, Token } from "../generated/schema"

export function handleApproval(event: Approval): void {}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleOwnerUpdated(event: OwnerUpdated): void {}

export function handleTransfer(event: Transfer): void {
  if(event.params.from.equals(Address.zero())){ // mint
    let owner = Owner.load(event.params.to.toHex());
    if(!owner){
      owner = new Owner(event.params.to.toHex());
      owner.count = 0;
    }
    owner.address = event.params.to;
    owner.count++;
    owner.save();
    let token = new Token(event.params.id.toString());
    token.owner = event.params.to.toHex();
    token.ownerString = event.params.to.toHex();
    token.save();

  }
  else if(event.params.to.equals(Address.zero())) { // burn
    let owner = Owner.load(event.params.to.toHex());
    if(!owner){
      log.error("Something wrong!", []);
    }
    else {
      owner.count--;
      if(owner.count == 0){
        store.remove("Owner", event.params.to.toHex())
      }
      else {
        owner.save();
      }
    }
    store.remove("Token",event.params.id.toString());
    
    
  }
  else { // Normal transfer
    let previousOwner = Owner.load(event.params.from.toHex());
    if(!previousOwner){
      log.error("Something wrong!", []);
    }
    else {
      previousOwner.count--;
      if(previousOwner.count == 0){
        store.remove("Owner", event.params.from.toHex())
      }
      else {
        previousOwner.save();
      }
    }

    let newOwner = Owner.load(event.params.from.toHex());
    if(!newOwner){
      newOwner = new Owner(event.params.to.toHex());
      newOwner.count = 0;
      newOwner.address = event.params.to;
    }
    newOwner.count++;
    newOwner.save();


    let token = Token.load(event.params.id.toString());
    if(!token){
      log.error("Something wrong!", []);
    }
    else {
      token.owner = event.params.to.toHex();
      token.ownerString = event.params.to.toHex();
      token.save();
    }
  }
}
