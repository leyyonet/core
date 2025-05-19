import {core} from "../../../core";
import {DecoCloneLike} from "../../../decorator";
import {FQN_PCK} from "../../internal";
import {AsyncProvider, AsyncProviderOpt} from "./async-provider";
import {$$coreInternalOn} from "../../../internal";

const DEF_NAME = 'connectAsync';

export function DataSource(member: string = DEF_NAME, identifier?: string): ClassDecorator {
    return clazz =>
        cloned.process([clazz], {member, identifier, defName: DEF_NAME, tag: 'data-source'});
}

// core.injection.$secure.$addProvider([clazz, rec.identifier], {blocking: 'async', deco: rec.ins.identifier})
let cloned: DecoCloneLike<AsyncProviderOpt>;
$$coreInternalOn('deco-clone', () => {
    cloned = core.decoratorPool.newClone<AsyncProviderOpt>(DataSource, AsyncProvider)
        .fqn(FQN_PCK);
});
