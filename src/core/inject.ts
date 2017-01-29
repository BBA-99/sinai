import { Class, Dictionary, CHD } from './interface'
import { Module, ModuleImpl0, ModuleProxy, ModuleProxy0 } from './module'
import { CoreStore0 } from './store'
import { assert } from '../utils'

export interface GI<S, G extends BG0> {
  readonly state: S
  readonly getters: G
}

export interface AI<S, G extends BG0, M extends BM0, A extends BA0> {
  readonly state: S
  readonly getters: G
  readonly mutations: M
  readonly actions: A
}

export interface GI0 extends GI<{}, BG0> {}
export interface AI0 extends AI<{}, BG0, BM0, BA0> {}

export interface Injected<SG, SGMA> {
  Getters<S> (): Class<BG<S, SG>>
  Mutations<S> (): Class<BM<S>>
  Actions<S> (): Class<BA<S, BG0, BM0, SGMA>>
  Actions<S, G extends BG0> (): Class<BA<S, G, BM0, SGMA>>
  Actions<S, M extends BM0> (): Class<BA<S, BG0, M, SGMA>>
  Actions<S, G extends BG0, M extends BM0> (): Class<BA<S, G, M, SGMA>>

  and<K extends string, S, G extends BG0, M extends BM0, A extends BA0> (
    key: K,
    module: Module<S, G, M, A>
  ): Injected<SG & CHD<K, GI<S, G>>, SGMA & CHD<K, AI<S, G, M, A>>>
}

export function makeInjected (
  Getters: BaseClass<BG0>,
  Mutations: BaseClass<BM0>,
  Actions: BaseClass<BA0>
): Injected<{}, {}> {
  return {
    Getters: () => Getters,
    Mutations: () => Mutations,
    Actions: () => Actions,
    and (key: string, module: ModuleImpl0): Injected<{}, {}> {
      return makeInjected(
        injectModule(Getters, key, module) as BaseClass<BG0>,
        Mutations,
        injectModule(Actions, key, module) as BaseClass<BA0>
      )
    }
  }
}

function injectModule (
  Super: BaseClass<Base>,
  key: string,
  depModule: ModuleImpl0
): BaseClass<Base> {
  return class extends Super {
    constructor (module: ModuleImpl0, store: CoreStore0) {
      super(module, store)

      const proxy = store.getProxy(depModule)
      assert(proxy !== null, 'The dependent module is not found in the store')
      ;(this as this & { modules: ModuleProxy0 }).modules[key] = proxy
    }
  }
}

export interface BaseClass<T> {
  new (module: ModuleImpl0, store: CoreStore0): T
}

export class Base {
  protected __proxy__: ModuleProxy0

  constructor (
    module: ModuleImpl0,
    store: CoreStore0
  ) {
    const proxy = store.getProxy(module)
    assert(proxy !== null, 'The module proxy is not found in the store, unexpectedly')
    this.__proxy__ = proxy!
  }
}

export class BG<S, SG> extends Base {
  protected modules: SG = {} as SG

  protected get state (): S {
    return this.__proxy__.state as S
  }
}

export class BM<S> extends Base {
  protected get state (): S {
    return this.__proxy__.state as S
  }
}

export class BA<S, G extends BG0, M extends BM0, SGMA> extends Base {
  protected modules: SGMA = {} as SGMA

  protected get state (): S {
    return this.__proxy__.state as S
  }

  protected get getters (): G {
    return this.__proxy__.getters as G
  }

  protected get mutations (): M {
    return this.__proxy__.mutations as M
  }
}

export interface BG0 extends BG<{}, {}> {}
export interface BG1<S> extends BG<S, {}> {}
export interface BM0 extends BM<{}> {}
export interface BA0 extends BA<{}, BG0, BM0, {}> {}
export interface BA1<S, G extends BG0, M extends BM0> extends BA<S, G, M, {}> {}

export function Getters<S> (): Class<BG1<S>>
export function Getters (): Class<BG0> {
  return BG
}

export function Mutations<S> (): Class<BM<S>>
export function Mutations (): Class<BM0> {
  return BM
}

export function Actions<S> (): Class<BA1<S, BG0, BM0>>
export function Actions<S, G extends BG0> (): Class<BA1<S, G, BM<S>>>
export function Actions<S, M extends BM0> (): Class<BA1<S, BG1<S>, M>>
export function Actions<S, G extends BG0, M extends BM0> (): Class<BA1<S, G, M>>
export function Actions (): Class<BA0> {
  return BA
}

export function inject<K extends string, S, G extends BG0, M extends BM0, A extends BA0> (
  key: K,
  module: Module<S, G, M, A>
): Injected<CHD<K, GI<S, G>>, CHD<K, AI<S, G, M, A>>> {
  return makeInjected(BG, BM, BA).and(key, module)
}
