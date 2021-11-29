import {
    BundlrClient,
    InjectedWalletProvider
} from '../build/src/index';

// status section
const networkDiv = document.getElementById('network');
const unitDiv = document.getElementById('units');
const nodeDiv = document.getElementById('nodeUrl');

// buttons
const connectWalletButton = document.getElementById('connectWalletButton');
const getLoadedBalanceButton = document.getElementById('getLoadedBalance');
const getPriceButton = document.getElementById('getPrice');
const getBundlerAddressButton = document.getElementById('getBundlerAddress');
const fundButton = document.getElementById('fundButton');
const uploadButton = document.getElementById('uploadButton');


// texts
const addressResultDiv = document.getElementById('addressResult');
const pubkeyResultDiv = document.getElementById('publickeyResult');
const loaddedBalanceDiv = document.getElementById('loaddedBalance');
const priceDiv = document.getElementById('price');
const bundlrAddressDiv = document.getElementById('bundlrAddress')
const fundResultDiv = document.getElementById('fundResult')
const uploadResultDiv = document.getElementById('uploadResult');

// forms
const fundInputForm = document.getElementById('fundInput');
const uploadFrom = document.getElementById('uploadInput')

const network = "matic";
const unit = "wei";
const nodeUrl = "https://node1.bundlr.network";

const wp = new InjectedWalletProvider(network, unit);


networkDiv.innerHTML = network;
unitDiv.innerHTML = unit;
nodeDiv.innerHTML = nodeUrl;


function initPage() {
    connectWalletButton.disabled = false;
    getLoadedBalanceButton.disabled = true;
    getPriceButton.disabled = true;
    getBundlerAddressButton.disabled = true;
    fundButton.disabled = true;
    uploadButton.disabled = true;

    addressResultDiv.innerHTML = "";
    pubkeyResultDiv.innerHTML = "";
    loaddedBalanceDiv.innerHTML = "";
    priceDiv.innerHTML = "";
    bundlrAddressDiv.innerHTML = "";
    fundResultDiv.innerHTML = "";
    uploadResultDiv.innerHTML = "";

    fundInputForm.value = "";
    uploadFrom.value = "";


}

initPage()


function postConnectWallet(bc) {
    connectWalletButton.disabled = true;
    getLoadedBalanceButton.disabled = false;
    getPriceButton.disabled = false;
    getBundlerAddressButton.disabled = false;
    fundButton.disabled = false;
    uploadButton.disabled = false;
    addressResultDiv.innerHTML = bc.address;
    pubkeyResultDiv.innerHTML = bc.publicKey;
}
const bc = new BundlrClient(nodeUrl, network, wp)

connectWalletButton.onclick = async () => {
    await bc.init();
    postConnectWallet(bc);
    console.log('wallet connected')
}


getLoadedBalanceButton.onclick = async () => {
    try {
        const balance = await bc.getLoadedBalance();
        console.log('Loaded Balance is: ', balance)
        loaddedBalanceDiv.innerHTML = `${balance / 10 ** 18} Matic`
    } catch (e) {
        console.error(e)
    }

}

getPriceButton.onclick = async () => {
    try {
        const balance = await bc.utils.getStorageCost(network, 1)
        console.log('Price is: ', balance)
        priceDiv.innerHTML = `${balance.div(10 ** 18)} Matic `
    } catch (e) {
        console.error(e)
    }

}

getBundlerAddressButton.onclick = async () => {
    try {
        const address = await bc.getBundlerAddress();
        bundlrAddressDiv.innerHTML = address;
        console.log('The Bundlr Address', address)
    } catch (e) {
        console.error(e)
    }
}

fundButton.onclick = async () => {
    try {
        // In production should use big number for this value
        const amount = fundInputForm.value
        const result = await bc.fund(parseInt(amount))
        console.log(result)
        fundResultDiv.innerHTML = JSON.stringify(result)
    } catch (e) {
        console.error(e)
    }
}


uploadButton.onclick = async () => {
    try {
        const uploadString = uploadFrom.value;
        console.log(uploadString, Buffer.from(uploadString));
        const result = await bc.upload(Buffer.from(uploadString), [{
            name: 'Content-Type',
            value: 'text/plain'
        }])
        console.log(result)
        uploadResultDiv.innerHTML = JSON.stringify(result.data)
    } catch (e) {
        console.error(e)
    }
}
