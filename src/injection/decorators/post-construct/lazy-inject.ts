import {Func} from "@leyyo/common";
import {core} from "../../../core";
import {DecoCloneLike} from "../../../decorator";
import {FQN_PCK} from "../../internal";
import {PostConstruct} from "./post-construct";
import {$$coreInternalOn} from "../../../internal";


interface O {
    identifier?: string;
}

export function LazyInject(identifier?: string): MethodDecorator;
export function LazyInject(identifier?: string): PropertyDecorator;
export function LazyInject(identifier?: string): MethodDecorator | PropertyDecorator {
    return (clazz: Func, property: PropertyKey, descriptor?: TypedPropertyDescriptor<any> | number) =>
        cloned.process([clazz, property, descriptor], {identifier});
}

let cloned: DecoCloneLike<O>;
$$coreInternalOn('deco-clone', () => {
    cloned = core.decoratorPool.newClone<O>(LazyInject, PostConstruct)
        .fqn(FQN_PCK);
});
