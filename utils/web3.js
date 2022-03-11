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

    async initContractHW() {
        const hwArtifact = fs.readFileSync(__dirname + '/../build/contracts/HelloWorld.json', { encoding: "utf-8" });
        this.contracts.helloworld = TruffleContract(JSON.parse(hwArtifact));

        this.contracts.helloworld.setProvider(this.web3Provider);
    }

}

let web3Object;

async function start() {
    if (web3Object == null) {
        web3Object = new w3();
        await web3Object.initWeb3();
        await web3Object.initContractHW();
    }
}

start();

module.exports = { web3Object };