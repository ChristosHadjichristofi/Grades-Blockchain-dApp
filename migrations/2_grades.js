var grades = artifacts.require("Grades");
module.exports = function(deployer) {
  deployer.deploy(grades);
};