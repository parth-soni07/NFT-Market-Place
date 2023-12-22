require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

// const SEPOLIA_PRIVATE_KEY = "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const RPC_URL = process.env.SAPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
module.exports = {
  solidity: "0.8.4",
  paths: {
    artifacts: "./src/backend/artifacts",
    sources: "./src/backend/contracts",
    cache: "./src/backend/cache",
    tests: "./src/backend/test",
  },
  // networks: {
  //   sepolia: {
  //     url: RPC_URL,
  //     accounts: [PRIVATE_KEY],
  //     chainId: 11155111,
  //     blockConfirmations: 6,
  //   },
  // },
};
