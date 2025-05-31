//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "forge-std/console.sol";

/**
 * @title PrivacyMarketplace
 * @dev A privacy-preserving request marketplace using ERC-4337 Account Abstraction
 * @notice This contract enables anonymous posting and bidding on service requests
 * @author EthGlobal25 Team
 */
contract PrivacyMarketplace {
    uint256 public requestCounter = 0;
    uint256 public totalBids = 0;

    struct Request {
        bytes32 commitment; // keccak256(encryptedCID || salt)
        string encryptedCID; // IPFS/Filecoin link to encrypted metadata
        uint256 timestamp;
        bool isActive;
        uint256 bidCount;
        mapping(uint256 => Bid) bids;
        mapping(uint256 => bool) acceptedBids;
    }

    struct Bid {
        bytes32 bidderCommitment; // keccak256(pubkey || nonce)
        string encryptedBidMetadataCID; // IPFS/Filecoin link to encrypted bid data
        uint256 timestamp;
        bool isAccepted;
        string encryptedKey; // Set after bid acceptance for communication
    }

    mapping(uint256 => Request) public requests;
    
    event RequestPosted(
        uint256 indexed requestId,
        bytes32 indexed commitment,
        string encryptedCID,
        uint256 timestamp
    );

    event BidSubmitted(
        uint256 indexed requestId,
        uint256 indexed bidIndex,
        bytes32 indexed bidderCommitment,
        string encryptedBidMetadataCID,
        uint256 timestamp
    );

    event BidAccepted(
        uint256 indexed requestId,
        uint256 indexed bidIndex,
        uint256 timestamp
    );

    event ChannelKeyPublished(
        uint256 indexed requestId,
        uint256 indexed bidIndex,
        string encryptedKey,
        uint256 timestamp
    );

    error RequestNotFound();
    error RequestInactive();
    error BidNotFound();
    error BidAlreadyAccepted();
    error InvalidCommitment();
    error EmptyEncryptedCID();

    /**
     * @dev Posts an encrypted service request anonymously
     * @param commitment Hash of encryptedCID + salt for privacy
     * @param encryptedCID IPFS/Filecoin link to encrypted request metadata
     */
    function postRequest(
        bytes32 commitment,
        string calldata encryptedCID
    ) external {
        if (commitment == bytes32(0)) revert InvalidCommitment();
        if (bytes(encryptedCID).length == 0) revert EmptyEncryptedCID();

        uint256 requestId = requestCounter++;
        
        Request storage newRequest = requests[requestId];
        newRequest.commitment = commitment;
        newRequest.encryptedCID = encryptedCID;
        newRequest.timestamp = block.timestamp;
        newRequest.isActive = true;
        newRequest.bidCount = 0;

        emit RequestPosted(requestId, commitment, encryptedCID, block.timestamp);
    }

    /**
     * @dev Submits a private bid on a request
     * @param requestId The ID of the request to bid on
     * @param bidderCommitment Hash of bidder's pubkey + nonce for privacy
     * @param encryptedBidMetadataCID IPFS/Filecoin link to encrypted bid data
     */
    function submitBid(
        uint256 requestId,
        bytes32 bidderCommitment,
        string calldata encryptedBidMetadataCID
    ) external {
        Request storage request = requests[requestId];
        
        if (request.timestamp == 0) revert RequestNotFound();
        if (!request.isActive) revert RequestInactive();
        if (bidderCommitment == bytes32(0)) revert InvalidCommitment();
        if (bytes(encryptedBidMetadataCID).length == 0) revert EmptyEncryptedCID();

        uint256 bidIndex = request.bidCount++;
        
        Bid storage newBid = request.bids[bidIndex];
        newBid.bidderCommitment = bidderCommitment;
        newBid.encryptedBidMetadataCID = encryptedBidMetadataCID;
        newBid.timestamp = block.timestamp;
        newBid.isAccepted = false;

        totalBids++;

        emit BidSubmitted(
            requestId,
            bidIndex,
            bidderCommitment,
            encryptedBidMetadataCID,
            block.timestamp
        );
    }

    /**
     * @dev Accepts a specific bid on a request
     * @param requestId The ID of the request
     * @param bidIndex The index of the bid to accept
     */
    function acceptBid(uint256 requestId, uint256 bidIndex) external {
        Request storage request = requests[requestId];
        
        if (request.timestamp == 0) revert RequestNotFound();
        if (!request.isActive) revert RequestInactive();
        if (bidIndex >= request.bidCount) revert BidNotFound();
        if (request.bids[bidIndex].isAccepted) revert BidAlreadyAccepted();

        request.bids[bidIndex].isAccepted = true;
        request.acceptedBids[bidIndex] = true;

        emit BidAccepted(requestId, bidIndex, block.timestamp);
    }

    /**
     * @dev Publishes encrypted communication key for accepted bidder
     * @param requestId The ID of the request
     * @param bidIndex The index of the accepted bid
     * @param encryptedKey The encrypted communication key for the bidder
     */
    function publishEncryptedKey(
        uint256 requestId,
        uint256 bidIndex,
        string calldata encryptedKey
    ) external {
        Request storage request = requests[requestId];
        
        if (request.timestamp == 0) revert RequestNotFound();
        if (bidIndex >= request.bidCount) revert BidNotFound();
        if (!request.bids[bidIndex].isAccepted) revert BidAlreadyAccepted();
        if (bytes(encryptedKey).length == 0) revert EmptyEncryptedCID();

        request.bids[bidIndex].encryptedKey = encryptedKey;

        emit ChannelKeyPublished(requestId, bidIndex, encryptedKey, block.timestamp);
    }

    /**
     * @dev Closes a request (stops accepting new bids)
     * @param requestId The ID of the request to close
     */
    function closeRequest(uint256 requestId) external {
        Request storage request = requests[requestId];
        
        if (request.timestamp == 0) revert RequestNotFound();
        
        request.isActive = false;
    }

    // View Functions

    /**
     * @dev Gets request details
     * @param requestId The ID of the request
     * @return commitment The request commitment hash
     * @return encryptedCID The encrypted metadata CID
     * @return timestamp When the request was posted
     * @return isActive Whether the request is still accepting bids
     * @return bidCount Number of bids on this request
     */
    function getRequest(uint256 requestId) 
        external 
        view 
        returns (
            bytes32 commitment,
            string memory encryptedCID,
            uint256 timestamp,
            bool isActive,
            uint256 bidCount
        ) 
    {
        Request storage request = requests[requestId];
        if (request.timestamp == 0) revert RequestNotFound();

        return (
            request.commitment,
            request.encryptedCID,
            request.timestamp,
            request.isActive,
            request.bidCount
        );
    }

    /**
     * @dev Gets bid details
     * @param requestId The ID of the request
     * @param bidIndex The index of the bid
     * @return bidderCommitment The bidder's commitment hash
     * @return encryptedBidMetadataCID The encrypted bid metadata CID
     * @return timestamp When the bid was submitted
     * @return isAccepted Whether the bid was accepted
     * @return encryptedKey The encrypted communication key (if bid accepted)
     */
    function getBid(uint256 requestId, uint256 bidIndex)
        external
        view
        returns (
            bytes32 bidderCommitment,
            string memory encryptedBidMetadataCID,
            uint256 timestamp,
            bool isAccepted,
            string memory encryptedKey
        )
    {
        Request storage request = requests[requestId];
        if (request.timestamp == 0) revert RequestNotFound();
        if (bidIndex >= request.bidCount) revert BidNotFound();

        Bid storage bid = request.bids[bidIndex];
        return (
            bid.bidderCommitment,
            bid.encryptedBidMetadataCID,
            bid.timestamp,
            bid.isAccepted,
            bid.encryptedKey
        );
    }

    /**
     * @dev Checks if a bid is accepted
     * @param requestId The ID of the request
     * @param bidIndex The index of the bid
     * @return Whether the bid is accepted
     */
    function isBidAccepted(uint256 requestId, uint256 bidIndex) 
        external 
        view 
        returns (bool) 
    {
        Request storage request = requests[requestId];
        if (request.timestamp == 0) revert RequestNotFound();
        if (bidIndex >= request.bidCount) revert BidNotFound();

        return request.acceptedBids[bidIndex];
    }

    /**
     * @dev Gets the total number of requests
     * @return The current request counter
     */
    function getTotalRequests() external view returns (uint256) {
        return requestCounter;
    }

    /**
     * @dev Gets the total number of bids across all requests
     * @return The total number of bids
     */
    function getTotalBids() external view returns (uint256) {
        return totalBids;
    }
} 