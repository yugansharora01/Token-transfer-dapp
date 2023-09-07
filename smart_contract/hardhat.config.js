require("@nomiclabs/hardhat-waffle");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.0",
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/0tkfBRJD_JQBiii1twFytyOIVJGyNSmk",
      accounts: [
        "fdb2d98075085b8a18679cbaf0f76019167ef407cfda3604ba5e9e092764086a",
      ],
    },
  },
};

//https://eth-sepolia.g.alchemy.com/v2/0tkfBRJD_JQBiii1twFytyOIVJGyNSmk
