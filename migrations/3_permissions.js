var permissions = artifacts.require("Permissions");
module.exports = function(deployer) {
  deployer.deploy(permissions);
};