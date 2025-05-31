import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  PrivacyMarketplace,
  RequestPosted,
  BidSubmitted,
  BidAccepted,
  ChannelKeyPublished
} from "../generated/PrivacyMarketplace/PrivacyMarketplace";
import { Request, Bid } from "../generated/schema";

export function handleRequestPosted(event: RequestPosted): void {
  const requestId = event.params.requestId.toString();
  
  let request = new Request(requestId);
  request.commitment = event.params.commitment;
  request.encryptedCID = event.params.encryptedCID;
  request.timestamp = event.params.timestamp;
  request.isActive = true;
  request.bidCount = BigInt.fromI32(0);
  request.save();
}

export function handleBidSubmitted(event: BidSubmitted): void {
  const requestId = event.params.requestId.toString();
  const bidId = requestId + "-" + event.params.bidIndex.toString();
  
  let bid = new Bid(bidId);
  bid.request = requestId;
  bid.bidIndex = event.params.bidIndex;
  bid.bidderCommitment = event.params.bidderCommitment;
  bid.encryptedBidMetadataCID = event.params.encryptedBidMetadataCID;
  bid.timestamp = event.params.timestamp;
  bid.isAccepted = false;
  bid.save();

  // Update request bid count
  let request = Request.load(requestId);
  if (request) {
    request.bidCount = request.bidCount.plus(BigInt.fromI32(1));
    request.save();
  }
}

export function handleBidAccepted(event: BidAccepted): void {
  const requestId = event.params.requestId.toString();
  const bidId = requestId + "-" + event.params.bidIndex.toString();
  
  let bid = Bid.load(bidId);
  if (bid) {
    bid.isAccepted = true;
    bid.save();
  }
}

export function handleChannelKeyPublished(event: ChannelKeyPublished): void {
  const requestId = event.params.requestId.toString();
  const bidId = requestId + "-" + event.params.bidIndex.toString();
  
  let bid = Bid.load(bidId);
  if (bid) {
    bid.encryptedKey = event.params.encryptedKey;
    bid.save();
  }
}
