import { Bytes, Address, log } from '@graphprotocol/graph-ts';

import {
  AssetSourceUpdated,
  FallbackOracleUpdated,
  ChainlinkProxyPriceProvider,
} from '../generated/ProxyPriceProvider/ChainlinkProxyPriceProvider';
import { IExtendedPriceAggregator } from '../generated/ProxyPriceProvider/IExtendedPriceAggregator';
import { GenericOracleI as FallbackPriceOracle } from '../generated/ProxyPriceProvider/GenericOracleI';

import {
  ChainlinkAggregator as ChainlinkAggregatorContract,
  FallbackPriceOracle as FallbackPriceOracleContract,
  UniswapExchange as UniswapExchangeContract,
} from '../generated/templates';

import { getChainlinkAggregator, getOrInitPriceOracle, getPriceOracleAsset } from '../initializers';
import {
  formatUsdEthChainlinkPrice,
  getPriceOracleAssetType,
  PRICE_ORACLE_ASSET_PLATFORM_UNISWAP,
  PRICE_ORACLE_ASSET_TYPE_SIMPLE,
  zeroAddress,
  zeroBI,
} from '../../utils/converters';
import { MOCK_ETHEREUM_ADDRESS, MOCK_USD_ADDRESS } from '../../utils/constants';
import { genericPriceUpdate, usdEthPriceUpdate } from '../price-updates';

export function handleFallbackOracleUpdated(event: FallbackOracleUpdated): void {
  let priceOracle = getOrInitPriceOracle();
  if (priceOracle.fallbackPriceOracle) {
    // TODO: add logic to remove old one, was not possible with TheGraph
    // FallbackPriceOracle.delete(priceOracle.fallbackPriceOracle)
  }

  priceOracle.fallbackPriceOracle = event.params.fallbackOracle;
  FallbackPriceOracleContract.create(event.params.fallbackOracle);

  // update prices on assets which use fallback
  priceOracle.tokensWithFallback.forEach(token => {
    let priceOracleAsset = getPriceOracleAsset(token);
    if (priceOracleAsset.priceSource.equals(zeroAddress()) || priceOracleAsset.isFallbackRequired) {
      let proxyPriceProvider = ChainlinkProxyPriceProvider.bind(event.address);
      genericPriceUpdate(
        priceOracleAsset,
        proxyPriceProvider.getAssetPrice(Bytes.fromHexString(priceOracleAsset.id) as Address),
        event
      );
    }
  });

  // update USDETH price
  let fallbackOracle = FallbackPriceOracle.bind(event.params.fallbackOracle);
  let ethUsdPrice = zeroBI();
  // try method for dev networks
  let ethUsdPriceCall = fallbackOracle.try_getEthUsdPrice();
  if (ethUsdPriceCall.reverted) {
    // try method for ropsten and mainnet
    ethUsdPrice = formatUsdEthChainlinkPrice(
      fallbackOracle.getAssetPrice(Address.fromString(MOCK_USD_ADDRESS))
    );
  } else {
    ethUsdPrice = ethUsdPriceCall.value;
  }
  if (
    priceOracle.usdPriceEthFallbackRequired ||
    priceOracle.usdPriceEthMainSource.equals(zeroAddress())
  ) {
    usdEthPriceUpdate(priceOracle, ethUsdPrice, event);
  }
}

export function handleAssetSourceUpdated(event: AssetSourceUpdated): void {
  let assetAddress = event.params.asset;
  let sAssetAddress = assetAddress.toHexString();
  let priceOracle = getOrInitPriceOracle();

  let proxyPriceProvider = ChainlinkProxyPriceProvider.bind(event.address);
  let priceFromProxy = proxyPriceProvider.getAssetPrice(assetAddress);

  let assetOracleAddress = event.params.source;
  let priceOracleAsset = getPriceOracleAsset(sAssetAddress);
  priceOracleAsset.isFallbackRequired = true;

  // if it's valid oracle address
  if (!assetOracleAddress.equals(zeroAddress())) {
    let priceAggregatorInstance = IExtendedPriceAggregator.bind(assetOracleAddress);

    // check is it composite or simple asset
    let tokenTypeCall = priceAggregatorInstance.try_getTokenType();
    if (!tokenTypeCall.reverted) {
      priceOracleAsset.type = getPriceOracleAssetType(tokenTypeCall.value);
    }

    if (priceOracleAsset.type == PRICE_ORACLE_ASSET_TYPE_SIMPLE) {
      // create ChainLink aggregator template entity
      ChainlinkAggregatorContract.create(assetOracleAddress);

      // fallback is not required if oracle works fine
      priceOracleAsset.isFallbackRequired = !priceAggregatorInstance.latestAnswer().gt(zeroBI());
    } else {
      // composite assets don't need fallback, it will work out of the box
      priceOracleAsset.isFallbackRequired = false;

      // call contract and check on which assets we're dependent
      let dependencies = priceAggregatorInstance.getSubTokens();
      // add asset to all dependencies
      for (let i = 0; i < dependencies.length; i += 1) {
        let dependencyAddress = dependencies[i].toHexString();
        if (dependencyAddress !== MOCK_ETHEREUM_ADDRESS) {
          let dependencyOracleAsset = getPriceOracleAsset(dependencyAddress);
          let dependentAssets = dependencyOracleAsset.dependentAssets;
          if (!dependentAssets.includes(sAssetAddress)) {
            dependentAssets.push(sAssetAddress);
            dependencyOracleAsset.dependentAssets = dependentAssets;
            dependencyOracleAsset.save();
          }
        }
      }
      // if it's first oracle connected to this asset
      if (priceOracleAsset.priceSource.equals(zeroAddress())) {
        // start listening on the platform updates
        if (priceOracleAsset.platform === PRICE_ORACLE_ASSET_PLATFORM_UNISWAP) {
          UniswapExchangeContract.create(assetAddress);
        }
      }
    }

    // add entity to be able to match asset and oracle after
    let chainlinkAggregator = getChainlinkAggregator(assetOracleAddress.toHexString());
    chainlinkAggregator.oracleAsset = sAssetAddress;
    chainlinkAggregator.save();
  }
  // set price aggregator address
  priceOracleAsset.priceSource = assetOracleAddress;

  if (sAssetAddress == MOCK_USD_ADDRESS) {
    priceOracle.usdPriceEthFallbackRequired = priceOracleAsset.isFallbackRequired;
    priceOracle.usdPriceEthMainSource = assetOracleAddress;
    usdEthPriceUpdate(priceOracle, formatUsdEthChainlinkPrice(priceFromProxy), event);
  } else {
    // TODO: remove old one ChainLink aggregator template entity if it exists, and it's not fallback oracle
    // if chainlink was invalid before and valid now, remove from tokensWithFallback array
    if (
      !assetOracleAddress.equals(zeroAddress()) &&
      priceOracle.tokensWithFallback.includes(sAssetAddress) &&
      !priceOracleAsset.isFallbackRequired
    ) {
      priceOracle.tokensWithFallback = priceOracle.tokensWithFallback.filter(
        token => token != event.params.asset.toHexString()
      );
    }

    if (
      !priceOracle.tokensWithFallback.includes(sAssetAddress) &&
      (assetOracleAddress.equals(zeroAddress()) || priceOracleAsset.isFallbackRequired)
    ) {
      let updatedTokensWithFallback = priceOracle.tokensWithFallback;
      updatedTokensWithFallback.push(sAssetAddress);
      priceOracle.tokensWithFallback = updatedTokensWithFallback;
    }
    priceOracle.save();

    genericPriceUpdate(priceOracleAsset, priceFromProxy, event);
  }
}
