# EIP-4337 Account Abstraction Integration

This package provides a comprehensive React hook for integrating EIP-4337 account abstraction functionality using [permissionless.js](https://docs.pimlico.io/references/permissionless/) from Pimlico.

## Overview

EIP-4337 introduces account abstraction to Ethereum, allowing users to:
- Sign user operations instead of transactions
- Use smart contract wallets with custom logic
- Enable gasless transactions via paymasters
- Batch multiple operations together
- Implement custom validation logic

## Installation

The required dependencies are already included in the project:

```json
{
  "permissionless": "^0.2.17"
}
```

## Quick Start

### Basic Usage

```typescript
import { use4337UserOp } from "~~/hooks/k-marketplace";

function MyComponent() {
  const {
    isLoading,
    isInitialized,
    initializeClients,
    sendUserOperation,
    getUserOpReceipt,
    checkPaymasterSupport,
    estimateUserOpGas,
  } = use4337UserOp();

  // Initialize clients on mount
  useEffect(() => {
    initializeClients();
  }, [initializeClients]);

  const handleSendUserOp = async () => {
    const result = await sendUserOperation({
      to: "0x...", // Target address
      value: parseEther("0.1"), // Amount in ETH
      data: "0x", // Call data (optional)
    });
    
    if (result) {
      console.log("User operation hash:", result.userOpHash);
    }
  };

  return (
    <div>
      <button 
        onClick={handleSendUserOp}
        disabled={!isInitialized || isLoading}
      >
        Send User Operation
      </button>
    </div>
  );
}
```

### With Custom Configuration

```typescript
const {
  sendUserOperation,
  // ... other methods
} = use4337UserOp({
  bundlerUrl: "https://your-custom-bundler.com",
  paymasterUrl: "https://your-paymaster.com", // For gasless transactions
  smartAccountAddress: "0x...", // Custom smart account address
});
```

## API Reference

### Hook Configuration

```typescript
interface UserOpConfig {
  bundlerUrl?: string;      // Custom bundler URL (defaults to Pimlico)
  paymasterUrl?: string;    // Paymaster URL for gasless transactions
  smartAccountAddress?: Address; // Custom smart account address
}
```

### Send User Operation Parameters

```typescript
interface SendUserOpParams {
  to: Address;                    // Target contract/address
  value?: bigint;                 // ETH value to send
  data?: Hex;                     // Call data for contract interaction
  maxFeePerGas?: bigint;         // Maximum fee per gas
  maxPriorityFeePerGas?: bigint; // Maximum priority fee per gas
  usePaymaster?: boolean;         // Whether to use paymaster for gasless txs
}
```

### Return Values

```typescript
interface UserOpReceipt {
  userOpHash: Hash;        // Hash of the user operation
  transactionHash?: Hash;  // Hash of the underlying transaction
  success: boolean;        // Whether the operation succeeded
  actualGasUsed?: bigint;  // Actual gas used
  actualGasCost?: bigint;  // Actual gas cost
}
```

## Hook Methods

### `initializeClients()`
Initializes the smart account client and bundler client. Should be called once on component mount.

### `sendUserOperation(params: SendUserOpParams)`
Sends a user operation to the bundler for execution.

### `getUserOpReceipt(userOpHash: Hash)`
Retrieves the receipt for a specific user operation.

### `getUserOpByHash(userOpHash: Hash)`
Gets detailed information about a user operation by its hash.

### `checkPaymasterSupport()`
Checks if the current configuration supports paymaster functionality.

### `estimateUserOpGas(params: SendUserOpParams)`
Estimates gas costs for a user operation before sending.

## State Variables

- `isLoading`: Whether a user operation is currently being processed
- `isInitialized`: Whether the clients have been successfully initialized
- `smartAccountClient`: The initialized smart account client
- `publicClient`: The public client for reading blockchain data

## Environment Variables

Add your Pimlico API key to your environment variables:

```bash
NEXT_PUBLIC_PIMLICO_API_KEY=your_pimlico_api_key_here
```

## Examples

### Sending ETH

```typescript
const result = await sendUserOperation({
  to: "0x742d35Cc6634C0532925a3b8D78FF0C8B40e0aaa",
  value: parseEther("0.1"), // Send 0.1 ETH
});
```

### Contract Interaction

```typescript
// Encode function call data (example for ERC20 transfer)
const transferData = encodeFunctionData({
  abi: erc20Abi,
  functionName: 'transfer',
  args: [recipient, amount]
});

const result = await sendUserOperation({
  to: tokenContractAddress,
  data: transferData,
});
```

### Gasless Transaction

```typescript
const result = await sendUserOperation({
  to: contractAddress,
  data: callData,
  usePaymaster: true, // Enable gasless transaction
});
```

### Batch Operations

```typescript
// Multiple operations can be batched in a single user operation
const result = await sendUserOperation({
  to: batcherContract,
  data: encodedBatchCallData,
  value: BigInt(0),
});
```

## Error Handling

The hook provides comprehensive error handling with user-friendly notifications:

```typescript
try {
  const result = await sendUserOperation(params);
  if (result?.success) {
    // Handle success
  }
} catch (error) {
  // Error is automatically handled and displayed to user
  console.error("User operation failed:", error);
}
```

## Testing

The package includes comprehensive tests for both the hook and example component:

```bash
# Run tests
yarn test

# Run specific test files
yarn test use4337UserOp.test.tsx
yarn test UserOpExample.test.tsx
```

## Component Example

See `UserOpExample.tsx` for a complete working example that demonstrates:
- Form handling for user operation parameters
- Loading states and error handling
- Gas estimation
- Paymaster support checking
- Real-time status updates

## Best Practices

1. **Initialize Early**: Call `initializeClients()` as early as possible, preferably in a `useEffect` hook
2. **Error Handling**: Always check the return value and handle potential errors
3. **Gas Estimation**: Use `estimateUserOpGas()` to provide users with cost estimates
4. **Loading States**: Use the `isLoading` state to provide feedback during operations
5. **Paymaster Support**: Check `checkPaymasterSupport()` before enabling gasless features

## Troubleshooting

### Common Issues

1. **"Smart account client not initialized"**
   - Ensure `initializeClients()` has been called and completed
   - Check that wallet is connected

2. **"Failed to initialize smart account clients"**
   - Verify your Pimlico API key is set correctly
   - Check network configuration
   - Ensure wallet client is available

3. **High gas costs**
   - User operations typically have higher gas costs than regular transactions
   - Consider using a paymaster for gasless transactions
   - Estimate gas costs beforehand using `estimateUserOpGas()`

### Debug Mode

Enable debug logging by setting:

```typescript
// In your component
useEffect(() => {
  console.log("4337 Hook State:", {
    isInitialized,
    isLoading,
    smartAccountClient: !!smartAccountClient,
  });
}, [isInitialized, isLoading, smartAccountClient]);
```

## Further Reading

- [EIP-4337 Specification](https://eips.ethereum.org/EIPS/eip-4337)
- [Pimlico Documentation](https://docs.pimlico.io/)
- [permissionless.js Documentation](https://docs.pimlico.io/references/permissionless/)
- [Account Abstraction Explained](https://ethereum.org/en/roadmap/account-abstraction/)

## Support

For issues related to:
- **This integration**: Open an issue in the project repository
- **permissionless.js**: Check the [Pimlico documentation](https://docs.pimlico.io/)
- **EIP-4337 general**: Refer to the [specification](https://eips.ethereum.org/EIPS/eip-4337) 