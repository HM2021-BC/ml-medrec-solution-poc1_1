pragma solidity >=0.4.21 <0.7.0;

import "./Ownable.sol";

contract Patient is Ownable {
  // mapping patient address with hash 256 of patient information
  mapping(address => bytes32) public patients;

  function addPatient(address patient, bytes32 patientId) public onlyOwner {
    require(patient != address(0), 'Invalid patient address');
    patients[patient] = patientId;
  }

  function isExisted(address patient) public view returns (bool) {
    return patients[patient] != 0;
  }

  function getPatient(address patient) public view returns (bytes32) {
    return patients[patient];
  }

}
