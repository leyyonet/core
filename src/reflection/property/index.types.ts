import {Dict, Func, ShiftMain, ShiftSecure} from "@leyyo/common";
import {
    DecoArgumentClass, DecoArgumentField, DecoArgumentMethod,
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
     * Returns class reflection
     * */
    get clazz(): ClassReflectionLike;

    get clones(): Array<PropertyReflectionLike>;

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
    get parameters(): Array<ParameterReflectionLike>;

    /**
     * Have method a parameter with given name?
     * */
    hasParameter(name: string): boolean;
    /**
     * Have method a parameter with given index?
     * */
    hasParameter(index: number): boolean;

    /**
     * Returns parameter with given name?
     * */
    getParameter(name: string): ParameterReflectionLike;
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

    copyDecorators(source: PropertyReflectionLike): void;
}

export interface PropertyReflectionSecure extends ShiftMain<PropertyReflectionLike> {
    $appendCopied(child: PropertyReflectionLike): void;
    $setType(type: Func): this;
    $setProto(proto: PropertyReflectionLike): this;
    $copyParameter(source: ParameterReflectionLike): ParameterReflectionLike;
    $createParameter(index?: number, type?: Func, name?: string): ParameterReflectionLike;

    $setCallable(callable: Func): this;

    $clearValues(type: DecoCLearType, ...decorators: Array<Func | DecoLike | string>): this;
}
