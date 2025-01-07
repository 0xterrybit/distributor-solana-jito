import { BN, web3, Program } from '@coral-xyz/anchor';
import * as anchor from '@coral-xyz/anchor';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { TransactionInstruction } from '@solana/web3.js';

// import { PublicKey, TransactionInstruction } from '@solana/web3.js';
// import { createTransferInstruction } from '@solana/spl-token';

import { MerkleDistributor as MerkleDistributorType } from '../../target/types/merkle_distributor';

// import { MerkleDistributor } from "../target/types/merkle_distributor";
import {
  deriveClaimStatus,
  getOrCreateATAInstruction,
} from './helper';

import {
    // MERKLE_DISTRIBUTOR_PROGRAM_ID,
    createMerkleDistributorProgram
} from './program'

// export const MERKLE_DISTRIBUTOR_PROGRAM_ID = 

export interface UserResponse {
  merkle_tree: string;
  amount: number;
  proof: number[][];
}

export class MerkleDistributor {
  private mdProgram?: anchor.Program<MerkleDistributorType>;
  private mint: web3.PublicKey;
  private base: web3.PublicKey;
  private version: BN;
  private claimProofEndpoint: string = "";

  constructor(
    private provider: anchor.Provider,
    options: {
      programId: web3.PublicKey,
      base: web3.PublicKey;
      mint: web3.PublicKey;
      version?: number,
      claimProofEndpoint?: string;
    },
  ) {
    // const program = anchor.workspace.MerkleDistributor as Program<MerkleDistributorType>;

    this.mdProgram = createMerkleDistributorProgram(this.provider, options.programId);
    this.mint = options.mint;
    this.base = options.base;
    this.version = new BN(options.version) || new BN(0);
    this.claimProofEndpoint = options.claimProofEndpoint || "";
  }
  
  async claim(claimant: web3.PublicKey, user_proof: {
    amount,
    proof,
    merkle_tree: string
  } ) {
    const {
      provider: { connection },
      mdProgram,
      mint,
    } = this;

    
    if (!claimant || !mint || !mdProgram) {
      return;
    }
    
    const { proof, merkle_tree, amount} = user_proof;
    const distributor = new web3.PublicKey(merkle_tree);
    const [claimStatus, _csBump] = deriveClaimStatus(claimant, distributor, mdProgram.programId);

    const preInstructions: TransactionInstruction[] = [];

    const [toATA, toATAIx] = await getOrCreateATAInstruction(mint, claimant, connection, true, claimant);
    toATAIx && preInstructions.push(toATAIx);

    const [mdATA, mdATAIx] = await getOrCreateATAInstruction(mint, distributor, connection, true, claimant);
    mdATAIx && preInstructions.push(mdATAIx);

    return [
      ...preInstructions,
      await mdProgram.methods
        .newClaim(new BN(amount), new BN(0), proof)
        .accounts({
          claimant,
          claimStatus,
          distributor: distributor,
          from: mdATA,
          to: toATA,
          systemProgram: web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .instruction(),
    ];
  }

  async getClaimStatus(claimant: web3.PublicKey, merkle_tree: string): Promise<{ isClaimed: boolean } | null> {
    const { mdProgram } = this;

    if (!claimant || !mdProgram) {
      return null;
    }

    // const {merkle_tree} = user_proof

    if (!merkle_tree) {
      return null;
    }

    const [claimStatus, _csBump] = deriveClaimStatus(
      claimant,
      new web3.PublicKey(merkle_tree),
      mdProgram.programId,
    );

    const status = await mdProgram.account.claimStatus.fetchNullable(claimStatus);

    return {
      isClaimed: Boolean(status),
    };
  }

  async createDistributor(args: DistributorParams, {
    admin,
    distributor,
    tokenVault,
    clawbackReceiver
  }: {
    admin: web3.PublicKey;
    distributor: web3.PublicKey;
    tokenVault: web3.PublicKey;
    clawbackReceiver: web3.PublicKey;
  }) {

    const {
      provider: { connection },
      mdProgram,
      mint,
      base,
      version
    } = this;
 

    const preInstructions: TransactionInstruction[] = [];
    return [
      ...preInstructions,
      await mdProgram.methods
        .newDistributor(
          version,
          args.root,
          args.maxTotalClaim,
          new BN(0),
          new BN(0),
          new BN(0),
          new BN(0),
          new BN(0),
          1,
          true
        )
        .accounts({
          base: base,
          clawbackReceiver: clawbackReceiver,
          mint: mint,
          tokenVault: tokenVault,
          distributor: distributor,     // distributor status account
          admin: admin,                 // 
          systemProgram: anchor.web3.SystemProgram.programId,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .instruction(),
    ];

  }

  async fund(source: web3.PublicKey, distributor_address: web3.PublicKey, amount:number) {

    const {
      provider: { connection },
      mint,
    } = this;

    const [sourceTokenAccount, sourceATAIx] = await getOrCreateATAInstruction(mint, source, connection, true, source);
    console.log('sourceTokenAccount:', sourceTokenAccount.toBase58())
    const [tokenVaultAccount, tokenVaultATAIx] = await getOrCreateATAInstruction(mint, distributor_address, connection, true, source);
    
    const preInstructions: TransactionInstruction[] = [];

    if(tokenVaultATAIx) {
      preInstructions.push(tokenVaultATAIx)
    }

    let transferIx = Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,    
      sourceTokenAccount,
      tokenVaultAccount,
      source, 
      [],
      amount
    )

    return [
      ...preInstructions,
      transferIx
    ]

  }

  async clawback(
    merkle_tree,
    clawbackReceiver,
    // owner
  ) {

    const {
      provider: { connection },
      mdProgram,
      mint,
    } = this;
    
    const preInstructions: TransactionInstruction[] = [];

    const distributor_address = new web3.PublicKey(merkle_tree);

    const [tokenVault, _] = await getOrCreateATAInstruction(mint, distributor_address, connection);

    return [
      ...preInstructions,
      await mdProgram.methods
        .clawback()
        .accounts({
          distributor: distributor_address,
          from: tokenVault,
          to: clawbackReceiver,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .instruction(),
    ];

    // return [
    //   ...preInstructions,
    //   transferIx
    // ]

  }

}

export interface DistributorParams {
  root: number[];
  maxTotalClaim: BN;
  // maxNumNodes: BN;
  // startVestingTs: BN;
  // endVestingTs: BN;
  // clawbackStartTs: BN;
  // activationPoint: BN;
  // activationType: number;
  // closable: boolean;
}
