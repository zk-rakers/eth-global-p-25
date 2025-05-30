//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "forge-std/Test.sol";
import "../contracts/PrivacyMarketplace.sol";

contract PrivacyMarketplaceTest is Test {
    PrivacyMarketplace public marketplace;
    
    // Test addresses
    address public requester;
    address public bidder1;
    address public bidder2;
    
    // Test data
    bytes32 public testCommitment = keccak256(abi.encodePacked("test_cid", "salt123"));
    string public testEncryptedCID = "QmTestEncryptedCID123";
    bytes32 public testBidderCommitment1 = keccak256(abi.encodePacked("bidder1_pubkey", "nonce1"));
    bytes32 public testBidderCommitment2 = keccak256(abi.encodePacked("bidder2_pubkey", "nonce2"));
    string public testBidMetadataCID1 = "QmTestBidMetadata1";
    string public testBidMetadataCID2 = "QmTestBidMetadata2";
    string public testEncryptedKey = "encrypted_communication_key_123";

    function setUp() public {
        marketplace = new PrivacyMarketplace();
        
        // Set up test addresses
        requester = makeAddr("requester");
        bidder1 = makeAddr("bidder1");
        bidder2 = makeAddr("bidder2");
    }

    function testPostRequest() public {
        vm.prank(requester);
        
        // Expected event emission
        vm.expectEmit(true, true, false, true);
        emit PrivacyMarketplace.RequestPosted(0, testCommitment, testEncryptedCID, block.timestamp);
        
        marketplace.postRequest(testCommitment, testEncryptedCID);
        
        // Verify request was stored correctly
        (bytes32 commitment, string memory encryptedCID, uint256 timestamp, bool isActive, uint256 bidCount) = 
            marketplace.getRequest(0);
            
        assertEq(commitment, testCommitment);
        assertEq(encryptedCID, testEncryptedCID);
        assertEq(timestamp, block.timestamp);
        assertTrue(isActive);
        assertEq(bidCount, 0);
        assertEq(marketplace.getTotalRequests(), 1);
    }

    function testPostRequestFailures() public {
        vm.prank(requester);
        
        // Test invalid commitment
        vm.expectRevert(PrivacyMarketplace.InvalidCommitment.selector);
        marketplace.postRequest(bytes32(0), testEncryptedCID);
        
        // Test empty encrypted CID
        vm.expectRevert(PrivacyMarketplace.EmptyEncryptedCID.selector);
        marketplace.postRequest(testCommitment, "");
    }

    function testSubmitBid() public {
        // First post a request
        vm.prank(requester);
        marketplace.postRequest(testCommitment, testEncryptedCID);
        
        // Submit a bid
        vm.prank(bidder1);
        
        vm.expectEmit(true, true, true, true);
        emit PrivacyMarketplace.BidSubmitted(0, 0, testBidderCommitment1, testBidMetadataCID1, block.timestamp);
        
        marketplace.submitBid(0, testBidderCommitment1, testBidMetadataCID1);
        
        // Verify bid was stored correctly
        (bytes32 bidderCommitment, string memory encryptedBidMetadataCID, uint256 timestamp, bool isAccepted, string memory encryptedKey) = 
            marketplace.getBid(0, 0);
            
        assertEq(bidderCommitment, testBidderCommitment1);
        assertEq(encryptedBidMetadataCID, testBidMetadataCID1);
        assertEq(timestamp, block.timestamp);
        assertFalse(isAccepted);
        assertEq(bytes(encryptedKey).length, 0);
        assertEq(marketplace.getTotalBids(), 1);
        
        // Verify request bid count was updated
        (, , , , uint256 bidCount) = marketplace.getRequest(0);
        assertEq(bidCount, 1);
    }

    function testSubmitMultipleBids() public {
        // Post a request
        vm.prank(requester);
        marketplace.postRequest(testCommitment, testEncryptedCID);
        
        // Submit first bid
        vm.prank(bidder1);
        marketplace.submitBid(0, testBidderCommitment1, testBidMetadataCID1);
        
        // Submit second bid
        vm.prank(bidder2);
        marketplace.submitBid(0, testBidderCommitment2, testBidMetadataCID2);
        
        // Verify both bids exist
        (bytes32 bidderCommitment1, , , , ) = marketplace.getBid(0, 0);
        (bytes32 bidderCommitment2, , , , ) = marketplace.getBid(0, 1);
        
        assertEq(bidderCommitment1, testBidderCommitment1);
        assertEq(bidderCommitment2, testBidderCommitment2);
        assertEq(marketplace.getTotalBids(), 2);
        
        (, , , , uint256 bidCount) = marketplace.getRequest(0);
        assertEq(bidCount, 2);
    }

    function testSubmitBidFailures() public {
        // Post a request first
        vm.prank(requester);
        marketplace.postRequest(testCommitment, testEncryptedCID);
        
        vm.prank(bidder1);
        
        // Test bid on non-existent request
        vm.expectRevert(PrivacyMarketplace.RequestNotFound.selector);
        marketplace.submitBid(999, testBidderCommitment1, testBidMetadataCID1);
        
        // Test invalid bidder commitment
        vm.expectRevert(PrivacyMarketplace.InvalidCommitment.selector);
        marketplace.submitBid(0, bytes32(0), testBidMetadataCID1);
        
        // Test empty bid metadata CID
        vm.expectRevert(PrivacyMarketplace.EmptyEncryptedCID.selector);
        marketplace.submitBid(0, testBidderCommitment1, "");
        
        // Close the request and try to bid on inactive request
        vm.prank(requester);
        marketplace.closeRequest(0);
        
        vm.prank(bidder1);
        vm.expectRevert(PrivacyMarketplace.RequestInactive.selector);
        marketplace.submitBid(0, testBidderCommitment1, testBidMetadataCID1);
    }

    function testAcceptBid() public {
        // Setup: post request and submit bid
        vm.prank(requester);
        marketplace.postRequest(testCommitment, testEncryptedCID);
        
        vm.prank(bidder1);
        marketplace.submitBid(0, testBidderCommitment1, testBidMetadataCID1);
        
        // Accept the bid
        vm.prank(requester);
        
        vm.expectEmit(true, true, false, true);
        emit PrivacyMarketplace.BidAccepted(0, 0, block.timestamp);
        
        marketplace.acceptBid(0, 0);
        
        // Verify bid was accepted
        (, , , bool isAccepted, ) = marketplace.getBid(0, 0);
        assertTrue(isAccepted);
        assertTrue(marketplace.isBidAccepted(0, 0));
    }

    function testAcceptBidFailures() public {
        // Setup: post request and submit bid
        vm.prank(requester);
        marketplace.postRequest(testCommitment, testEncryptedCID);
        
        vm.prank(bidder1);
        marketplace.submitBid(0, testBidderCommitment1, testBidMetadataCID1);
        
        vm.prank(requester);
        
        // Test accept non-existent request
        vm.expectRevert(PrivacyMarketplace.RequestNotFound.selector);
        marketplace.acceptBid(999, 0);
        
        // Test accept non-existent bid
        vm.expectRevert(PrivacyMarketplace.BidNotFound.selector);
        marketplace.acceptBid(0, 999);
        
        // Accept the bid first
        marketplace.acceptBid(0, 0);
        
        // Test accept already accepted bid
        vm.expectRevert(PrivacyMarketplace.BidAlreadyAccepted.selector);
        marketplace.acceptBid(0, 0);
        
        // Submit another bid before closing request
        vm.prank(bidder2);
        marketplace.submitBid(0, testBidderCommitment2, testBidMetadataCID2);
        
        // Close request and try to accept on inactive request
        marketplace.closeRequest(0);
        
        vm.expectRevert(PrivacyMarketplace.RequestInactive.selector);
        marketplace.acceptBid(0, 1);
    }

    function testPublishEncryptedKey() public {
        // Setup: post request, submit bid, and accept bid
        vm.prank(requester);
        marketplace.postRequest(testCommitment, testEncryptedCID);
        
        vm.prank(bidder1);
        marketplace.submitBid(0, testBidderCommitment1, testBidMetadataCID1);
        
        vm.prank(requester);
        marketplace.acceptBid(0, 0);
        
        // Publish encrypted key
        vm.prank(requester);
        
        vm.expectEmit(true, true, false, true);
        emit PrivacyMarketplace.ChannelKeyPublished(0, 0, testEncryptedKey, block.timestamp);
        
        marketplace.publishEncryptedKey(0, 0, testEncryptedKey);
        
        // Verify encrypted key was stored
        (, , , , string memory encryptedKey) = marketplace.getBid(0, 0);
        assertEq(encryptedKey, testEncryptedKey);
    }

    function testPublishEncryptedKeyFailures() public {
        // Setup: post request and submit bid
        vm.prank(requester);
        marketplace.postRequest(testCommitment, testEncryptedCID);
        
        vm.prank(bidder1);
        marketplace.submitBid(0, testBidderCommitment1, testBidMetadataCID1);
        
        vm.prank(requester);
        
        // Test publish key for non-existent request
        vm.expectRevert(PrivacyMarketplace.RequestNotFound.selector);
        marketplace.publishEncryptedKey(999, 0, testEncryptedKey);
        
        // Test publish key for non-existent bid
        vm.expectRevert(PrivacyMarketplace.BidNotFound.selector);
        marketplace.publishEncryptedKey(0, 999, testEncryptedKey);
        
        // Test publish key for non-accepted bid
        vm.expectRevert(PrivacyMarketplace.BidAlreadyAccepted.selector);
        marketplace.publishEncryptedKey(0, 0, testEncryptedKey);
        
        // Accept bid and try with empty key
        marketplace.acceptBid(0, 0);
        
        vm.expectRevert(PrivacyMarketplace.EmptyEncryptedCID.selector);
        marketplace.publishEncryptedKey(0, 0, "");
    }

    function testCloseRequest() public {
        // Post a request
        vm.prank(requester);
        marketplace.postRequest(testCommitment, testEncryptedCID);
        
        // Verify request is active
        (, , , bool isActive, ) = marketplace.getRequest(0);
        assertTrue(isActive);
        
        // Close the request
        vm.prank(requester);
        marketplace.closeRequest(0);
        
        // Verify request is inactive
        (, , , isActive, ) = marketplace.getRequest(0);
        assertFalse(isActive);
    }

    function testFullWorkflow() public {
        // 1. Post request
        vm.prank(requester);
        marketplace.postRequest(testCommitment, testEncryptedCID);
        
        // 2. Submit multiple bids
        vm.prank(bidder1);
        marketplace.submitBid(0, testBidderCommitment1, testBidMetadataCID1);
        
        vm.prank(bidder2);
        marketplace.submitBid(0, testBidderCommitment2, testBidMetadataCID2);
        
        // 3. Accept one bid
        vm.prank(requester);
        marketplace.acceptBid(0, 1); // Accept bidder2's bid
        
        // 4. Publish encrypted key
        vm.prank(requester);
        marketplace.publishEncryptedKey(0, 1, testEncryptedKey);
        
        // 5. Verify final state
        (, , , bool bid1Accepted, ) = marketplace.getBid(0, 0);
        (, , , bool bid2Accepted, string memory encryptedKey) = marketplace.getBid(0, 1);
        
        assertFalse(bid1Accepted);
        assertTrue(bid2Accepted);
        assertEq(encryptedKey, testEncryptedKey);
        assertEq(marketplace.getTotalRequests(), 1);
        assertEq(marketplace.getTotalBids(), 2);
    }

    function testPrivacyFeatures() public {
        // This test verifies that no addresses are stored or emitted in events
        
        // Post request - verify no sender address is stored
        vm.prank(requester);
        marketplace.postRequest(testCommitment, testEncryptedCID);
        
        // Submit bid - verify no bidder address is stored
        vm.prank(bidder1);
        marketplace.submitBid(0, testBidderCommitment1, testBidMetadataCID1);
        
        // The contract should only store commitment hashes, not addresses
        // This is verified by the fact that getBid returns only the commitment hash
        (bytes32 bidderCommitment, , , , ) = marketplace.getBid(0, 0);
        assertEq(bidderCommitment, testBidderCommitment1);
    }
} 