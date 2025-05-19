import {ClassLike} from "@leyyo/common";
import {DecoCloneLike} from "../../decorator";
import {core} from "../../core";
import {FQN_PCK} from "../internal";
import {NotInstantiable} from "./not-instantiable";
import {$$coreInternalOn} from "../../internal";

interface O {
    throwing?: boolean;
}

export function StaticClass(throwing?: boolean): ClassDecorator {
    return (clazz =>
        cloned.process<ClassLike>([clazz], {throwing})) as ClassDecorator;
}

let cloned: DecoCloneLike<O>;
$$coreInternalOn('deco-clone', () => {
    cloned = core.decoratorPool.newClone<O>(StaticClass, NotInstantiable)
        .fqn(FQN_PCK);
});
