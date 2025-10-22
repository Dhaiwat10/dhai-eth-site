---
id: force-inclusion
title: Force Inclusion: A simple tutorial
date: 2025-10-22
excerpt: An introductory tutorial on Force Inclusion for Ethereum Layer 2s.
tags:
  - Ethereum
  - L2
  - Tutorial
---

In these last few years, Layer 2s have become central to Ethereum's scaling efforts. These L2s are fast, cheap to use, and inherit Ethereum's strong security guarantees.

Ethereum serves as the settlement layer, and these L2s serve as the execution layer. This is great.

It is important to pause here, though, and ask: what do we really mean when we say that these L2s inherit Ethereum's security guarantees? What does it mean for an L2 to be secure?

We will not be going into all of the different security expectations in this article, but we will be discussing one of the most important ones: censorship resistance.

## Censorship Resistance

An ideal L2 should be censorship resistant. This means that no single entity or group (including the network operators, _especially_ the network operators) should be able to prevent users from accessing the network or using its services.

Most L2s use highly centralised sequencer sets for speed, though. This is the usual lifecycle of an L2 transaction, for example, you sending some ETH to a friend on Base:

![CleanShot 2025-10-20 at 08.40.55](https://hackmd.io/_uploads/Hkb8OXXRll.png)

It is not hard to spot that there is a potential single point of failure in this system. If the sequencer wants to, it can censor your transaction and refuse to include it in the next batch.

This is not good.

But the cool thing about [real L2s](https://chatgpt.com/share/68f5abf0-3e9c-8008-836c-878f22e2654f) is that this is not the end of the story. They are designed to protect users in exactly this scenario.

## Force Inclusion

When you suspect that the L2 sequencer is misbehaving, you can bypass it entirely and get your transaction included anyway, whether the sequencer likes it or not. The sequencer does not have a choice.

This is called Force Inclusion:

![CleanShot 2025-10-20 at 08.41.10](https://hackmd.io/_uploads/rJ6Lu7mCge.png)

## How is Force Inclusion possible?

In very simple terms, an Ethereum L2 is just a sophisticated set of smart contracts living on Ethereum L1. When you send a transaction on an L2, it is eventually posted to one of these smart contracts on Ethereum L1. The transaction is only considered truly 'final' once that happens. _(unless you are using an optimistic rollup in which case the finality can take up to 7 days)_

This is why it is said that L2s inherit Ethereum's security. The source of truth for L2s is Ethereum L1, not the L2 sequencers or L2 nodes.

The sequencer abstracts away the complexity of creating a valid L2 transaction and posting it properly to Ethereum. Any user can do this too, but it is obviously more complicated.

As an educational exercise, let's explore how you can actually send a transaction to an L2 without using the sequencer.

## Trying it Out

Most major L2s support force inclusion. For this example, we will aim to get a transaction force-included on Base mainnet. To keep things simple, we will attempt to send some ETH from one address to another, but the same methods work for transactions of any level of complexity.

I will be running a simple Bun script here. Let's initialize the project and install the one dependency we will need:

```shell
bun init

bun add ethers dotenv
```

We will also need a wallet's private key to send our transaction out. Please note that this wallet needs to be funded on both Ethereum L1 and Base L2. We need ETH on L1 to pay the gas for the L1 transaction, and on L2 to pay for the ETH transfer.

Please use a throwaway dev wallet for this exercise. Do not use a wallet you use for anything else.

Create an `.env` file and paste the private key there:

```
WALLET_PRIVATE_KEY=0x...
```

Let's open up `index.ts` and start setting up the script now.

```ts
import { ethers } from "ethers";
import "dotenv/config";

const l1Provider = new ethers.JsonRpcProvider("https://eth.llamarpc.com");
const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY!, l1Provider);

const portal = new ethers.Contract(
  "0x49048044D57e1C92A77f79988d21Fa8fAF74E97e", // OptimismPortal contract address on Ethereum (used by Base)
  [
    "function depositTransaction(address to,uint256 value,uint64 gasLimit,bool isCreation,bytes data) payable",
  ],
  wallet
);
```

Base is an OP Stack rollup. This means that it uses a similar smart contract structure to Optimism and other OP Stack rollups.

Remember how we discussed earlier that users have the ability to send transactions to one of the rollup contracts on Ethereum if they want to get a transaction force-included? This smart contract is called `OptimismPortal` for Base. To put things very simply, any valid L2 transactions deposited to this contract will be force-included on Base L2. This mechanism is slightly different for other rollup stacks like Arbitrum, but the core idea is the same.

You can check out the contract yourself here, if you are curious: https://etherscan.io/address/0x49048044D57e1C92A77f79988d21Fa8fAF74E97e

You might have also noticed the `depositTransaction` function signature that we added to our contract initialization code. This is the function we will be calling to 'deposit' our transaction to the rollup contract.

The next step is to construct the actual transaction that we wish to send.

```ts
const to = "0x0ED6Cec17F860fb54E21D154b49DAEFd9Ca04106";
const value = ethers.parseEther("0.001");
const gasLimit = 200000n; // conservative
const data = "0x";

const tx = await portal.depositTransaction(
  to,
  value,
  gasLimit,
  false,
  data,
  { value } // pay ETH
);

console.log("L1 tx hash:", tx.hash);
```

We need to specify several properties here.

1. `to`: This is the address of the L2 wallet that we want to send the ETH to. If you were calling a smart contract, this would be the address of the contract you want to call.
2. `value`: This is the amount of ETH we want to send to the L2 wallet.
3. `gasLimit`: This is the maximum amount of gas we are willing to pay for the transaction. Libraries like `viem` provide helpers that can calculate this for you. For now, we will use a conservative estimate.
4. `isCreation`: This is a boolean value that indicates whether the transaction is creating a new contract or not. If you are sending ETH to an existing contract, this should be set to `false`. We have set this to `false`.
5. `data`: The calldata for the transaction. Since we are doing a simple ETH transfer, we can leave this as `0x`. If you were interacting with a smart contract, this would be the encoded function call data.

That's all. Notice how we are not interacting with any Base RPC endpoints or contracts at all. Everything is being sent to Ethereum directly.

Re-check that the private key you provided in the `.env` is funded on both L1 and L2, and check the receiving address on L2 (the `to` field). This is the address that will receive the funds on Base.

Here’s the complete code for reference: https://github.com/Dhaiwat10/force-inclusion-script/blob/main/base.ts

Run the script, and check the transaction hash on Etherscan:

```shell
bun run index.ts
```

Once the transaction is confirmed on L1, you might need to wait around 2 epochs (~13 minutes) for the Ethereum chain to be finalised before the transaction is included in an L2 block.

After waiting around this much time, you should see a transaction popping up on Base L2 for the receiving address. You should receive the exact amount of ETH that you specified in the `value` field.

Congratulations! You just sent some ETH from one address to another on an Ethereum Layer 2 without ever interacting with the L2 sequencer.

## Conclusion

I hope this article served as a very basic primer on why force inclusion is important, and how you can use this security feature yourself if need be.

- I am currently working on an SDK around this with some friends to make similar rollup security features more accessible to developers: https://github.com/L2BombSquad/evm-force-inclusion
- I am also currently looking for my next role in crypto! My DMs are open, hmu: https://x.com/dhaiwat10
