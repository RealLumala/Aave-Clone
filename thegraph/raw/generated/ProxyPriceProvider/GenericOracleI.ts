// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class AssetPriceUpdated extends ethereum.Event {
  get params(): AssetPriceUpdated__Params {
    return new AssetPriceUpdated__Params(this);
  }
}

export class AssetPriceUpdated__Params {
  _event: AssetPriceUpdated;

  constructor(event: AssetPriceUpdated) {
    this._event = event;
  }

  get _asset(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get _price(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get timestamp(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class EthPriceUpdated extends ethereum.Event {
  get params(): EthPriceUpdated__Params {
    return new EthPriceUpdated__Params(this);
  }
}

export class EthPriceUpdated__Params {
  _event: EthPriceUpdated;

  constructor(event: EthPriceUpdated) {
    this._event = event;
  }

  get _price(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get timestamp(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class ProphecySubmitted extends ethereum.Event {
  get params(): ProphecySubmitted__Params {
    return new ProphecySubmitted__Params(this);
  }
}

export class ProphecySubmitted__Params {
  _event: ProphecySubmitted;

  constructor(event: ProphecySubmitted) {
    this._event = event;
  }

  get _sybil(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get _asset(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get _sybilProphecy(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }

  get _oracleProphecy(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }
}

export class GenericOracleI extends ethereum.SmartContract {
  static bind(address: Address): GenericOracleI {
    return new GenericOracleI("GenericOracleI", address);
  }

  getAssetPrice(_asset: Address): BigInt {
    let result = super.call(
      "getAssetPrice",
      "getAssetPrice(address):(uint256)",
      [ethereum.Value.fromAddress(_asset)]
    );

    return result[0].toBigInt();
  }

  try_getAssetPrice(_asset: Address): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "getAssetPrice",
      "getAssetPrice(address):(uint256)",
      [ethereum.Value.fromAddress(_asset)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  getEthUsdPrice(): BigInt {
    let result = super.call("getEthUsdPrice", "getEthUsdPrice():(uint256)", []);

    return result[0].toBigInt();
  }

  try_getEthUsdPrice(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "getEthUsdPrice",
      "getEthUsdPrice():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }
}
