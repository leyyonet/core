import {DecoAliasLike, DecoLike} from "../deco";
import {FuncLike, NewableClass} from "../common";

export interface CoreHandlerLike {
    ctorAnonymous(deco: DecoLike | DecoAliasLike, clazz: NewableClass, parameters: Array<unknown>, lambda: FuncLike): NewableClass;
}