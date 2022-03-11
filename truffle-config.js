require('dotenv').config();

module.exports = {
  rpc: {
    host: process.env.IP,
    port: process.env.LOCAL_NODE_PORT
  },
  networks: {
    development: {
      host: process.env.IP,
      port: process.env.LOCAL_NODE_PORT,
      network_id: process.env.NETWORK_ID,
      /* here i could place a from variable that will be specified in the transaction obj */
      from: process.env.LOCAL_NODE_ADDR,
      gas: process.env.GAS
    },
  },
  compilers: {
    solc: {
      version: "0.8.12"
    }
  }
}
