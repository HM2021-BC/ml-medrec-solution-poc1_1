pragma solidity >=0.4.21 <0.7.0;

contract Verifier {
  function verify(address p, bytes32 hash, uint8 v, bytes32 r, bytes32 s) public view returns(bool) {
        return ecrecover(hash, v, r, s) == p;
    }
}