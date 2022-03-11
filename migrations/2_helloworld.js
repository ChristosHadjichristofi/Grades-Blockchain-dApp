var hw = artifacts.require("HelloWorld");
module.exports = function(deployer) {
  deployer.deploy(hw);
};