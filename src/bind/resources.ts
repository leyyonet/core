import {FQN_PCK} from "./internal";
import {CoreResourceItems} from "../core";
import {Bind} from "./decorators";
import {CoreBind} from "./core-bind";


export const bindResources: CoreResourceItems = {
    path: FQN_PCK,
    classes: [CoreBind],
    decorators: [Bind],
    literals: []
};