import {DecoIdLike} from "../../decorator";
import {core} from "../../core";
import {Description} from "./description";
import {FQN_PCK} from "../internal";
import {$is} from "@leyyo/common";
import {$$coreInternalOn} from "../../internal";

interface O {
    description?: string;
}

export function _Method(description?: string): MethodDecorator {
    return (target: Object, property: PropertyKey, descriptor: TypedPropertyDescriptor<any>) => {
        id.process([target, property, descriptor], {description});
    };
}

let id: DecoIdLike<O>;

$$coreInternalOn('deco-clone', () => {
    id = core.decoratorPool.newId<O>(_Method)
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
