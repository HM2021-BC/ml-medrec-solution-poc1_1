pragma solidity >=0.4.21 <0.7.0;

import "./Ownable.sol";

contract AuthInstitute is Ownable {

  mapping(address => bytes32) internal viewers;

  function addProvider(address authViewer, bytes32 authViewerId) public onlyOwner {
    require(authViewer != address(0), 'Invalid provider address');
    viewers[authViewer] = authViewerId;
  }

  function isExisted(address authViewer) public view returns (bool) {
    return viewers[authViewer] != 0;
  }

  function getProvider(address authViewer) public view returns(bytes32) {
    return viewers[authViewer];
  }
}
