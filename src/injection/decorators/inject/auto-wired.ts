import {Func} from "@leyyo/common";
import {DecoCloneLike} from "../../../decorator";
import {core} from "../../../core";
import {FQN_PCK} from "../../internal";
import {Inject, InjectOpt} from "./inject";
import {$$coreInternalOn} from "../../../internal";

export function AutoWired(identifier?: string): MethodDecorator;
export function AutoWired(identifier?: string): PropertyDecorator;
export function AutoWired(identifier?: string): MethodDecorator | PropertyDecorator {
    return (clazz: Func, property: PropertyKey, descriptor?: TypedPropertyDescriptor<any>) =>
        cloned.process([clazz, property, descriptor], {identifier});
}

let cloned: DecoCloneLike<InjectOpt>;
$$coreInternalOn('deco-clone', () => {
    cloned = core.decoratorPool.newClone(AutoWired, Inject)
        .fqn(FQN_PCK)
        .targets('method', 'field');
});
