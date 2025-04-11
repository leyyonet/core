import {Dict, Func, ShiftMain, ShiftSecure} from "@leyyo/common";
import {CoreReflectionLike} from "../abstract";
import {PropertyReflectionLike} from "../property";
import {DecoInstanceLike, DecoLike} from "../../decorator";

export interface ParameterReflectionLike extends CoreReflectionLike, ShiftSecure<ParameterReflectionSecure> {
    // region getters
    info(detailed?: boolean): Dict;

    get property(): PropertyReflectionLike;

    get index(): number;

    get hasDefault(): boolean;

    get isVariadic(): boolean;

    // endregion getters

    // region decorator
    decoMap(): Record<string, Array<Dict>>;

    hasDecorator(decorator: Func | string): boolean;

    listValues<V extends Dict = Dict>(decorator: Func | string): Array<V>;

    getValue<V extends Dict = Dict>(decorator: Func | string): V;

    // endregion decorator

}

export interface ParameterReflectionSecure extends ShiftMain<ParameterReflectionLike> {
    $setType(type: Func): this;

    $setCurrentInstance(currentInstance: DecoInstanceLike): this;

    $setForCurrentDecorator<V extends Dict>(value: V): this;

    $filterDecorators(): Map<DecoLike, Array<Dict>>;
}