import * as anchor from "@coral-xyz/anchor";
import { BN, Program, web3 } from "@coral-xyz/anchor";

import {
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
  PublicKey,
  TransactionInstruction,
  ComputeBudgetProgram,
} from "@solana/web3.js";
import { join } from "path";
import { readdirSync, readFileSync } from "fs";
import { MerkleDistributor as MerkleDistributorType, IDL as MerkleDistributorIDL } from "../target/types/merkle_distributor";
import { getMerkleDistributorPDA, getOrCreateATAInstruction } from "./utils/helper";
import { MerkleDistributor } from './utils/index'
import bs58 from 'bs58';

describe("distributor", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider();

  const programId = new PublicKey("E15eCY61CRBGV5cSEtKyxgmkDkCLnEgqdmyPSAhuFxc6")
  const program = new Program<MerkleDistributorType>(MerkleDistributorIDL, programId.toBase58() , provider);
  

  const OWNER_PATH = join(process.env["HOME"]!, ".config/solana/rnspay_admin.json");
  
  const owner = Keypair.fromSecretKey(Buffer.from(JSON.parse(readFileSync(OWNER_PATH, { encoding: "utf-8" }))));

  let base: web3.PublicKey = owner.publicKey

  console.log('base:', base)
 
  let mint: web3.PublicKey = new PublicKey('BdQwBa4xv7TWuKqfA9Y2ojDAkKfhhqjtwmKhNzkX86Nf');;
  let maxTotalClaim = 60328672500000;
  let version: number = 3;

  let distributorPubkey: web3.PublicKey;
  let merkleDistributorIns: MerkleDistributor;
  let merkle_tree: web3.PublicKey = new PublicKey("5samAbwfhQLRy8UvNRuh2AzsWnq9qmT7xk87sfJsoLvD")

  before(async () => {

    console.log('provider.connection.rpcEndpoint:', provider.connection.rpcEndpoint)
    if (provider.connection.rpcEndpoint == 'http://0.0.0.0:8899') {
      let ix = await provider.connection.requestAirdrop(owner.publicKey, 10 * LAMPORTS_PER_SOL);
      await provider.connection.confirmTransaction(ix, "confirmed");
    }
    
    distributorPubkey = getMerkleDistributorPDA(
      program.programId,
      base,
      mint,
      version
    )[0]

    merkle_tree = distributorPubkey

    console.log('distributorPubkey:', distributorPubkey.toBase58())

    merkleDistributorIns = new MerkleDistributor(provider, {
      programId,
      base,
      mint,
      version
    })
  })

  // it("new distributor success", async () => {
  //   const [tokenVault, tokenVaultATAIx] = await getOrCreateATAInstruction(mint, distributorPubkey, provider.connection, true, owner.publicKey);
  //   const [clawbackReceiver, _ownerATAIx] = await getOrCreateATAInstruction(mint, owner.publicKey, provider.connection, true, owner.publicKey);

  //   const priorityFee = 1000
  //   const setComputeUnitPriceIx = ComputeBudgetProgram.setComputeUnitPrice({
  //     microLamports: priorityFee
  //   });

  //   const ixs: TransactionInstruction[] = [];
  //   if (priorityFee) {
  //     ixs.push(setComputeUnitPriceIx);
  //   }

  //   if (tokenVaultATAIx) {
  //     ixs.push(tokenVaultATAIx);
  //   }

  //   if (_ownerATAIx) {
  //     ixs.push(_ownerATAIx);
  //   }
    
  //   const root = [
  //     117,
  //     132,
  //     246,
  //     86,
  //     208,
  //     228,
  //     65,
  //     47,
  //     217,
  //     97,
  //     234,
  //     56,
  //     205,
  //     137,
  //     183,
  //     161,
  //     199,
  //     56,
  //     190,
  //     88,
  //     204,
  //     189,
  //     22,
  //     76,
  //     0,
  //     8,
  //     98,
  //     77,
  //     74,
  //     50,
  //     82,
  //     233
  //   ]
    // const maxTotalClaim = new BN(60328672500000)
  //   const new_distributor_ix = await merkleDistributorIns.createDistributor(
  //     {
  //       root,
  //       maxTotalClaim,
  //     }, 
  //     {
  //       admin: owner.publicKey,
  //       distributor: distributorPubkey,
  //       tokenVault,
  //       clawbackReceiver
  //     }
  //   )

  //   ixs.push(...new_distributor_ix)

  //   const tx = new web3.Transaction().add(...ixs);

  //   const signature = await provider.sendAndConfirm(tx, [owner]);
  //   console.log('Transaction signature:', signature);

  // });

  it("fund success", async () => {

    let ixs = await merkleDistributorIns.fund(
      owner.publicKey,
      distributorPubkey,
      maxTotalClaim
    )

    const tx = new web3.Transaction().add(...ixs);
    const signature = await provider.sendAndConfirm(tx, [owner]);
    console.log('Fund transaction signature:', signature);

  });

  // it("check already fund", async () => {
  //   const distributorState = await program.account.merkleDistributor.fetch(distributorPubkey);
  //   const [tokenVault, tokenVaultATAIx] = await getOrCreateATAInstruction(mint, distributorPubkey, provider.connection, true, owner.publicKey);
  //   const tokenVaultState = await provider.connection.getTokenAccountBalance(tokenVault);

  //   console.log('tokenVault;', tokenVaultState.value.amount)
  //   console.log('maxTotalClaim;', distributorState.maxTotalClaim.toString())
  //   console.log('root;', distributorState.root.toString())
  //   console.log('mint;', distributorState.mint.toBase58())

  //   if (new BN(tokenVaultState.value.amount).gte(distributorState.maxTotalClaim)) {
  //     console.log(`already fund airdrop version ${distributorState.activationType}!`);
  //   }

  // });

  // it("claim success", async () => {

  //   let ixs = await merkleDistributorIns.claim(owner.publicKey, {
  //     amount: 1000,
  //     proof: [
  //       Array.from(bs58.decode("21P4dziReHMKWoKLVLMc6L7mjr97M2b6UFawppRE3ZYw"))
  //     ],
  //     merkle_tree: merkle_tree.toBase58()
  //   })

  //   const tx = new web3.Transaction().add(...ixs);
  //   const signature = await provider.sendAndConfirm(tx, [owner]);
  //   console.log('Fund transaction signature:', signature);


  //   let isClaimed = await merkleDistributorIns.getClaimStatus(owner.publicKey, merkle_tree.toBase58())

  //   console.log('isClaimed:', isClaimed)



  // });

  // it("clawback success", async () => {

  //   const [clawback_receiver, _] = await getOrCreateATAInstruction(mint, owner.publicKey, provider.connection, true, owner.publicKey);

  //   let ixs = await merkleDistributorIns.clawback(merkle_tree, clawback_receiver)

  //   const tx = new web3.Transaction().add(...ixs);
  //   const signature = await provider.sendAndConfirm(tx, [owner]);
  //   console.log('Fund transaction signature:', signature);

  // });

});
