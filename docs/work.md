# 🔒 Privacy-Preserving Request Marketplace (ERC-4337-Based)

A fully decentralized and privacy-first marketplace for posting and bidding on service requests using **Account Abstraction (ERC-4337)** and **encrypted off-chain metadata**.

---

## ✨ Overview

This protocol enables users to:

- **Post encrypted service requests** anonymously
- **Receive private bids** from other users, without revealing bidder identities
- **Accept bids** and **establish secure communication** with selected participants
- All without ever revealing the poster’s or bidder’s wallet address on-chain

All user interactions are done via **ERC-4337 UserOperations**, broadcast to **public bundlers**. No centralized relayers. No address leakage.

---

## 🧱 Architecture

### ✅ On-Chain (Solidity)

- Smart contract stores only:
  - `request.commitment` (hash of encryptedCID + salt)
  - `encryptedCID` (IPFS or Filecoin link)
  - `bid.commitment` (e.g., `keccak256(pubkey || nonce)`)
  - `encryptedBidMetadataCID`
- No `msg.sender` or wallet addresses stored or emitted
- Bid is only actionable **after requestor calls `acceptBid()`**
- Contract emits a **key-sharing event** when access is granted

### ✅ Off-Chain

- **ERC-4337-compatible smart accounts** used for posters and bidders
- **Encrypted metadata** uploaded to IPFS/Filecoin
- **Public bundlers** (e.g., Stackup, Pimlico) process meta-transactions
- **Communication keys** are encrypted to bidder pubkeys after bid acceptance

---

## 🧩 Smart Contract Interface

| Function | Description |
|---------|-------------|
| `postRequest(commitment, encryptedCID)` | Posts an encrypted request anonymously |
| `submitBid(requestId, bidderCommitment, encryptedBidMetadataCID)` | Posts a private bid, stored under a hash |
| `acceptBid(requestId, bidIndex)` | Accepts one bid from the set |
| `publishEncryptedKey(requestId, bidIndex, encryptedKey)` | Shares communication key only with accepted bidder |
| `BidSubmitted` (event) | No bidder address emitted |
| `BidAccepted` (event) | Only bidIndex and requestId |
| `ChannelKeyPublished` (event) | Used to initiate secure communication |

---

## 🔐 Privacy Features

| Feature                      | Mechanism                                   |
|------------------------------|----------------------------------------------|
| Poster anonymity             | Relayed through ERC-4337 UserOps            |
| Bidder anonymity             | Commitment hash; address never stored       |
| Encrypted metadata           | AES/ECIES + IPFS                            |
| Communication key exchange   | Encrypted-to-pubkey after bid acceptance    |
| No centralized relayer       | Bundler-agnostic using ERC-4337             |

---

## 🛠️ Stack

- Solidity (0.8.x)
- IPFS/Filecoin (encrypted payload storage)
- ERC-4337 Smart Wallets (Stackup, Pimlico, Safe AA SDK)
- Viem or Ethers.js (meta-tx generation)
- Optional: Lit Protocol or Noir for ZK identity management

---

## 🚧 Coming Soon

- [ ] ZK proof of identity (e.g., Semaphore, RLN, or Noir circuits)
- [ ] Lit Protocol encryption hooks
- [ ] UI for bid review, encrypted chat, and key management
- [ ] Subgraph for bid state indexing (no addresses!)

---

## 🧪 Example Flow

1. **Post Request**
   - Encrypt JSON → upload to IPFS
   - Compute `commitment = keccak256(encryptedCID || salt)`
   - Send `postRequest()` via ERC-4337 UserOp

2. **Submit Bid**
   - Encrypt note to requestor pubkey → upload to IPFS
   - Compute `bidderCommitment = keccak256(pubkey || nonce)`
   - Send `submitBid()` via ERC-4337 UserOp

3. **Accept + Grant Access**
   - Poster accepts selected bid
   - Encrypts AES key to bidder pubkey
   - Calls `publishEncryptedKey()` — only that bidder can decrypt

---

## 📜 License

MIT