import {core} from "../../../core";
import {DecoCloneLike} from "../../../decorator";
import {FQN_PCK} from "../../internal";
import {AsyncProvider, AsyncProviderOpt} from "./async-provider";
import {$$coreInternalOn} from "../../../internal";

const DEF_NAME = 'connectAsync';

export function BulkProvider(member: string = DEF_NAME, identifier?: string): ClassDecorator {
    return clazz =>
        cloned.process([clazz], {member, identifier, defName: DEF_NAME, tag: 'bulk'});
}

let cloned: DecoCloneLike<AsyncProviderOpt>;
$$coreInternalOn('deco-clone', () => {
    cloned = core.decoratorPool.newClone<AsyncProviderOpt>(BulkProvider, AsyncProvider)
        .fqn(FQN_PCK);
});
