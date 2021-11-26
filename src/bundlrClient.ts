import Api, { ApiConfig } from "arweave/node/lib/api";
import { JWKInterface } from "arweave/node/lib/wallet";
import Utils from "./utils";
import { withdrawBalance } from "./withdrawal";
import Uploader from "./upload";
import Fund from "./fund";
import { AxiosResponse } from "axios";
import { WalletProvider} from './walletProvider'
// import Arweave from "arweave";

// export let arweave;
export const keys: { [key: string]: { key: string, address: string } } = {};

export interface Config {
    wallet: JWKInterface,
    address?: string,
    APIConfig: ApiConfig,
    gatewayConfig: ApiConfig,
}


// export enum Currencies {
//     ARWEAVE = "arweave",
//     SOLANA = "solana",
//     AVALANCHE = "avalanche",
//     MATIC = "matic"
// }

// export interface ApiConfig {
//     host?: string;
//     protocol?: string;
//     port?: string | number;
//     timeout?: number;
//     logging?: boolean;
//     logger?: Function;
//   }

const SUPPORTED_CURRENCE = ["matic", "arweave"]

export class BundlrClient {
    public api: Api;
    public utils: Utils;
    private uploader: Uploader;
    private walletProvider: WalletProvider;
    private funder: Fund;
    public address;
    public publicKey: string;
    public currency;
    

    /**
     * Constructs a new Bundlr instance, as well as supporting subclasses
     * @param url - URL to the bundler
     * @param wallet - JWK in JSON
     */
    constructor(url: string, currency: string, walletProvider: WalletProvider) {
        // hacky for the moment...
        // specifically about ordering - some stuff here seems silly but leave it for now it works
        this.currency = currency;
        this.walletProvider = walletProvider;

        const parsed = new URL(url);
        this.api = new Api({ ...parsed, host: parsed.hostname }); //borrow their nice Axios API :p
        
        if (!SUPPORTED_CURRENCE.includes(this.walletProvider.currency)) {
            throw new Error(`Unknown/Unsuported currency ${currency}`);
        }
    }

    async init() {
        this.address = await this.walletProvider.activate();
        this.utils = new Utils(this.api, this.currency, { address: this.address });
        this.uploader = new Uploader(this.api, this.walletProvider)
        this.funder = new Fund(this.utils, this.withdrawBalance);
    }


    async withdrawBalance(amount) {
        return withdrawBalance(this.utils, this.api, amount, this.walletProvider);
    }

    /**
     * Gets the balance for the loaded wallet
     * @returns balance (in winston)
     */
    getLoadedBalance = async () => {
        return this.utils.getBalance(this.address)
    }
    /**
     * Gets the balance for the specified address
     * @param address address to query for
     * @returns the balance (in winston)
     */
    async getBalance(address: string): Promise<number> {
        return this.utils.getBalance(address)
    }
    /**
     * Sends amount winston to the specified bundler
     * @param amount amount to send in winston
     * @returns Arweave transaction
     */
    async fund(amount: number, multiplier?: number): Promise<any> {
        return this.funder.fund(amount, multiplier)
    }
    /**
     * Upload a file at the specified path to the bundler
     * @param path path to the file to upload
     * @returns bundler response
     */
    async uploadFile(path: string): Promise<AxiosResponse<any>> {
        return this.uploader.uploadFile(path);
    };
}
