import {EnumLiteral, Func, Obj} from "@leyyo/common";
import {core} from "../../../core";
import {DecoCloneLike} from "../../../decorator";
import {FQN_PCK} from "../../internal";
import {Loader} from "./loader";
import {$$coreInternalOn} from "../../../internal";


interface O {
    resources: Array<Func | Obj | EnumLiteral>;
}

export function Module(...resources: Array<Func | Obj>): ClassDecorator {
    return clazz => {
        cloned.process([clazz], {resources});
    };
}

let cloned: DecoCloneLike<O>;
$$coreInternalOn('deco-clone', () => {
    cloned = core.decoratorPool.newClone<O>(Module, Loader)
        .fqn(FQN_PCK);
});
