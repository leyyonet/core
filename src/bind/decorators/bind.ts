import {core} from "../../core";
import {DecoIdLike, DecoInstanceLike} from "../../decorator";
import {FQN_PCK} from "../internal";
import {BindScopeType} from "../index.types";
import {$$coreInternalOn} from "../../internal";


interface O {
    type: BindScopeType;
}

/**
 * Decorates class for bind all properties
 */
export function Bind(type?: BindScopeType): ClassDecorator {
    return clazz =>
        id.process([clazz], {type});
}

let id: DecoIdLike<O>;
$$coreInternalOn('deco-id', () => {
    id = core.decoratorPool.newId<O>(Bind)
        .fqn(FQN_PCK)
        .targets('class')
        .rules('no-multiple', 'no-inherited')
        .processor((ins: DecoInstanceLike<O>, p: O) => {
            ins.set(p);
            core.bindHandler.run(ins.asClass.creator, p.type);
        });
})
