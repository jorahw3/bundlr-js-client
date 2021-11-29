# Bundlr-js-client

This is a new Bundlr js client for Bundlr network. The current library [js-client](https://github.com/Bundlr-Network/js-client) should need raw private keys which may not possible if user are using wallets like ledger or Metamask.

This library provides a `WalletProvider` interface which is to provider signing function to the Bundlr client, which will ask the user's permission when signing the request.

Currently the `InjectedWalletProvider`(like Metemask) has been implemented. But it is easy to implement other WalletProvider like WalletConnect or even Solana Wallet.

## install
```
    yarn install
```

## Create a new Bundlr instance

```
import { BundlrClient, InjectedWalletProvider } from '../build/src/index';

const network = "matic";
const unit = "wei";
const nodeUrl = "https://node1.bundlr.network";

const wp = new InjectedWalletProvider(network, unit);
const bc = new BundlrClient(nodeUrl, network, wp)

```

## Get the wallet's address

```
bundlr.address
```

## Get the account's balance with the current bundler

```
await bundlr.getLoadedBalance() // 109864
```

## Fund a bundler

```
await bundlr.fund(amount);

```


## Demo
please ensure you have Metamask installed and added the Matic network, run the following command to see the demo

```
yarn demo
```

please check the sample folder for detail and code.

![screenshot](./demo.png)