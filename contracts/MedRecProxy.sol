pragma solidity >=0.4.21 <0.7.0;

import "./Permission.sol";
import "./Provider.sol";
import "./Patient.sol";
import "./AuthInstitute.sol";
import "./MedRec.sol";
import "./Verifier.sol";

contract MedRecProxy is Permission {
  Provider internal providerContract;
  Patient internal patientContract;
  AuthInstitute internal authInstituteContract;
  MedRec internal medrecContract;
  Verifier internal verifyContract;

  // init tree contracts
  constructor() public {
    providerContract = new Provider();
    patientContract = new Patient();
    medrecContract = new MedRec();
    authInstituteContract = new AuthInstitute();
    verifyContract = new Verifier();
  }

  // admin functions
  function updateProviderContract(address _providerContract) public onlyAdmin {
    require(_providerContract != address(0), 'Provider contract is invalid');
    providerContract = Provider(_providerContract);
  }

  function updatePatientContract(address _patientContract) public onlyAdmin {
    require(_patientContract != address(0), 'Patient contract is invalid');
    patientContract = Patient(_patientContract);
  }

  function updateAuthInstituteContract(address _authInstituteContract) public onlyAdmin {
    require(_authInstituteContract != address(0), 'Institute contract is invalid');
    authInstituteContract = AuthInstitute(_authInstituteContract);
  }

  function updateVerifier(address _verifyContract) public onlyAdmin {
    require(_verifyContract != address(0), 'Institute contract is invalid');
    verifyContract = Verifier(_verifyContract);
  }

  function addNewProvider(address providerAddress, bytes32 providerId) public onlyAdmin {
    require(providerAddress != address(0), 'Provider address is invalid');
    registerProvider(providerAddress);
    providerContract.addProvider(providerAddress, providerId);
  }
  
  /**
    Suppend provider, provider is no longer able to submit new patient and diagnose test
   */
  function suppendProvider(address provider) public onlyAdmin returns (bool) {
    removeProvider(provider);
    return true;
  }

  // provider functions
  function addNewDiagnose(address patient, bytes32 diagnoseId) public onlyProvider {
    require(patientContract.isExisted(patient),'Patient not found');

    medrecContract.addDiagnose(patient, msg.sender, diagnoseId);
  }

  function addDiagnoseTestResult(bytes32 diagnoseId, bytes32 diagnoseTestId) public onlyProvider {
    medrecContract.addDiagnoseTestResult(diagnoseId, diagnoseTestId);
  }

  function addNewPatient(address patient, bytes32 patientId) public onlyProvider {
    require(!patientContract.isExisted(patient), "Patient is already registered");
    patientContract.addPatient(patient, patientId);
  }

  function verify(address p, bytes32 hash, uint8 v, bytes32 r, bytes32 s) public view returns(bool) {
    return verifyContract.verify(p, hash, v, r, s);
  }

  function getDiagnose4Patient(address patient) public view returns (bytes32[] memory) {
    return medrecContract.getListDiagnose(patient, msg.sender, authInstitutes[msg.sender]);
  }

  function getDiagnoseTest(bytes32 diagnoseId) public view returns (bytes32) {
    return medrecContract.diagnoseTests(diagnoseId);
  }

  function getProvider(address provider) public view returns(bytes32) {
    return providerContract.getProvider(provider);
  }

  function getPatient(address patient) public view returns (bytes32) {
    if(msg.sender == patient || providers[msg.sender] || authInstitutes[msg.sender]) {
      return patientContract.getPatient(patient);
    } else {
      return bytes32(0);
    }
  }

}
