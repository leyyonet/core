import {CoreResourceItems} from "../core";
import {FQN_PCK} from "./internal";
import {CallbackPool} from "./callback-pool";
import {AbstractCallback} from "./abstract-callback";

export const callbackResources: CoreResourceItems = {
    path: FQN_PCK,
    classes: [CallbackPool, AbstractCallback],
    decorators: [],
    literals: []
};