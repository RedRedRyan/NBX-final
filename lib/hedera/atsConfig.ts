import { Network,InitializationRequest } from '@hashgraph/asset-tokenization-sdk';

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    throw new Error(`Environment variable ${name} is required but was not provided`);
  }
  return val;
}

export const getATSNetwork = async () => {
  const initRequest = new InitializationRequest({
    network: (process.env.NEXT_PUBLIC_HEDERA_NETWORK as 'testnet' | 'mainnet') || 'testnet',
    mirrorNode: {
      name: "TestnetMirror",
      baseUrl: requireEnv('NEXT_PUBLIC_MIRROR_NODE'),
    },
    rpcNode: {
      name: "TestnetRPC",
      baseUrl: requireEnv('NEXT_PUBLIC_RPC_NODE'),
    },
    configuration: {
      factoryAddress: requireEnv('NEXT_PUBLIC_RPC_FACTORY'),
      resolverAddress: requireEnv('NEXT_PUBLIC_RPC_RESOLVER'),
    },
  });

  await Network.init(initRequest);
  return Network;
};

export const getATSConfig = async () => {
  await getATSNetwork();
  return {
    network: Network,
    factoryAddress: Network.getFactoryAddress(),
    resolverAddress: Network.getResolverAddress(),
  };
};

export default getATSConfig;
