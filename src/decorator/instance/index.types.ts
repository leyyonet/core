import {Dict, Func, Obj} from "@leyyo/common";
import {DecoIdLike} from "../identifier";
import {
    ClassReflectionLike,
    CoreReflectionLike,
    ParameterReflectionLike,
    PropertyReflectionLike
} from "../../reflection";
import {Target} from "../literals";
import {DecoCloneLike} from "../clone";

export interface DecoInstanceLike<V = Dict, M = Dict, P = V> {

    // region getters
    copySelf(assigned: CoreReflectionLike): DecoInstanceLike<V, M, P>;
    get isCopied(): boolean;
    get description(): string;

    get identifier(): DecoIdLike<V, M, P>;

    get clone(): DecoCloneLike<V, M, P>;

    /**
     * Returns identifier's name
     * */
    get name(): string;

    /**
     * Unique code
     * */
    get code(): string;

    get target(): Target;

    get assigned(): CoreReflectionLike;

    get arguments(): DecoArguments;

    // endregion getters

    // region methods
    info(detailed?: boolean): Dict;

    set(value?: V): CoreReflectionLike;
    delete(): void;

    getValue<V2 = V>(): V2;

    // endregion methods

    // region class
    get isClass(): boolean;

    get asClass(): ClassReflectionLike;

    // endregion class

    // region property
    get isProperty(): boolean;

    get asProperty(): PropertyReflectionLike;
    // endregion property

    // region method
    get isMethod(): boolean;

    get asMethod(): PropertyReflectionLike;

    // endregion method

    // region field
    get isField(): boolean;

    get asField(): PropertyReflectionLike;

    // endregion field

    // region parameter
    get isParameter(): boolean;

    get asParameter(): ParameterReflectionLike;

    // endregion parameter
    toJSON(simple?: boolean): any;
}

export type DecoArguments = DecoArgumentClass | DecoArgumentField | DecoArgumentMethod | DecoArgumentParam;
export type DecoArgumentClass = [Obj | Func];
export type DecoArgumentField = [Obj | Func, PropertyKey];
export type DecoArgumentMethod = [Obj | Func, PropertyKey, TypedPropertyDescriptor<any>];
export type DecoArgumentParam = [Obj | Func, PropertyKey, number];

export interface DecoDoc<V = Dict> {
    ins: DecoInstanceLike<V>;
    value: V;
    inherited?: boolean;
    copied?: boolean;
}

export interface DecoDocExtended<V = Dict, M = Dict> {
    ins: DecoInstanceLike<V, M>;
    inherited?: boolean;
    value: V;
    metadata: M;
}
