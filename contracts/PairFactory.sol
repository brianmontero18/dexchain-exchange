// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './Pair.sol';
import './MyERC20Token.sol';

contract PairFactory {
  mapping(address => mapping(address => address)) public pairs;
  address[] public allPairs;

  event PairCreated(address indexed tokenA, address indexed tokenB, address pair);

  function createPair(address tokenA, address tokenB) external returns (address pair) {
    require(tokenA != tokenB, 'Factory: IDENTICAL_ADDRESSES');
    require(pairs[tokenA][tokenB] == address(0), 'Factory: PAIR_EXISTS');

    pair = address(new Pair(tokenA, tokenB));
    pairs[tokenA][tokenB] = pair;
    pairs[tokenB][tokenA] = pair; // Also store the reverse pair.
    allPairs.push(pair);

    emit PairCreated(tokenA, tokenB, pair);
  }

  function getAllPairs() external view returns (address[] memory) {
    return allPairs;
  }
}
