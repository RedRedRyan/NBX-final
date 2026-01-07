// Mock company data for NBX (Nairobi Block Exchange)

import { link } from "fs";
import { title } from "process";

export const companies = [
  {
    name: "Safaricom PLC",
    symbol: "SCOM",
    icon: "/icons/companies/safaricom.png",
    description: "Leading telecommunications company in East Africa providing mobile and internet services.",
    sector: "Telecommunications",
    website: "https://www.safaricom.co.ke",
    marketCap: "1.2T KES",
    price: 28.45,
    change24h: 2.5,
    volume24h: "120M KES",
    high24h: 29.10,
    low24h: 27.80,
    isHot: true,
    isGainer: true,
    isNew: false,
    bgColor: "#009688"
  },
  {
    name: "Equity Group Holdings",
    symbol: "EQTY",
    icon: "/icons/companies/equity.png",
    description: "Financial services holding company with operations across East Africa.",
    sector: "Banking",
    website: "https://equitygroupholdings.com",
    marketCap: "189B KES",
    price: 50.25,
    change24h: -1.2,
    volume24h: "85M KES",
    high24h: 51.00,
    low24h: 49.75,
    isHot: true,
    isGainer: false,
    isNew: false,
    bgColor: "#3f51b5"
  },
  {
    name: "Kenya Commercial Bank",
    symbol: "KCB",
    icon: "/icons/companies/kcb.png",
    description: "One of the largest commercial banks in East Africa.",
    sector: "Banking",
    website: "https://ke.kcbgroup.com",
    marketCap: "120B KES",
    price: 37.50,
    change24h: 0.8,
    volume24h: "62M KES",
    high24h: 38.25,
    low24h: 37.00,
    isHot: false,
    isGainer: true,
    isNew: false,
    bgColor: "#ff9800"
  },
  {
    name: "East African Breweries",
    symbol: "EABL",
    icon: "/icons/companies/eabl.png",
    description: "Leading alcoholic beverages company in East Africa.",
    sector: "Consumer Goods",
    website: "https://www.eabl.com",
    marketCap: "95B KES",
    price: 120.00,
    change24h: -2.3,
    volume24h: "45M KES",
    high24h: 123.50,
    low24h: 119.25,
    isHot: false,
    isGainer: false,
    isNew: false,
    bgColor: "#8bc34a"
  },
  {
    name: "Bamburi Cement",
    symbol: "BAMB",
    icon: "/icons/companies/bamburi.png",
    description: "Leading cement manufacturing company in East Africa.",
    sector: "Manufacturing",
    website: "https://www.bamburicement.com",
    marketCap: "42B KES",
    price: 45.75,
    change24h: 1.5,
    volume24h: "28M KES",
    high24h: 46.50,
    low24h: 45.00,
    isHot: false,
    isGainer: true,
    isNew: false,
    bgColor: "#ffc107"
  },
  {
    name: "Nairobi Tech Ventures",
    symbol: "NTV",
    icon: "/icons/companies/ntv.png",
    description: "Technology startup focused on fintech solutions for African markets.",
    sector: "Technology",
    website: "https://www.nairobitech.co.ke",
    marketCap: "15B KES",
    price: 75.20,
    change24h: 5.8,
    volume24h: "35M KES",
    high24h: 76.50,
    low24h: 71.00,
    isHot: true,
    isGainer: true,
    isNew: true,
    bgColor: "#9c27b0"
  },
  {
    name: "Kenya Power & Lighting",
    symbol: "KPLC",
    icon: "/icons/companies/kplc.png",
    description: "National electric utility company of Kenya.",
    sector: "Utilities",
    website: "https://www.kplc.co.ke",
    marketCap: "28B KES",
    price: 14.30,
    change24h: -0.5,
    volume24h: "18M KES",
    high24h: 14.50,
    low24h: 14.10,
    isHot: false,
    isGainer: false,
    isNew: false,
    bgColor: "#03a9f4"
  },
  {
    name: "Jubilee Holdings",
    symbol: "JUB",
    icon: "/icons/companies/jubilee.png",
    description: "Insurance company with operations across East Africa.",
    sector: "Insurance",
    website: "https://www.jubileeholdings.com",
    marketCap: "32B KES",
    price: 380.00,
    change24h: 1.2,
    volume24h: "22M KES",
    high24h: 385.00,
    low24h: 375.50,
    isHot: false,
    isGainer: true,
    isNew: false,
    bgColor: "#e91e63"
  },
  {
    name: "Kenya Airways",
    symbol: "KQ",
    icon: "/icons/companies/kq.png",
    description: "National airline of Kenya with routes across Africa, Europe, and Asia.",
    sector: "Transportation",
    website: "https://www.kenya-airways.com",
    marketCap: "18B KES",
    price: 3.25,
    change24h: -3.0,
    volume24h: "15M KES",
    high24h: 3.40,
    low24h: 3.20,
    isHot: false,
    isGainer: false,
    isNew: false,
    bgColor: "#607d8b"
  },
  {
    name: "Savannah Renewables",
    symbol: "SAVN",
    icon: "/icons/companies/savannah.png",
    description: "Renewable energy company focused on solar and wind power in East Africa.",
    sector: "Energy",
    website: "https://www.savannahrenewables.co.ke",
    marketCap: "8B KES",
    price: 42.80,
    change24h: 8.5,
    volume24h: "30M KES",
    high24h: 44.00,
    low24h: 39.50,
    isHot: true,
    isGainer: true,
    isNew: true,
    bgColor: "#4caf50"
  }
];
// Features data
export const features = [
  {
    title: "Spot Trading",
    description: "Buy and sell equities and bonds instantly at current market prices.",
    icon: "/icons/spot.png",
    link: "/markets/spot"
  },
  {
    title: "Futures Trading",
    description: "Trade futures contracts to hedge risks or speculate on price movements.",
    icon: "/icons/futures.png",
    link: "/markets/futures"
  },
  {
    title: "Earn",
    description: "Earn interest on your crypto assets with flexible and fixed options.",
    icon: "/icons/stake.png",
    link: "/earn"
  },
  {
    title: "Wallet",
    description: "Securely store, send, and receive your digital assets with our integrated wallet.",
    icon: "/icons/piggybank.png",
    link: "/wallet"
  }
];

// Partners data
export const partners = [

  {
    name: "Hashgraph",
    logo: "/icons/hash.webp",
    website: "https://www.hashgraph.com/"
  },
  {
    name: "Nairobi Securities Exchange",
    logo: "/icons/nselogo.png",
    website: "https://www.nse.co.ke"
  },
  {
    name: "Hedera Foundation",
    logo: "/icons/hederafoundation.svg",
    website: "https://hedera.foundation/"
  }
];

// Market filters
export const marketFilters = [
  { id: "all", label: "All" },
  { id: "hot", label: "Hot" },
  { id: "gainers", label: "Gainers" },
  { id: "losers", label: "Losers" },
  { id: "new", label: "New" },
  { id: "premarket", label: "Premarket" }
];

// Trade modes
export const tradeModes = [
  { id: "spot", label: "Spot" },
  { id: "futures", label: "Futures" }
];

// Earn options
export const earnOptions = [
  {
    id: "flexible",
    label: "Flexible Earning",
    description: "Earn interest on your assets with the flexibility to withdraw anytime",
    apy: "Up to 5% APY",
    img: "/icons/3dcoins.png"
  },
  {
    id: "fixed",
    label: "Fixed Earning",
    description: "Lock your assets for a fixed period to earn higher interest rates",
    apy: "Up to 12% APY",
    img: "/icons/3dsafe.png"
  },
  {
    id: "referrals",
    label: "Referrals",
    description: "Earn rewards by referring friends and family to NBX",
    reward: "Up to 40% commission",
    img: "/icons/3dcard.png"
  }
];

// Wallet quick actions
export const walletActions = [
  { id: "deposit", label: "Deposit", icon: "/icons/receive.png" },
  { id: "withdraw", label: "Withdraw", icon: "/icons/send.png" },
  { id: "transfer", label: "Transfer", icon: "/icons/transfer.png" },
  { id: "convert", label: "Convert", icon: "/icons/convert.png" },
  { id: "gift", label: "Gift", icon: "/icons/gift.png" }
];

// KESy Stablecoin Token (Orion Ramp)
export const KESY_TOKEN = {
  tokenId: "0.0.7228867",
  symbol: "KESy",
  name: "Kenyan Shilling Stablecoin",
  decimals: 6, // Default, will be fetched from mirror node
  icon: "/kes.jpg", // KES stablecoin icon
  network: "testnet",
};

// Available payment tokens for purchasing securities
// KESy is the platform default and only option
export const PAYMENT_TOKENS = [
  {
    tokenId: "0.0.7228867",
    symbol: "KESy",
    name: "KES Stablecoin",
    icon: "/kes.jpg",
    isDefault: true,
  },
];