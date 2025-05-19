import {Arr} from "@leyyo/common";
import {DecoratorPool} from "./pool";
import {DecoClone} from "./clone";
import {DecoId} from "./identifier";
import {DecoInstance} from "./instance";
import {ClearProto} from "./decorators";

export const $$coreDecoratorInternal: Arr = [DecoratorPool, DecoClone, DecoId, DecoInstance, ClearProto];
