import Api from "arweave/node/lib/api";
import { AxiosResponse } from "axios";

export default class Utils {
    public api: Api;
    private config: { address: string };
    public currency: string;
    constructor(api: Api, currency: string, config: { address: string }) {
        this.api = api;
        this.config = config;
        this.currency = currency;
    };

    /**
     * Throws an error if the provided axios reponse has a status code != 200
     * @param res an axios response
     * @returns nothing if the status code is 200
     */
    private static checkAndThrow(res: AxiosResponse) {
        if (res.status != 200) {
            throw new Error(`Error: ${res.status} ${JSON.stringify(res.data)}`);
        }
        return;
    }

    /**
     * Gets the nonce used for withdrawl request validation from the bundler
     * @returns nonce for the current user
     */
    public async getNonce(): Promise<number> {
        const res = await this.api.get(`/account/withdrawals/${this.currency}?address=${this.config.address}`);
        Utils.checkAndThrow(res);
        return (res).data;
    }

    /**
     * Gets the balance on the current bundler for the specified user
     * @param address the user's address to query
     * @returns the balance in winston
     */
    public async getBalance(address: string): Promise<number> {
        const res = await this.api.get(`/account/balance/${this.currency}?address=${address}`);
        Utils.checkAndThrow(res);
        return res.data.balance;
    }

    /**
     * Queries the bundler to get it's address for a specific currency
     * @returns the bundler's address
     */
    public async getBundlerAddress(currency: string): Promise<string> {
        const res = await this.api.get("/info");
        const address = res.data.addresses[currency]
        if (!address) {
            throw new Error(`Specified bundler does not support currency ${currency}`);
        }
        return address;
    }
}
