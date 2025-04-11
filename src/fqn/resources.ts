import {FQN_PCK} from "./internal";
import {CoreResourceItems} from "../core";
import {FqnPool} from "./fqn-pool";
import {Fqn} from "./decorators";


export const fqnResources: CoreResourceItems = {
    path: FQN_PCK,
    classes: [FqnPool],
    decorators: [Fqn],
    literals: []
};