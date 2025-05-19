import {$assert, $dev, $is, EnumLiteral, Func, Obj} from "@leyyo/common";
import {core} from "../../../core";
import {FQN_PCK} from "../../internal";
import {DecoIdLike} from "../../../decorator";
import {$$coreInternalOn} from "../../../internal";


interface O {
    resources: Array<Func | Obj | EnumLiteral>;
}

export function Loader(...resources: Array<Func | Obj | EnumLiteral>): ClassDecorator {
    return clazz => {
        id.process([clazz], {resources});
    };
}

let id: DecoIdLike<O>;
$$coreInternalOn('deco-id', () => {
    id = core.decoratorPool.newId<O>(Loader)
        .fqn(FQN_PCK)
        .targets('class')
        .rules('no-multiple', 'no-inherited')
        .processor((ins, p: O) => {
            $assert.array(p.resources, () => $dev.desc(ins, {field: 'resources'}));
            const wrong = p.resources.filter(r => !($is.func(r) || $is.object(r) || $is.array(r)));
            if (wrong.length > 0) {
                throw $dev.invalidError({
                    issue: 'loader.item.invalid', desc: ins.description,
                    wrong: wrong.map(f => core.fqnHandler.get(f)).join(', ')
                });
            }
            ins.set(p);
        });
});
