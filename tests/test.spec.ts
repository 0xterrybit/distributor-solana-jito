import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { MerkleDistributor } from "../target/types/merkle_distributor";
import {
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";

import { TOKEN_PROGRAM_ID, Token, AccountInfo, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { BN } from "bn.js";
import { join } from "path";
import { readFileSync } from "fs";
import { deriveClaimStatus, getOrCreateATAInstruction } from "./utils/helper";

describe("distributor", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider();
  const program = anchor.workspace.MerkleDistributor as Program<MerkleDistributor>;

  const OWNER_PATH = join(process.env["HOME"]!, ".config/solana/rnspay_admin.json");
  const claimer_PATH = join(process.env["HOME"]!, ".config/solana/id.json");

  const owner = Keypair.fromSecretKey(Buffer.from(JSON.parse(readFileSync(OWNER_PATH, { encoding: "utf-8" }))));
  const claimer = Keypair.fromSecretKey(Buffer.from(JSON.parse(readFileSync(claimer_PATH, { encoding: "utf-8" }))));

  let tokenMint: Token;
  let ownerTokenAccount: AccountInfo
  let claimerTokenAccount: AccountInfo

  before(async () => {

    const specificBytes = new Uint8Array(32);
    specificBytes.set([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    // 使用特定的字节数组生成公钥
    const specificPublicKey = new PublicKey(specificBytes);
    // 打印公钥
    console.log('Generated Public Key:', specificPublicKey.toString());

    console.log('provider.connection.rpcEndpoint:', provider.connection.rpcEndpoint)
    if (provider.connection.rpcEndpoint == 'http://localhost:8899') {

      let ix = await provider.connection.requestAirdrop(owner.publicKey, 10 * LAMPORTS_PER_SOL);
      await provider.connection.confirmTransaction(ix, "confirmed");

      let ix2 = await provider.connection.requestAirdrop(claimer.publicKey, 10 * LAMPORTS_PER_SOL);
      await provider.connection.confirmTransaction(ix2, "confirmed");

      tokenMint = await Token.createMint(
        provider.connection,
        owner,
        owner.publicKey,
        null,
        8,
        TOKEN_PROGRAM_ID
      );

      ownerTokenAccount = await tokenMint.getOrCreateAssociatedAccountInfo(owner.publicKey);
      claimerTokenAccount = await tokenMint.getOrCreateAssociatedAccountInfo(claimer.publicKey);

      await tokenMint.mintTo(
        ownerTokenAccount.address,
        owner.publicKey,
        [owner],
        10_000_000_000_000
      );
    }
    else {

      // const TOKEN_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
      // tokenMint = Token.mint 

    }
  })

  it("distributor success", async () => {

    console.log('TOKEN_PROGRAM_ID:', TOKEN_PROGRAM_ID)
    console.log('SystemProgram.programId:', SystemProgram.programId)

    const version = new BN(1);
    const root = [] as any;
    const maxTotalClaim = '10000';
    const maxNumNodes = '10000';

    const startVestingTs = '100';
    const endVestingTs = '10000000000';
    const clawbackStartTs = '10000000001';
    const enableSlot = '1000000';
    const closable = true;

    // await program.methods
    //   .newDistributor(
    //     version,
    //     root,
    //     new BN(maxTotalClaim),
    //     new BN(maxNumNodes),
    //     new BN(startVestingTs),
    //     new BN(endVestingTs),
    //     new BN(clawbackStartTs),
    //     new BN(enableSlot),
    //     0,
    //     closable
    //   )
    //   .accounts({
    //     distributor: owner.publicKey,
    //     base: owner.publicKey,
    //     clawbackReceiver: owner.publicKey,
    //     mint: tokenMint.publicKey,
    //     tokenVault: token_vault,
    //     admin: owner.publicKey,
    //     associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    //     systemProgram: SystemProgram.programId,
    //     tokenProgram: TOKEN_PROGRAM_ID
    //   })
    //   .signers([
    //     owner,
    //   ])
    //   .rpc();
      
  });


  it("claim success", async () => {

    console.log('TOKEN_PROGRAM_ID:', TOKEN_PROGRAM_ID)
    console.log('SystemProgram.programId:', SystemProgram.programId)
    
    const claimant = new PublicKey('0x')
    const distributor = new PublicKey('0x')
    const tokenMint = new PublicKey('0x')

    const [claimStatus, _csBump] = deriveClaimStatus(claimant, distributor, program.programId);

    const preInstructions: TransactionInstruction[] = [];

    const [_distributor, _distributorATAIx] = await getOrCreateATAInstruction(tokenMint, distributor, provider.connection, true, claimant);
    const [_claimant, _claimantATAIx] = await getOrCreateATAInstruction(tokenMint, claimant, provider.connection, true, claimant);

    _distributorATAIx && preInstructions.push(_distributorATAIx);
    _claimantATAIx && preInstructions.push(_claimantATAIx);

    // await program.methods
    //   .newClaim(
    //     new BN(100), 
    //     new BN(0), 
    //     [] as any
    //   )
    //   .accounts({
    //     claimant,
    //     claimStatus,
    //     distributor: distributor,
    //     from: _distributor,
    //     to: _claimant,
    //     systemProgram: web3.SystemProgram.programId,
    //     tokenProgram: TOKEN_PROGRAM_ID,
    //   })
    //   .signers([
    //     owner,
    //   ])
    //   .rpc();

  });
});
