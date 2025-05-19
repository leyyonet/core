import {$assert, $dev} from "@leyyo/common";
import {core} from "../../../core";
import {FQN_PCK} from "../../internal";
import {DecoIdLike} from "../../../decorator";
import {$$coreInternalOn} from "../../../internal";


export interface ProviderOpt {
    identifier?: string;
}

export function Provider(identifier?: string): ClassDecorator {
    return clazz => id.process([clazz], {identifier});
}

let id: DecoIdLike<ProviderOpt>;

$$coreInternalOn('deco-id', () => {
    id = core.decoratorPool.newId<ProviderOpt>(Provider)
        .fqn(FQN_PCK)
        .targets('class')
        .rules('no-multiple', 'no-inherited')
        .processor((ins, p) => {
            $assert.textOptional(p.identifier, () => $dev.desc(ins, {field: 'identifier'}));

            ins.set(p);
        });
});
