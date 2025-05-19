import {DecoIdLike} from "../../decorator";
import {core} from "../../core";
import {Description} from "./description";
import {FQN_PCK} from "../internal";
import {$is} from "@leyyo/common";
import {$$coreInternalOn} from "../../internal";

interface O {
    description?: string;
}

export function _Param(description?: string): ParameterDecorator {
    return (target: Object, property: PropertyKey, index: number) => {
        id.process([target, property, index], {description});
    };
}

let id: DecoIdLike<O>;
$$coreInternalOn('deco-clone', () => {
    id = core.decoratorPool.newId<O>(_Param)
        .fqn(FQN_PCK)
        .targets('method')
        .rules('no-multiple', 'no-inherited')
        .processor((ins, p) => {
            if (!$is.empty(p.description)) {
                core.decoratorPool.get(Description).process(ins.arguments, p);
            }
            ins.set({});
        });
});
