import { providers } from 'ethers'
import { Signer } from 'arbundles/build/signing'
import { extractPublicKey } from '@metamask/eth-sig-util'
import { WalletProvider } from './index'
import BigNumber from 'bignumber.js';


export class InjectedWalletProvider implements WalletProvider {
    public currency: string;
    public unit: string;
    private _provider: providers.Web3Provider
    private active: boolean = false
    private injectedSigner: InjectedSigner

    constructor(currency: string, unit: string) {
        this.unit = unit;
        this.currency = currency
        this.active = false;
    }
    getSigner(): Signer {
        return this.injectedSigner;
    }

    async getFee(amount: BigNumber, to: string): Promise<BigNumber> {
        if (this.active) {
            const tx = {
                to,
                value: "0x" + amount.toString(16)
            };
            const estimatedGas = await this._provider.estimateGas(tx);
            const gasPrice = await this._provider.getGasPrice();
            return new BigNumber(estimatedGas.mul(gasPrice).toString());
        } else {
            throw new Error('active the provider first');
        }
    }

    async createAndSendTx(data: { amount: number, to: string, fee: number }): Promise<{ txId: string; tx: any; }> {
        if (this.activate) {
            const signer = this._provider.getSigner();
            const valueHex = '0x' + new BigNumber(data.amount).toString(16);
            const tx = await signer.sendTransaction({
                to: data.to,
                value: valueHex
            })
            return { txId: tx.hash, tx }
        } else {
            throw new Error('active the provider first');
        }
    }

    activate = async () => {
        const { ethereum } = window as any;
        if (ethereum) {
            const accounts = await ethereum.send('eth_requestAccounts');
            const provider = new providers.Web3Provider(ethereum)
            this._provider = provider;
            this.injectedSigner = new InjectedSigner(this);
            this.active = true;
            console.log(accounts.result[0])
            return accounts.result[0]
        }
    }

    getPublicKey = async () => {
        if (this.active) {
            const signer = this._provider.getSigner();
            const data = "Bundlr JS Client"
            const signature = await signer.signMessage(data)
            return extractPublicKey({ data, signature })
        } else {
            throw new Error("not connected")
        }
    }

    accessSigner() {
        return this._provider.getSigner();
    }

}

const fromHexString = hexString =>
    new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));


class InjectedSigner extends Signer {
    private injectedProvider: InjectedWalletProvider;

    constructor(injectedProvider: InjectedWalletProvider) {
        super();
        this.injectedProvider = injectedProvider
    }

    async sign(message: Uint8Array) {
        const signer = this.injectedProvider.accessSigner();
        const signatureHex = await signer.signMessage(message);
        let signatureRS = signatureHex.slice(2, 129)
        return fromHexString(signatureRS)
    }
}


