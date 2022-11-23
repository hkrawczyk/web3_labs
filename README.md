# Web3 Labs

Po uzupełnieniu `.env`, przetestuj:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat test
npx hardhat test test/eur/test.js
REPORT_GAS=true npx hardhat test
npx hardhat coverage
npx hardhat run scripts/deploy.js
```

# Etherscan verification

```shell
hardhat run --network testnet scripts/deploy.js
```

Skopiuj adres kontraktu i wklej go w miejsce `DEPLOYED_CONTRACT_ADDRESS`:

```shell
npx hardhat verify --network goerli DEPLOYED_CONTRACT_ADDRESS
npx hardhat verify --constructor-args arguments.js DEPLOYED_CONTRACT_ADDRESS --network goerli
```

