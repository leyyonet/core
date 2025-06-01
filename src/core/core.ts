import {CoreLike, CoreSecure} from "./index.types";
import {DecoratorPoolLike} from "../decorator";
import {FootprintLike} from "../footprint";
import {FqnHandlerLike} from "../fqn";
import {ReflectionPoolLike} from "../reflection";
import {NamedPoolLike} from "../named";
import {EnumPoolLike} from "../enum";
import {ProxyHandlerLike} from "../proxy";
import {BindHandlerLike} from "../bind";
import {LifecycleLike} from "../lifecycle";
import {$$coreInternalOn} from "../internal";
import {FQN_PCK} from "./internal";

class Core implements CoreLike, CoreSecure {
    constructor() {
    }

    // region decorator
    private _decoratorPool: DecoratorPoolLike;

    get decoratorPool(): DecoratorPoolLike {
        return this._decoratorPool;
    }

    $setDecoratorPool(ins: DecoratorPoolLike): CoreSecure {
        this._decoratorPool = ins;
        return this;
    }

    // endregion decorator

    // region footprint
    private _footprint: FootprintLike;
    get footprint(): FootprintLike {
        return this._footprint;
    }

    $setFootprint(ins: FootprintLike): CoreSecure {
        this._footprint = ins;
        return this;
    }

    // endregion footprint

    // region fqn
    private _fqnPool: FqnHandlerLike;

    get fqnHandler(): FqnHandlerLike {
        return this._fqnPool;
    }

    $setFqnHandler(ins: FqnHandlerLike): CoreSecure {
        this._fqnPool = ins;
        return this;
    }

    // endregion fqn

    // region reflection-pool
    private _reflectionPool: ReflectionPoolLike;

    get reflectionPool(): ReflectionPoolLike {
        return this._reflectionPool;
    }

    $setReflectionPool(ins: ReflectionPoolLike): CoreSecure {
        this._reflectionPool = ins;
        return this;
    }

    // endregion reflection-pool

    // region named-pool
    private _namedPool: NamedPoolLike;

    get namedPool(): NamedPoolLike {
        return this._namedPool;
    }

    $setNamedPool(ins: NamedPoolLike): CoreSecure {
        this._namedPool = ins;
        return this;
    }

    // region named-pool

    // region enum-pool
    private _enumPool: EnumPoolLike;

    $setEnumPool(ins: EnumPoolLike): CoreSecure {
        this._enumPool = ins;
        return this;
    }

    get enumPool(): EnumPoolLike {
        return this._enumPool;
    }

    // endregion enum-pool

    // region proxy-handler
    private _proxyHandler: ProxyHandlerLike;

    $setProxyHandler(ins: ProxyHandlerLike): CoreSecure {
        this._proxyHandler = ins;
        return this;
    }

    get proxyHandler(): ProxyHandlerLike {
        return this._proxyHandler;
    }

    // endregion proxy-handler

    // region bind-handler
    private _bindHandler: BindHandlerLike;

    $setBindHandler(ins: BindHandlerLike): CoreSecure {
        this._bindHandler = ins;
        return this;
    }

    get bindHandler(): BindHandlerLike {
        return this._bindHandler;
    }

    // endregion bind-handler

    // region lifecycle
    private _lifecycle: LifecycleLike;

    $setLifecycle(ins: LifecycleLike): CoreSecure {
        this._lifecycle = ins;
        return this;
    }

    get lifecycle(): LifecycleLike {
        return this._lifecycle;
    }

    // endregion lifecycle

    // region secure

    get $back(): CoreLike {
        return this;
    }


    get $secure(): CoreSecure {
        return this;
    }

    // endregion secure

}

$$coreInternalOn('class-instance', () => {
    core.fqnHandler.clazz(Core, FQN_PCK);
});
export const core: CoreLike = new Core();
