require('dotenv').config();

const Web3 = require('web3');
const TruffleContract = require('truffle-contract');
const fs = require('fs');

class w3 {

    constructor() {
        this.web3 = null;
        this.web3Provider = null;
        this.contracts = {};
        this.account = null;
    }

    async initWeb3() {
        if (process.env.MODE == 'development' || typeof web3 === 'undefined'){
            this.web3Provider = new Web3.providers.HttpProvider(process.env.LOCAL_NODE);
        }
        else {
            this.web3Provider = web3.currentProvider;
        }
        this.web3 = new Web3(this.web3Provider);
    }

    async initContractGrades() {
        const gradesArtifact = fs.readFileSync(__dirname + '/../build/contracts/Grades.json', { encoding: "utf-8" });
        this.contracts.grades = TruffleContract(JSON.parse(gradesArtifact));

        this.contracts.grades.setProvider(this.web3Provider);
    }

    async initContractPermissions() {
        const permissionsArtifact = fs.readFileSync(__dirname + '/../build/contracts/Permissions.json', { encoding: "utf-8" });
        this.contracts.permissions = TruffleContract(JSON.parse(permissionsArtifact));

        this.contracts.permissions.setProvider(this.web3Provider);
    }
}

let web3Object;

async function start() {
    if (web3Object == null) {
        web3Object = new w3();
        await web3Object.initWeb3();
        await web3Object.initContractGrades();
        await web3Object.initContractPermissions();
    }
}

start();

module.exports = { web3Object };