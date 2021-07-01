pragma solidity >=0.4.21 <0.7.0;

import "./Ownable.sol";

contract MedRec is Ownable {
  // allow access of a provider for patient
  mapping(address => mapping(address => bool)) public providerAcl;
  mapping(address => bytes32[]) public patientDiagnoses;
  mapping(bytes32 => bytes32) public diagnoseTests;

  function addDiagnose(address patient, address provider, bytes32 diagnoseId) public onlyOwner {
    // set acl for provider
    providerAcl[patient][provider] = true;

    // add diagnose for patient
    bytes32[] storage list = patientDiagnoses[patient];
    list.push(diagnoseId);
  }

  function addDiagnoseTestResult(bytes32 diagnoseId, bytes32 resultId) public onlyOwner {
    diagnoseTests[diagnoseId] = resultId;
  }

  function getListDiagnose(address patient, address requester, bool isAuthViewer) public view returns (bytes32[] memory) {
    if(isAuthViewer || patient == requester || providerAcl[patient][requester]) {
      return patientDiagnoses[patient];
    } else {
      return new bytes32[](0);
    }
  }
}
