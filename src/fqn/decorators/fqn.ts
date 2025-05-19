import {$assert, $dev} from "@leyyo/common";
import {core} from "../../core";
import {DecoIdLike, DecoInstanceLike} from "../../decorator";
import {FQN_PCK} from "../internal";
import {$$coreInternalOn} from "../../internal";


interface O {
    path: string;
}

/**
 * Decorates class with optional prefixes
 *
 * Class fqn will be `{prefixes}.{class}`
 */
export function Fqn(path: string): ClassDecorator {
    return clazz =>
        id.process([clazz], {path});
}

let id: DecoIdLike<O>;

$$coreInternalOn('deco-id', () => {
    id = core.decoratorPool.newId<O>(Fqn)
        .fqn(FQN_PCK)
        .targets('class')
        .rules('no-multiple', 'no-inherited')
        .processor((ins: DecoInstanceLike<O>, p: O) => {
            $assert.text(p.path, () => $dev.desc(ins, {field: 'path'}));
            const clazz = ins.asClass.creator;
            core.fqnHandler.clazz(clazz, p.path);

            ins.set(p);
        });
});
