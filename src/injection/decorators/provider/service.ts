import {DecoCloneLike} from "../../../decorator";
import {core} from "../../../core";
import {Provider, ProviderOpt} from "./provider";
import {FQN_PCK} from "../../internal";
import {$$coreInternalOn} from "../../../internal";

export function Service(identifier?: string): ClassDecorator {
    return clazz => {
        cloned.process([clazz], {identifier});
    };
}

let cloned: DecoCloneLike<ProviderOpt>;
$$coreInternalOn('deco-clone', () => {
    cloned = core.decoratorPool.newClone<ProviderOpt>(Service, Provider)
        .fqn(FQN_PCK);
});
