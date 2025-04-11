import {Dict, Func, Obj} from "@leyyo/common";
import {DecoIdLike} from "../identifier";
import {
    ClassReflectionLike,
    CoreReflectionLike,
    ParameterReflectionLike,
    PropertyReflectionLike
} from "../../reflection";
import {Target} from "../literals";

export interface DecoInstanceLike<V extends Dict = Dict> {
    info(detailed?: boolean): Dict;

    get description(): string;

    get identifier(): DecoIdLike;

    /**
     * Returns identifier's name
     * */
    get name(): string;

    get target(): Target;

    get assigned(): CoreReflectionLike;
    get arguments(): DecoArgument;

    set(value?: V): CoreReflectionLike;

    isOfClass(): boolean;

    isOfMethod(): boolean;

    isOfField(): boolean;

    isOfParameter(): boolean;
    asClass(): ClassReflectionLike;

    asMethod(): PropertyReflectionLike;

    asField(): PropertyReflectionLike;

    asParameter(): ParameterReflectionLike;

}
export interface DecoArgument {
    clazz: Obj|Func;
    property?: string;
    descriptor?: TypedPropertyDescriptor<any>;
    index?: number;
    target?: Target;
}
