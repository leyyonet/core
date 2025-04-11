import {CoreLike, CoreSecure} from "./index-types";
import {DecoratorPoolLike} from "../decorator";
import {FootprintLike} from "../footprint";
import {FqnPoolLike} from "../fqn";
import {InjectionPoolLike} from "../injection";
import {ReflectionPoolLike} from "../reflection";
import {RulerPoolLike} from "../ruler";
import {CallbackPoolLike} from "../callback";
import {EnumPoolLike} from "../enum";
import {CoreProxyLike} from "../proxy";
import {CoreBindLike} from "../bind";

// console.log(__filename);

export class Core implements CoreLike, CoreSecure {

    constructor() {
    }

    // region decorator
    private _decoratorPool: DecoratorPoolLike;
    get decorator(): DecoratorPoolLike {
        return this._decoratorPool;
    }

    $setDecorator(ins: DecoratorPoolLike): CoreSecure {
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
    private _fqnPool: FqnPoolLike;
    get fqn(): FqnPoolLike {
        return this._fqnPool;
    }

    $setFqn(ins: FqnPoolLike): CoreSecure {
        this._fqnPool = ins;
        return this;
    }
    // endregion fqn

    // region injection
    private _injectionPool: InjectionPoolLike;
    get injection(): InjectionPoolLike {
        return this._injectionPool;
    }

    $setInjection(ins: InjectionPoolLike): CoreSecure {
        this._injectionPool = ins;
        return this;
    }
    // endregion injection

    // region reflection
    private _reflectionPool: ReflectionPoolLike;
    get reflection(): ReflectionPoolLike {
        return this._reflectionPool;
    }

    $setReflection(ins: ReflectionPoolLike): CoreSecure {
        this._reflectionPool = ins;
        return this;
    }
    // endregion reflection

    // region ruler
    private _rulerPool: RulerPoolLike;

    get ruler(): RulerPoolLike {
        return this._rulerPool;
    }

    $setRuler(ins: RulerPoolLike): CoreSecure {
        this._rulerPool = ins;
        return this;
    }
    // endregion ruler

    // region callback
    private _callback: CallbackPoolLike;
    get callback(): CallbackPoolLike {
        return this._callback;
    }
    $setCallback(ins: CallbackPoolLike): CoreSecure {
        this._callback = ins;
        return this;
    }

    // region callback

    // region enum
    private _enumeration: EnumPoolLike;
    $setEnumeration(ins: EnumPoolLike): CoreSecure {
        this._enumeration = ins;
        return this;
    }

    get enumeration(): EnumPoolLike {
        return this._enumeration;
    }

    // endregion enum

    // region proxy
    private _proxy: CoreProxyLike;
    $setProxy(ins: CoreProxyLike): CoreSecure {
        this._proxy = ins;
        return this;
    }

    get proxy(): CoreProxyLike {
        return this._proxy;
    }

    // endregion proxy

    // region bind
    private _bind: CoreBindLike;
    $setBind(ins: CoreBindLike): CoreSecure {
        this._bind = ins;
        return this;
    }

    get bind(): CoreBindLike {
        return this._bind;
    }
    // endregion bind

    // region secure

    get $back(): CoreLike {
        return this;
    }


    get $secure(): CoreSecure {
        return this;
    }

    // endregion secure

}

export const core: CoreLike = new Core();
