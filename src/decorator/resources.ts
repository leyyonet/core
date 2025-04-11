import {CoreResourceItems} from "../core";
import {FQN_PCK} from "./internal";
import {DecoClone} from "./clone";
import {ClearProto} from "./decorators";
import {ForbiddenItems, TargetItems} from "./literals";
import {DecoId} from "./identifier";
import {DecoInstance} from "./instance";
import {DecoratorPool} from "./pool";

export const decoratorResources: CoreResourceItems = {
    path: FQN_PCK,
    classes: [DecoratorPool, DecoClone, DecoId, DecoInstance],
    decorators: [ClearProto],
    literals: [['Forbidden', ForbiddenItems], ['Target', TargetItems]]
};