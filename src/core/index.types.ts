import {ShiftMain, ShiftSecure} from "@leyyo/common";
import {DecoratorPoolLike} from "../decorator";
import {ReflectionPoolLike} from "../reflection";
import {FqnHandlerLike} from "../fqn";
import {FootprintLike} from "../footprint";
import {NamedPoolLike} from "../named";
import {EnumPoolLike} from "../enum";
import {ProxyHandlerLike} from "../proxy";
import {BindHandlerLike} from "../bind";
import {LifecycleLike} from "../lifecycle";
import {NameHandlerLike} from "../name";

export interface CoreLike extends ShiftSecure<CoreSecure> {
    get decoratorPool(): DecoratorPoolLike;

    get footprint(): FootprintLike;

    get fqnHandler(): FqnHandlerLike;

    get reflectionPool(): ReflectionPoolLike;

    get namedPool(): NamedPoolLike;

    get enumPool(): EnumPoolLike;

    get proxyHandler(): ProxyHandlerLike;
    get nameHandler(): NameHandlerLike;

    get bindHandler(): BindHandlerLike;

    get lifecycle(): LifecycleLike;
}

export interface CoreSecure extends ShiftMain<CoreLike> {
    $setDecoratorPool(ins: DecoratorPoolLike): CoreSecure;

    $setFootprint(ins: FootprintLike): CoreSecure;

    $setFqnHandler(ins: FqnHandlerLike): CoreSecure;

    $setReflectionPool(ins: ReflectionPoolLike): CoreSecure;

    $setNamedPool(ins: NamedPoolLike): CoreSecure;

    $setEnumPool(ins: EnumPoolLike): CoreSecure;

    $setProxyHandler(ins: ProxyHandlerLike): CoreSecure;
    $setNameHandler(ins: NameHandlerLike): CoreSecure;

    $setBindHandler(ins: BindHandlerLike): CoreSecure;

    $setLifecycle(ins: LifecycleLike): CoreSecure;
}
