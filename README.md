# 💸 Easy2Pay 💸

💸 dApp for requesting payments specifying a reason, and sharing the request with a link or a QR code.

Future versions will feature payment using different tokens (stablecoin, WBTC) using [Chainlink Price Feeds](https://docs.chain.link/data-feeds/price-feeds).

## How can I contribute to this build?

- 👷‍♀️ To view current development tasks, [check the Issues on the Github repo](https://github.com/luloxi/Easy2Pay/issues).
- 🧰 To chat with other buidlers about this project, [join Newbies Lounge Telegram group](https://t.me/+FwCZPG51UhwzOTZh)
- 🛠️ To submit a PR (Pull Request), [fork and pull](https://github.com/susam/gitpr) a request to this repo.
- 🐣 Make sure you know the ETH Tech Stack and understand [how to make a dApp using Scaffold-ETH 2](https://lulox.notion.site/Newbie-s-Lounge-68ea7c4c5f1a4ec29786be6a76516878).

## Quickstart

To get started with Easy2Pay, follow the steps below:

1. Make sure you have the [foundry toolkit installed](https://book.getfoundry.sh/getting-started/installation).

2. Clone this repo & install dependencies

```
git clone https://github.com/luloxi/Easy2Pay.git
cd Easy2Pay
yarn install
```

3. Run a local network in the first terminal:

```
yarn chain
```

This command starts a local Ethereum network using Hardhat. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `hardhat.config.ts`.

4. On a second terminal, deploy the test contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network. The contract is located in `packages/hardhat/contracts` and can be modified to suit your needs. The `yarn deploy` command uses the deploy script located in `packages/hardhat/deploy` to deploy the contract to the network. You can also customize the deploy script.

5. On a third terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the contract component or the example ui in the frontend. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

Run smart contract test with `yarn hardhat:test`

- Edit your smart contract `Easy2Pay.sol` in `packages/hardhat/contracts`
- Edit your frontend in `packages/nextjs/pages`
- Edit your deployment scripts in `packages/hardhat/deploy`

🏗 Project created using [Scaffold-ETH 2](https://scaffoldeth.io/)

[Read more about Scaffold-ETH 2](SE2-DOCUMENTATION.md)
