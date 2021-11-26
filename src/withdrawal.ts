import { deepHash } from "arbundles";
import { stringToBuffer } from "arweave/node/lib/utils";
import { AxiosResponse } from "axios";
import Utils from "./utils";
import Api from "arweave/node/lib/api";
import BigNumber from "bignumber.js";

interface data {
    publicKey: string | Buffer,
    currency: string,
    amount: string,
    nonce: number,
    signature: Buffer | Uint8Array
}

/**
 * Create and send a withdrawl request 
 * @param utils Instance of Utils 
 * @param api Instance of API
 * @param wallet Wallet to use
 * @param amount amount to withdraw in winston
 * @returns the response from the bundler
 */
export async function withdrawBalance(utils: Utils, api: Api, amount: BigNumber, walletProvider: any): Promise<AxiosResponse> {
    // //todo: make util functions directly return data rather than having to post-return mutate
    const data = { publicKey: await walletProvider.getPublicKey(), currency: walletProvider.currency, amount: amount.toString(), nonce: await utils.getNonce() } as data;
    const deephash = await deepHash([stringToBuffer(data.currency), stringToBuffer(data.amount.toString()), stringToBuffer(data.nonce.toString())]);
    data.signature = await walletProvider.sign(deephash)
    const ds = JSON.stringify(data);
    const du = JSON.parse(ds);

    if (du.publicKey.type === "Buffer") {
        du.publicKey = Buffer.from(du.publicKey);
    }
    if (du.signature.type === "Buffer") {
        du.signature = Buffer.from(du.signature);
    } else {
        du.signature = Uint8Array.from(Object.values(du.signature));
    }
    return api.post("/account/withdraw", data);
}
