// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './PairFactory.sol';
import 'hardhat/console.sol';

contract Dex {
  PairFactory public pairFactory;

  event PairCreated(address indexed tokenA, address indexed tokenB, address pair);
  event LiquidityAdded(address indexed pair, uint256 amountA, uint256 amountB);
  event LiquidityRemoved(address indexed pair, uint256 amountA, uint256 amountB);
  event SwapExecuted(address indexed pair, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);

  constructor(address _pairFactory) {
    pairFactory = PairFactory(_pairFactory);
  }

  // Create a new token pair and register it
  function createAndRegisterPair(address tokenA, address tokenB) external {
    address pair = pairFactory.createPair(tokenA, tokenB);
    require(pair != address(0), 'Pair creation failed');
    emit PairCreated(tokenA, tokenB, pair);
  }

  // Get all registered pairs from the PairFactory
  function getRegisteredPairs() external view returns (address[] memory) {
    return pairFactory.getAllPairs();
  }

  // Delegate liquidity and swap functions to the Pair contracts
  function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) external {
    address pair = pairFactory.pairs(tokenA, tokenB);
    require(pair != address(0), 'Pair does not exist');

    // Explicitly pass the user's account to the Pair contract
    Pair(pair).addLiquidity(msg.sender, amountA, amountB);
    emit LiquidityAdded(pair, amountA, amountB);
  }

  function removeLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) external {
    address pair = pairFactory.pairs(tokenA, tokenB);
    require(pair != address(0), 'Pair does not exist');

    // Call the Pair contract to remove liquidity
    Pair(pair).removeLiquidity(msg.sender, amountA, amountB);
    emit LiquidityRemoved(pair, amountA, amountB);
  }

  function swap(address tokenA, address tokenB, uint256 amountIn) external {
    address pair = pairFactory.pairs(tokenA, tokenB);
    require(pair != address(0), 'Pair does not exist');

    // Convert the address to MyERC20Token before passing it to the Pair swap function
    MyERC20Token tokenIn = MyERC20Token(tokenA);
    Pair(pair).swap(msg.sender, tokenIn, amountIn);

    // Get the output amount to emit in the event
    uint256 amountOut = Pair(pair).getSwapAmount(tokenIn, amountIn);
    emit SwapExecuted(pair, tokenA, tokenB, amountIn, amountOut);
  }
}
