"use client";

import { createAppKit, useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";
import type { AppKitNetwork } from "@reown/appkit/networks";
import type UniversalProvider from "@walletconnect/universal-provider";
import {
    HederaAdapter,
    HederaProvider,
    HederaChainDefinition,
    hederaNamespace,
} from "@hashgraph/hedera-wallet-connect";

const isMainnet =
    (process.env.NEXT_PUBLIC_NETWORK ?? process.env.NEXT_PUBLIC_HEDERA_NETWORK) === "mainnet";

export const HEDERA_NETWORK: "mainnet" | "testnet" = isMainnet ? "mainnet" : "testnet";

const PROJECT_ID = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ?? "";

if (!PROJECT_ID && typeof window !== "undefined") {
    console.warn("[AppKit] NEXT_PUBLIC_REOWN_PROJECT_ID is not set.");
}

const APP_METADATA = {
    name: "NBX",
    description: "Nairobi Stock Exchange - SME Capital Markets",
    url: typeof window !== "undefined" ? window.location.origin : "https://nbx.co.ke",
    icons: [],
};

const hederaEVMAdapter = new HederaAdapter({
    projectId: PROJECT_ID,
    networks: [HederaChainDefinition.EVM.Mainnet, HederaChainDefinition.EVM.Testnet],
    namespace: "eip155",
});

const hederaNativeAdapter = new HederaAdapter({
    projectId: PROJECT_ID,
    networks: [
        HederaChainDefinition.Native.Mainnet,
        HederaChainDefinition.Native.Testnet,
    ],
    namespace: hederaNamespace,
});

type AppKitModalOptions = {
    view?: string;
    namespace?: string;
};

type AppKitController = {
    open?: (options?: AppKitModalOptions) => Promise<void> | void;
};

let appKitInitialized = false;
let appKitController: AppKitController | null = null;

export async function initAppKit(): Promise<void> {
    if (appKitInitialized) return;

    const universalProvider = (await HederaProvider.init({
        projectId: PROJECT_ID,
        metadata: APP_METADATA,
    })) as unknown as UniversalProvider;

    const networks: [AppKitNetwork, ...AppKitNetwork[]] = isMainnet
        ? [
              HederaChainDefinition.EVM.Mainnet,
              HederaChainDefinition.Native.Mainnet,
              HederaChainDefinition.EVM.Testnet,
              HederaChainDefinition.Native.Testnet,
          ]
        : [
              HederaChainDefinition.EVM.Testnet,
              HederaChainDefinition.Native.Testnet,
              HederaChainDefinition.EVM.Mainnet,
              HederaChainDefinition.Native.Mainnet,
          ];

    appKitController = createAppKit({
        adapters: [hederaNativeAdapter, hederaEVMAdapter],
        // @ts-expect-error WalletConnect provider types diverge between nested dependencies.
        universalProvider,
        projectId: PROJECT_ID,
        metadata: APP_METADATA,
        networks,
        features: {
            analytics: true,
            email: true,
            socials: ["google", "apple", "github", "discord", "x", "facebook"],
            emailShowWallets: true,
        },
        themeMode: "dark",
    }) as unknown as AppKitController;

    appKitInitialized = true;
    console.log("[AppKit] Initialized for Hedera", HEDERA_NETWORK);
}

export async function openAppKitModal(options?: AppKitModalOptions): Promise<void> {
    await initAppKit();

    if (typeof appKitController?.open === "function") {
        await appKitController.open(options);
        return;
    }

    const maybeGlobal = (globalThis as { __appKit?: AppKitController }).__appKit;
    if (typeof maybeGlobal?.open === "function") {
        await maybeGlobal.open(options);
        return;
    }

    const appKitModule = (await import("@reown/appkit/react")) as AppKitController;
    if (typeof appKitModule.open === "function") {
        await appKitModule.open(options);
        return;
    }

    throw new Error("AppKit modal controller is not available.");
}

export { useAppKitProvider, useAppKitAccount };
