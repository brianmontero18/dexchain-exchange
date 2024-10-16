// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract MyERC20Token is ERC20, Ownable {
  constructor(
    string memory name_,
    string memory symbol_,
    uint256 initialSupply
  ) ERC20(name_, symbol_) Ownable(msg.sender) {
    _mint(msg.sender, initialSupply);
  }

  function burn(uint256 amount) public {
    require(balanceOf(msg.sender) >= amount, 'ERC20: burn amount exceeds balance');
    _burn(msg.sender, amount);
  }
}
