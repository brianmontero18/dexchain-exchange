# DexChain Exchange - Decentralized Exchange with ERC-20 Token

## Introduction

DexChain Exchange is a Decentralized Exchange (DEX) that leverages an Automated Market Maker (AMM) mechanism, allowing users to create and exchange ERC-20 tokens in a decentralized, permissionless manner. Liquidity providers can dynamically add liquidity, while users can perform token swaps using liquidity pools. The system emphasizes security, modularity, and scalability.

## Key Features

- **Dynamic Token Creation**: supports the creation of dynamic token pairs for any ERC-20 tokens, enabling liquidity pools for various tokens.
- **Automated Market Maker (AMM)**: trades are executed against liquidity pools, with token prices adjusting automatically based on pool reserves.
- **SafeERC20**: uses OpenZeppelin's `SafeERC20` to handle token transfers securely, preventing partial failures or invalid approvals.
- **ReentrancyGuard**: critical functions, such as adding/removing liquidity and swapping tokens, are protected by `ReentrancyGuard` to prevent reentrancy attacks.
- **Immutable**: key contract addresses (e.g., token addresses) are declared `immutable` to ensure they cannot be modified after deployment, improving security and efficiency.

## Best Practices & Design Patterns

### Separation of Responsibilities

I implemented a clear separation of concerns across the following smart contracts:

- **Dex Contract**: manages core exchange logic, including liquidity management and token swaps.
- **PairFactory Contract**: Dynamically creates and registers token pairs, acting as a registry for all token pairs.
- **Pair Contract**: manages liquidity pools for token pairs and handles token swaps.
- **MyERC20Token Contract**: implements ERC-20 functions with additional mint and burn capabilities.

This separation ensures each contract handles a specific responsibility, simplifying maintenance, security audits, and future upgrades.

### Modularization

DexChain is built modularly, allowing each contract to be extended or modified independently without affecting the rest of the system. This architecture enhances both flexibility and security.

### Design patterns used

- **Factory Pattern**: the `PairFactory` contract creates new token pairs dynamically and registers them for future use.
- **Registry Pattern**: `PairFactory` acts as a registry for all token pairs, enabling the DEX to interact with pairs without needing to manage their creation directly.
- **SafeERC20 Pattern**: `SafeERC20` ensures secure token transfers and approvals, protecting against common issues like partial token transfers or failures.
- **ReentrancyGuard**: used to secure critical functions (like adding/removing liquidity and swaps) against reentrancy attacks.

## Smart contract breakdown

### Dex contract

- **createAndRegisterPair**: creates a new pair of ERC-20 tokens via the `PairFactory` and emits the `PairCreated` event.
- **addLiquidity**: adds liquidity to a token pair by delegating the process to the relevant `Pair` contract.
- **removeLiquidity**: removes liquidity from a pair.
- **swap**: executes token swaps between two tokens in a liquidity pool.

### PairFactory contract

- **createPair**: dynamically creates new token pairs and registers them in a registry.
- **getAllPairs**: returns all registered token pairs.

### Pair contract

- **addLiquidity**: adds liquidity for a token pair, updating pool reserves.
- **removeLiquidity**: removes liquidity from a token pair.
- **swap**: performs token swaps with a 0.3% fee, adjusting token reserves based on pool balances.
- **getSwapAmount**: calculates the output tokens based on the AMM's formula.

### MyERC20Token contract

- **ERC-20 Standard Functions**: implements standard ERC-20 functionality such as `transfer`, `approve`, and `transferFrom`.
- **mint**: mints new tokens to the contract owner, typically used for creating initial liquidity.
- **burn**: allows token holders to burn their tokens, reducing the total supply.

## Analysis of competition and technical improvements

DexChain offers a more modular and extensible design compared to popular DEXs like Uniswap. The use of patterns like Factory and Registry simplifies pair creation and management, providing a scalable and secure solution.

### Possible improvements

- **Gas Optimization**: further gas savings could be achieved through pre-calculated values or using Layer 2 solutions for transaction scalability.
- **Upgradeability**: implementing a proxy pattern could allow for seamless contract upgrades without redeployment.
- **Dynamic Fees**: introducing dynamic swap fees based on market conditions could make the DEX more competitive.

## Deployed contracts

- **Token A (TKA)**: [0xc8B8b66f03D093021Cd09Bf1AFEF5D3c924D264F](https://sepolia.etherscan.io/address/0xc8B8b66f03D093021Cd09Bf1AFEF5D3c924D264F#code)
  npx hardhat verify --network ethereum_sepolia_testnet 0xc8B8b66f03D093021Cd09Bf1AFEF5D3c924D264F "Token A" "TKA" "1000000000000000000000"

- **Token B (TKB)**: [0x21AFCF753f49EEd329ccE966BCf6C1B2DefDbe7A](https://sepolia.etherscan.io/address/0x21AFCF753f49EEd329ccE966BCf6C1B2DefDbe7A#code)
  npx hardhat verify --network ethereum_sepolia_testnet 0x21AFCF753f49EEd329ccE966BCf6C1B2DefDbe7A "Token B" "TKB" "1000000000000000000000"

- **PairFactory**: [0xD8F7674735f256222Bc2D7F253bB1C97F6a297CD](https://sepolia.etherscan.io/address/0xD8F7674735f256222Bc2D7F253bB1C97F6a297CD#code)
  npx hardhat verify --network ethereum_sepolia_testnet 0xD8F7674735f256222Bc2D7F253bB1C97F6a297CD

- **Pair**: [0x97dcC449f6EB51084C2cc62Ca497f16EB65aD002](https://sepolia.etherscan.io/address/0x97dcC449f6EB51084C2cc62Ca497f16EB65aD002#code)
  npx hardhat verify --network ethereum_sepolia_testnet 0x97dcC449f6EB51084C2cc62Ca497f16EB65aD002 0xc8B8b66f03D093021Cd09Bf1AFEF5D3c924D264F 0x21AFCF753f49EEd329ccE966BCf6C1B2DefDbe7A

- **Dex**: [0x8197f415Cc24D5C8C1C5B87c13927bF6e13965F5](https://sepolia.etherscan.io/address/0x8197f415Cc24D5C8C1C5B87c13927bF6e13965F5#code)
  npx hardhat verify --network ethereum_sepolia_testnet 0x8197f415Cc24D5C8C1C5B87c13927bF6e13965F5 0xD8F7674735f256222Bc2D7F253bB1C97F6a297CD

## Key transactions & ERC-20 Functionality demonstrated

### 1. Token pair creation

I first created a pair for **Token A (TKA)** and **Token B (TKB)** on the DEX, initializing the liquidity pool. The transaction for this creation can be viewed here:

- [createAndRegisterPair tx](https://sepolia.etherscan.io/tx/0x9438a65f42537510b2a5b4dd85f97700bbcd0dc21e0a54ee319f0e8a3483b649)

### 2. Adding liquidity

Liquidity was added to the newly created pair between **Token A (TKA)** and **Token B (TKB)** using the `addLiquidity` function. The transaction for this operation is shown below:

- [addLiquidity tx](https://sepolia.etherscan.io/tx/0x82c12bb9f65d00c71478797efa759e9ad4c924cc952d8847d8b5bee2f1df2fc6)

### 3. Token Swap

After successfully adding liquidity, a swap was performed between **Token A (TKA)** and **Token B (TKB)**. The details of this token exchange can be found here:

- [Token swap tx](https://sepolia.etherscan.io/tx/0x4316f8621ec3817ac125609a551d3b84c69b1f424aa06af65b047185ff81f5e1)

## ERC20 Functionality demonstrated

The following functions from the ERC20 standard have been demonstrated during these interactions:

- **approve**: grants permission for the contract to spend tokens on behalf of the user. [Approval tx](https://sepolia.etherscan.io/tx/0x9438a65f42537510b2a5b4dd85f97700bbcd0dc21e0a54ee319f0e8a3483b649)
- **transfer**: transfers tokens between addresses. This occurs as part of adding liquidity.
- **safeTransferFrom**: moves tokens from one address to another, commonly used in the context of liquidity provision and token swaps. [Liquidity Provision tx](https://sepolia.etherscan.io/tx/0x82c12bb9f65d00c71478797efa759e9ad4c924cc952d8847d8b5bee2f1df2fc6)

These interactions demonstrate the successful execution of key functions, including **approve**, **transfer**, and **safeTransferFrom**, and the overall mechanics of the DEX, including the liquidity pool and token swapping functionality.
