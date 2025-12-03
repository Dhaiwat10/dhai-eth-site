---
id: ethereum-transaction-lifecycle
title: The Lifecycle of an Ethereum Transaction
date: 2025-12-03
excerpt: What actually happens when you submit a transaction to Ethereum?
tags:
  - Ethereum
  - Crypto
---

In this post I will aim to explore the lifecycle of an Ethereum transaction - from the moment you press 'submit' in your wallet to the moment when your transaction is finalised.

![The Lifecycle of an Ethereum Transaction](/images/lifecycle.png)

It is relatively trivial to grasp how payments work in a non-blockchain environment because usually, your payments are going through a centralised provider like Stripe that takes care of receiving payments from customers and sending them forward to businesses.

Blockchain payments are not so trivial. Unlike the non-blockchain scenario, in this case there is no single entity that facilitates transactions like Stripe. If you send out 10 different transactions on Ethereum spread out across a few hours, chances are that all of those transactions will be processed by completely different entities.

So how does it really work?

Let's imagine you are trying to swap out some USDC in exchange for ETH on Uniswap.

The first thing that must happen before the transaction even gets submitted to the network is the *transaction assembly*. When you click the 'Swap' button on the Uniswap UI, Uniswap looks at the details of the swap you want to do and assembles that data into a valid Ethereum transaction.

This transaction object then gets sent to your wallet app for you to look at and sign.

Most major wallet apps have the ability to disassemble this transaction object and show you the side-effects this transaction will cause for your account. In this case, your wallet should show you that you will lose some USDC and receive some ETH if the transaction is successful.

Assuming everything looks good to you at this point, you will press 'Submit' in your wallet app. This will trigger the wallet to sign the transaction object assembled by Uniswap using your wallet's private key.

Once the transaction has been successfully signed, your wallet must now send the transaction out to the Ethereum network so that other network participants can see your transaction, verify it, and include it on the blockchain.

Your wallet does this using an *RPC node*. Most wallet apps use a managed solution like Alchemy or Quicknode. The duty of the RPC node is to take your transaction and broadcast it out into the public mempool. 

The mempool is a shared public space[^1] where all the pending transactions live. You can think of it as a queue of transactions waiting to be processed.

This mempool is constantly being monitored by the validators of the Ethereum network. After each block, Ethereum randomly picks a new validator to propose the next new block.

At this point, if you have sent a reasonable amount of fees (base + tip) with your transaction (your wallet usually takes care of this) - a validator will soon pick up your transaction from the mempool. [^2]

The validator then executes your transaction and if all looks good - it includes your transaction in the new block that it proposes.

The newly-proposed block then must undergo the Ethereum consensus process. Without going into too much detail, there are two stages which are the most important: 'confirmation' and finalisation.

Confirmation usually happens after 1 slot i.e. ~12 seconds. Finalisation takes ~12.8 minutes. 

Most wallets and UIs will give their users a transaction confirmation after the 'confirmation' step. This is where the entire loop ends for the average user.

It is important to note here that the transaction is not final at this point. It is still potentially reversible, but it rarely happens. 

After finalisation though, a transaction is irrreversible and is etched onto the chain forever.

[^1]: Not all mempools are public. There are private ones as well, check out [Flashbots](https://protectrpc.flashbots.net/about). 
[^2]: An important caveat to note here is the fact that most Ethereum validators delegate their block-building duties out to professional block builders to maximise MEV revenue. See [mev-boost](https://boost.flashbots.net/)