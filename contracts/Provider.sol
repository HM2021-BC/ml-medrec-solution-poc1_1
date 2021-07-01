pragma solidity >=0.4.21 <0.7.0;

import "./Ownable.sol";

contract Provider is Ownable {

  mapping(address => bytes32) internal providers;

  function addProvider(address provider, bytes32 providerId) public onlyOwner {
    require(provider != address(0), 'Invalid provider address');
    providers[provider] = providerId;
  }

  function disableProvider(address provider) public onlyOwner {
    
  }

  function getProvider(address provider) public view returns(bytes32) {
    return providers[provider];
  }
}
