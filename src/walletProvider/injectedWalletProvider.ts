import { providers } from 'ethers'
import { Signer } from 'arbundles/build/signing'
import { SignatureConfig, SIG_CONFIG } from 'arbundles/build/constants'
import { extractPublicKey } from '@metamask/eth-sig-util'
import { WalletProvider } from './index'
import BigNumber from 'bignumber.js';
import keccak256 from 'keccak256'


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
            const publickey = await this.getPublicKey()
            this.injectedSigner = new InjectedSigner(this, Buffer.from(publickey, 'hex'));
            this.active = true;
            return [accounts.result[0], publickey]
        } else {
            throw new Error('install metamask first');
        }
    }

    getPublicKey = async () => {
            const signer = this._provider.getSigner();
            const data = "Bundlr JS Client Would like to access this account"
            const signature = await signer.signMessage(data)
            const publicKeyHex= extractPublicKey({ data, signature })
            return `04${publicKeyHex.slice(2,)}`
    }

    accessSigner() {
        return this._provider.getSigner();
    }

}

const fromHexString = hexString =>
    new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

const toHexString = bytes =>
    bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');


class InjectedSigner implements Signer {
    readonly ownerLength: number = SIG_CONFIG[SignatureConfig.ETHERIUM].pubLength;
    readonly signatureLength: number =
        SIG_CONFIG[SignatureConfig.ETHERIUM].sigLength;
    readonly signatureType: SignatureConfig = SignatureConfig.ETHERIUM;
    private injectedProvider: InjectedWalletProvider;
    public readonly publicKey: Buffer;

    constructor(injectedProvider: InjectedWalletProvider, publicKey: Buffer) {
        this.injectedProvider = injectedProvider
        this.publicKey = publicKey;
    }
    

    sign = async (message: Uint8Array) => {
        const signer = this.injectedProvider.accessSigner();
        console.log('sign message:', toHexString(message));
        const messageBytes = Buffer.concat([
            Buffer.from("\x19Ethereum Signed Message:\n"),
            new Uint8Array(1).fill(message.byteLength),
            message
        ])

        const signatureHex = await signer._legacySignMessage(keccak256(messageBytes));
        console.log('signature:', signatureHex);
        let sig = signatureHex.substr(2)
        let r = sig.substr(0,64)
        let s = sig.substr(64,64)
        return fromHexString(r+s)
    }
}


