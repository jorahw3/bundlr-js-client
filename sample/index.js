import { BundlrClient, InjectedWalletProvider} from '../build/src/index';

const wp = new InjectedWalletProvider("matic", "wei");

const nodeUrl = "https://node1.bundlr.network";

const currency = "matic"

const bc = new BundlrClient(nodeUrl, currency, wp)

bc.init()
.then(bc.getLoadedBalance)
.then(console.log)
.then(() => console.log(bc.address));
