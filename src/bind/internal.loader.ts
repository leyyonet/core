import {BindHandler} from "./bind.handler";
import {Bind} from "./decorators";
import {Arr} from "@leyyo/common";

export const $$coreBindInternal: Arr = [BindHandler, Bind];
