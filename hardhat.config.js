require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");


// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

//wpłaciłem 1200 usd
module.exports = {
  solidity: {
    version:"0.8.9",
    settings: {
      optimizer: {
        runs: 100,
        enabled: true,
      },
    },
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
      gas: 28000000,
      timeout: 100000000
    },
    goerli: {
      gasPrice: 70000000000,
      gas: 30000000,
      url: process.env.TESTNET_URL,
      accounts: [process.env.TESTNET_PK]
    },
    // mainnet: {
      // gasPrice: 35000000000,
      // gas: 2000000,
      // url: process.env.MAINNET_URL,
      // accounts: [process.env.PROD_PK]
    // },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    gasPriceApi: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
    coinmarketcap: process.env.COINMARKETCAP_KEY
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_KEY,
      goerli: process.env.ETHERSCAN_KEY,
    },
    customChains: [
      {
        network: "goerli",
        chainId: 5,
        urls: {
          apiURL: "https://api-goerli.etherscan.io/api",
          browserURL: "https://goerli.etherscan.io"
        }
      }
    ]
  },
};
