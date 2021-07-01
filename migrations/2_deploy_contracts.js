const MedRecProxy = artifacts.require("MedRecProxy");

module.exports = function(deployer) {
  let contract;

  deployer.deploy(MedRecProxy)
  .then(instance => {
    contract = instance;
    return instance.owner();
  })
  .then(owner => {
    console.log("master provider", owner);
    return contract.registerProvider(owner);
  })
  .then(txHash => {
    console.log("txHash", txHash);
  })
};
