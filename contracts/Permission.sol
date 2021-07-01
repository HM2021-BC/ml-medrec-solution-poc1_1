pragma solidity >=0.4.21 <0.7.0;

import "./Ownable.sol";

contract Permission is Ownable {
    mapping(address=>bool) public admins;
    mapping(address=>bool) public providers;
    // mapping(address=>bool) public patients;
    mapping(address=>bool) public authInstitutes;

    constructor() public {
        admins[msg.sender] = true;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender], 'Sender is not admin');
        _;
    }

    modifier onlyProvider() {
        require(providers[msg.sender], 'Sender is not provider');
        _;
    }

    modifier onlyAuthInstitute() {
        require(authInstitutes[msg.sender], 'Authenticated is not found');
        _;
    }

    event AdminAdded(address admin);
    event ProviderAdded(address provider);
    event PatientAdded(address patient);
    event AuthInstituteAdded(address patient);

    function registerAdmin (address admin) public onlyOwner onlyAdmin {
        admins[admin] = true;
        emit AdminAdded(admin);
    }

    function registerProvider (address provider) public onlyAdmin {
        providers[provider] = true;
        emit ProviderAdded(provider);
    }

    function registerAuthViewer (address instute) public onlyAdmin {
        authInstitutes[instute] = true;
        emit AuthInstituteAdded(instute);
    }

    event AdminRemoved(address admin);
    event ProviderRemoved(address provider);
    // event PatientRemoved(address patient);
    event AuthInstituteRemoved(address patient);

    function removeAdmin (address admin) public onlyAdmin {
        admins[admin] = false;
        emit AdminRemoved(admin);
    }

    function removeProvider (address provider) public onlyAdmin {
        providers[provider] = false;
        emit ProviderRemoved(provider);
    }

    function removeAuthInstitute (address instute) internal onlyAdmin {
        authInstitutes[instute] = false;
        emit AuthInstituteRemoved(instute);
    }
}
