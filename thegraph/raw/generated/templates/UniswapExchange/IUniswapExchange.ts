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

export class AddLiquidity extends ethereum.Event {
  get params(): AddLiquidity__Params {
    return new AddLiquidity__Params(this);
  }
}

export class AddLiquidity__Params {
  _event: AddLiquidity;

  constructor(event: AddLiquidity) {
    this._event = event;
  }

  get provider(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get eth_amount(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get token_amount(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class EthPurchase extends ethereum.Event {
  get params(): EthPurchase__Params {
    return new EthPurchase__Params(this);
  }
}

export class EthPurchase__Params {
  _event: EthPurchase;

  constructor(event: EthPurchase) {
    this._event = event;
  }

  get buyer(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get tokens_sold(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get eth_bought(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class RemoveLiquidity extends ethereum.Event {
  get params(): RemoveLiquidity__Params {
    return new RemoveLiquidity__Params(this);
  }
}

export class RemoveLiquidity__Params {
  _event: RemoveLiquidity;

  constructor(event: RemoveLiquidity) {
    this._event = event;
  }

  get provider(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get eth_amount(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get token_amount(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class TokenPurchase extends ethereum.Event {
  get params(): TokenPurchase__Params {
    return new TokenPurchase__Params(this);
  }
}

export class TokenPurchase__Params {
  _event: TokenPurchase;

  constructor(event: TokenPurchase) {
    this._event = event;
  }

  get buyer(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get eth_sold(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get tokens_bought(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class IUniswapExchange extends ethereum.SmartContract {
  static bind(address: Address): IUniswapExchange {
    return new IUniswapExchange("IUniswapExchange", address);
  }
}
