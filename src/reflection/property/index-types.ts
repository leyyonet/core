import {
    DecoFilterBelongs,
    DecoFilterKeyword,
    DecoFilterKind,
    DecoInstanceLike,
    DecoKeyword,
    DecoKind,
    DecoLike
} from "../../decorator";
import {ClassReflectionLike} from "../class";
import {Dict, Func, ShiftMain, ShiftSecure} from "@leyyo/common";
import {CoreReflectionLike} from "../abstract";
import {ParameterReflectionLike} from "../parameter";
import {FootprintInspected} from "../../footprint";

export interface PropertyReflectionLike extends CoreReflectionLike, ShiftSecure<PropertyReflectionSecure> {
    // region getters
    info(detailed?: boolean): Dict;

    get clazz(): ClassReflectionLike;

    get proto(): PropertyReflectionLike;

    get hasProto(): boolean;

    get callable(): Func;

    get keyword(): DecoKeyword;

    get kind(): DecoKind;
    get inspected(): FootprintInspected;

    // endregion getters

    // region parameters
    listParameters(): Array<ParameterReflectionLike>;

    hasParameter(index: number): boolean;

    getParameter(index: number): ParameterReflectionLike;

    parametersBy(decorator: Func | string): Array<ParameterReflectionLike>;

    // endregion parameters

    // region filter-by
    filterByKeyword(filter?: DecoFilterKeyword): boolean;

    filterByKind(filter?: DecoFilterKind): boolean;

    filterByBelongs(decorator: Func | string, filter?: DecoFilterBelongs): boolean;

    // endregion filter-by

}

export interface PropertyReflectionSecure extends ShiftMain<PropertyReflectionLike> {
    $setFieldType(type: Func): this;

    $setMethodCallable(callable: Func): this;

    $setCurrentInstance(currentInstance: DecoInstanceLike): this;

    $setForCurrentDecorator<V extends Dict>(value: V): this;

    $filterDecorators(filter?: DecoFilterBelongs): Map<DecoLike, Array<Dict>>;
}