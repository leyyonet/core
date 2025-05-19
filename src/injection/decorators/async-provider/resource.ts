import {core} from "../../../core";
import {DecoCloneLike} from "../../../decorator";
import {FQN_PCK} from "../../internal";
import {AsyncProvider, AsyncProviderOpt} from "./async-provider";
import {$$coreInternalOn} from "../../../internal";

const DEF_NAME = 'loadAsync';

export function Resource(member: string = DEF_NAME, identifier?: string): ClassDecorator {
    return clazz =>
        cloned.process([clazz], {member, identifier, defName: DEF_NAME, tag: 'resource'});
}

let cloned: DecoCloneLike<AsyncProviderOpt>;

$$coreInternalOn('deco-clone', () => {
    cloned = core.decoratorPool.newClone<AsyncProviderOpt>(Resource, AsyncProvider)
        .fqn(FQN_PCK);
});
