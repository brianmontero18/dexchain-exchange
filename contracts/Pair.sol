// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import './MyERC20Token.sol';
import 'hardhat/console.sol';

contract Pair is ReentrancyGuard {
  using SafeERC20 for MyERC20Token;

  MyERC20Token public immutable tokenA;
  MyERC20Token public immutable tokenB;
  uint256 public totalLiquidityA;
  uint256 public totalLiquidityB;

  mapping(address => mapping(MyERC20Token => uint256)) public liquidity;

  uint256 constant FEE_NUMERATOR = 997;
  uint256 constant FEE_DENOMINATOR = 1000;

  event LiquidityAdded(address indexed provider, uint256 amountA, uint256 amountB);
  event LiquidityRemoved(address indexed provider, uint256 amountA, uint256 amountB);
  event TokenSwapped(
    address indexed user,
    MyERC20Token tokenIn,
    MyERC20Token tokenOut,
    uint256 amountIn,
    uint256 amountOut
  );

  constructor(address _tokenA, address _tokenB) {
    tokenA = MyERC20Token(_tokenA);
    tokenB = MyERC20Token(_tokenB);
  }

  // Function to add liquidity
  function addLiquidity(address user, uint256 amountA, uint256 amountB) external nonReentrant {
    tokenA.safeTransferFrom(user, address(this), amountA);
    tokenB.safeTransferFrom(user, address(this), amountB);

    liquidity[user][tokenA] += amountA;
    liquidity[user][tokenB] += amountB;

    totalLiquidityA += amountA;
    totalLiquidityB += amountB;

    emit LiquidityAdded(user, amountA, amountB);
  }

  // Function to remove liquidity
  function removeLiquidity(address user, uint256 amountA, uint256 amountB) external nonReentrant {
    require(liquidity[user][tokenA] >= amountA, 'Insufficient token A liquidity');
    require(liquidity[user][tokenB] >= amountB, 'Insufficient token B liquidity');

    liquidity[user][tokenA] -= amountA;
    liquidity[user][tokenB] -= amountB;

    totalLiquidityA -= amountA;
    totalLiquidityB -= amountB;

    tokenA.safeTransfer(user, amountA);
    tokenB.safeTransfer(user, amountB);

    emit LiquidityRemoved(user, amountA, amountB);
  }

  // Function to perform token swaps
  function swap(address user, MyERC20Token tokenIn, uint256 amountIn) external nonReentrant {
    MyERC20Token tokenOut = (tokenIn == tokenA) ? tokenB : tokenA;
    uint256 amountOut = getSwapAmount(tokenIn, amountIn);

    // Perform the transfer from the user to the contract
    tokenIn.safeTransferFrom(user, address(this), amountIn);
    // Transfer the output tokens to the user
    tokenOut.safeTransfer(user, amountOut);

    emit TokenSwapped(user, tokenIn, tokenOut, amountIn, amountOut);
  }

  // Function to calculate the output amount with a 0.3% fee
  function getSwapAmount(MyERC20Token tokenIn, uint256 amountIn) public view returns (uint256) {
    uint256 reserveIn = tokenIn.balanceOf(address(this));
    uint256 reserveOut = (tokenIn == tokenA) ? tokenB.balanceOf(address(this)) : tokenA.balanceOf(address(this));

    uint256 amountInWithFee = (amountIn * FEE_NUMERATOR) / FEE_DENOMINATOR;
    return (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);
  }
}
