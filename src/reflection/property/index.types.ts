import {Dict, Func, ShiftMain, ShiftSecure} from "@leyyo/common";
import {
    DecoCLearType,
    DecoFilterBelongs,
    DecoFilterKeyword,
    DecoFilterKind,
    DecoInstanceLike,
    DecoKeyword,
    DecoKind,
    DecoLike
} from "../../decorator";
import {ClassReflectionLike} from "../class";
import {CoreReflectionLike} from "../abstract";
import {ParameterReflectionLike} from "../parameter";
import {FootprintInspected} from "../../footprint";

export interface PropertyReflectionLike extends CoreReflectionLike, ShiftSecure<PropertyReflectionSecure> {
    // region getters
    /**
     * Returns info about property
     * */
    info(detailed?: boolean): Dict;

    /**
     * Returns class reflection
     * */
    get clazz(): ClassReflectionLike;

    /**
     * Returns inherited property reflection if it's class extends another class
     * */
    get proto(): PropertyReflectionLike;

    /**
     * Property has a proto?
     * */
    get hasProto(): boolean;

    /**
     * Returns method function if it's method
     * */
    get callable(): Func;

    /**
     * Returns property keyword, it can be static or instance
     * */
    get keyword(): DecoKeyword;

    /**
     * Returns property kind, it can be method or field
     * */
    get kind(): DecoKind;

    /**
     * Returns kind === 'method'
     * - true: method
     * - false: field
     * */
    get isMethod(): boolean;

    /**
     * Returns keyword === 'instance'
     * - true: instance
     * - false: static
     * */
    get isInstance(): boolean;

    /**
     * Returns inspect of footprint
     * {@link Footprint#inspect}
     * */
    get inspected(): FootprintInspected;

    // endregion getters

    // region parameters
    /**
     * Returns parameters
     * */
    listParameters(): Array<ParameterReflectionLike>;

    /**
     * Have method a parameter with given index?
     * */
    hasParameter(index: number): boolean;

    /**
     * Returns parameter with given index?
     * */
    getParameter(index: number): ParameterReflectionLike;

    parametersBy(decorator: Func | string): Array<ParameterReflectionLike>;

    // endregion parameters

    // region filter-by
    /**
     * Utility function to filter by keyword
     * */
    filterByKeyword(filter?: DecoFilterKeyword): boolean;

    /**
     * Utility function to filter by kind
     * */
    filterByKind(filter?: DecoFilterKind): boolean;

    /**
     * Utility function to filter by belongs to
     * */
    filterByBelongs(decorator: Func | string, filter?: DecoFilterBelongs): boolean;

    // endregion filter-by
}

export interface PropertyReflectionSecure extends ShiftMain<PropertyReflectionLike> {
    $setFieldType(type: Func): this;

    $setMethodCallable(callable: Func): this;

    $clearValues(type: DecoCLearType, ...decorators: Array<Func | DecoLike | string>): this;

    get $methodCallback(): PropertyReflectionMethod;

    $setMethodCallback(fn: PropertyReflectionMethodCallback): this;
}

export type PropertyReflectionMethodCallback =
    PropertyReflectionMethodCallbackAsync
    | PropertyReflectionMethodCallbackSync;
export type PropertyReflectionMethodCallbackSync = (ins: DecoInstanceLike, ...args: Array<any>) => Array<any>;
export type PropertyReflectionMethodCallbackAsync = (ins: DecoInstanceLike, ...args: Array<any>) => Promise<Array<any>>;

export interface PropertyReflectionMethod {
    isAsync?: true;
    fn: PropertyReflectionMethodCallbackAsync | PropertyReflectionMethodCallbackSync;
}
