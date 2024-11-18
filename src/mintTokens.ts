import { getOrCreateAssociatedTokenAccount,mintTo, burn, createBurnInstruction, getAssociatedTokenAddress, createBurnCheckedInstruction} from "@solana/spl-token";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import bs58 from "bs58";
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
require('dotenv').config()
import { Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
const token_decimals = BigInt(1); //0.50 for less confusion

const connection = new Connection(process.env.URL, "confirmed");

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const PRIVATE_KEY_C1 = process.env.PRIVATE_KEY_C1;

const TOKEN_MINT_ADDRESS = process.env.TOKEN_MINT_ADDRESS
const PRICE_TOKEN = 96 * 10e9;
const wallet = bs58.decode(PRIVATE_KEY as string);
const c_wallet = bs58.decode(PRIVATE_KEY_C1 as string);

const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));
const c_keypair = Keypair.fromSecretKey(new Uint8Array(c_wallet))

const token_mint = new PublicKey(TOKEN_MINT_ADDRESS);

export const mintTokens = async (fromAddress: string, toAddress: string, amount: number) => {
    const from_address = new PublicKey(fromAddress)
    try{
        const associated_token_address = await getOrCreateAssociatedTokenAccount
        (
             connection,
             keypair,
             token_mint,
             from_address
        )
        console.log(`Minted tokens at address: ${associated_token_address.address.toBase58()}`);
        console.log(`Minted tokens at address owner: ${associated_token_address.owner.toBase58()}`);
       console.log(keypair.publicKey);
        const minted  = await mintTo(
            connection,
            keypair,
            token_mint,
            associated_token_address.address,
            keypair.publicKey,
            amount/2 //0.5 cutoff
        )

        console.log(`Successfully transaction ${minted}`)
        console.log(`Minted tokens at address: ${associated_token_address.address.toBase58()}`);
    }
    catch(e){
        console.log("Minting error", e);
    }
}

export const burnTokens = async (fromAddress: string,toaddress: String,  amount: number) => {
    const burnaddress = new PublicKey(fromAddress);

    try {
        const ata = await getAssociatedTokenAddress(
            token_mint,
            burnaddress, 
            false,       
            TOKEN_PROGRAM_ID
        );

        const accountInfo = await connection.getParsedAccountInfo(ata);
        if (!accountInfo || !accountInfo.value) {
            throw new Error("Token account does not exist");
        }

        const mintInfo = await connection.getParsedAccountInfo(token_mint);
        if (!mintInfo || !mintInfo.value) {
            throw new Error("Mint does not exist");
        }
        console.log(`Burning ${amount / 10 ** 9} tokens from ${ata.toBase58()}`);

        // Create burn transaction
        const transaction = new Transaction().add(
            createBurnCheckedInstruction(
                ata,           // Token account to burn from
                token_mint,    // Token mint address
                c_keypair.publicKey, // Owner of the token account
                amount/2,        // Amount to burn
                9      
            )
        );

        const txSignature = await sendAndConfirmTransaction(connection, transaction, [c_keypair]);
        console.log(`Burn transaction successful. Signature: ${txSignature}`);
    } catch (e) {
        console.error("Burn error:", e);
    }
};


export const sendNativeTokens = async (fromAddress: string, toAddress: string, amount: number) => {
    const fromPublic = new PublicKey(fromAddress);
    const toPublic = new PublicKey(toAddress);
    
    try{
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: keypair.publicKey,
                toPubkey: c_keypair.publicKey,
                lamports: amount*2
            })
        )

        //send transaction
        const Signature = await sendAndConfirmTransaction(connection, transaction, [keypair]);
        console.log(`Sent ${amount*2} SOLS to ${toPublic}: ${Signature}`);
    }
    catch(e){
        console.log("Error: " , e);
    }
}