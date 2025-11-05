const {
  withAndroidManifest,
  createRunOncePlugin,
} = require("expo/config-plugins");

const queries = {
  package: [
    { $: { "android:name": "org.toshi" } },
    { $: { "android:name": "io.metamask" } },
    { $: { "android:name": "com.wallet.crypto.trustapp" } },
    { $: { "android:name": "io.gnosis.safe" } },
    { $: { "android:name": "me.rainbow" } },
    { $: { "android:name": "io.zerion.android" } },
    { $: { "android:name": "im.token.app" } },
    { $: { "android:name": "im.argent.contractwalletclient" } },
    { $: { "android:name": "com.spot.spot" } },
    { $: { "android:name": "fi.steakwallet.app" } },
    { $: { "android:name": "com.defi.wallet" } },
    { $: { "android:name": "vip.mytokenpocket" } },
    { $: { "android:name": "com.frontierwallet" } },
    { $: { "android:name": "piuk.blockchain.android" } },
    { $: { "android:name": "io.safepal.wallet" } },
    { $: { "android:name": "com.zengo.wallet" } },
    { $: { "android:name": "io.oneinch.android" } },
    { $: { "android:name": "exodusmovement.exodus" } },
    { $: { "android:name": "com.ledger.live" } },
    { $: { "android:name": "com.myetherwallet.mewwallet" } },
    { $: { "android:name": "io.stormbird.wallet" } },
    { $: { "android:name": "co.bacoor.keyring" } },
    { $: { "android:name": "com.lobstr.client" } },
    { $: { "android:name": "com.mathwallet.android" } },
    { $: { "android:name": "com.unstoppabledomains.manager" } },
    { $: { "android:name": "com.hashhalli.obvious" } },
    { $: { "android:name": "com.fireblocks.client" } },
    { $: { "android:name": "com.ambire.wallet" } },
    { $: { "android:name": "com.mtpelerin.bridge" } },
    { $: { "android:name": "com.internetmoneywallet.app" } },
    { $: { "android:name": "com.bitcoin.mwallet" } },
    { $: { "android:name": "coin98.crypto.finance.media" } },
    { $: { "android:name": "io.myabcwallet.mpc" } },
    { $: { "android:name": "finance.ottr.android" } },
    { $: { "android:name": "co.arculus.wallet.android" } },
    { $: { "android:name": "com.huddln" } },
    { $: { "android:name": "com.permutize.haha" } },
    { $: { "android:name": "com.modular" } },
    { $: { "android:name": "com.carrieverse.cling.wallet" } },
    { $: { "android:name": "com.broearn.browser" } },
    { $: { "android:name": "com.ripio.android" } },
    { $: { "android:name": "kh.com.sabay.sabaywallet" } },
    { $: { "android:name": "com.tokoin.wallet" } },
  ],
};

/**
 * @param {import('@expo/config-plugins').ExportedConfig} config
 */
const withAndroidManifestService = (config) => {
  return withAndroidManifest(config, (config) => {
    config.modResults.manifest = {
      ...config.modResults.manifest,
      queries,
    };

    return config;
  });
};

module.exports = createRunOncePlugin(
  withAndroidManifestService,
  "withAndroidManifestService",
  "1.0.0",
);
