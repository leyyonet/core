import {Dict, Func, ShiftMain, ShiftSecure} from "@leyyo/common";
import {CoreReflectionLike} from "../abstract";
import {PropertyReflectionLike} from "../property";
import {DecoArgumentField, DecoArgumentMethod, DecoArgumentParam, DecoCLearType, DecoLike} from "../../decorator";

export interface ParameterReflectionLike extends CoreReflectionLike, ShiftSecure<ParameterReflectionSecure> {
    // region getters
    info(detailed?: boolean): Dict;

    get property(): PropertyReflectionLike;

    get index(): number;

    get hasDefault(): boolean;

    get isVariadic(): boolean;

    // endregion getters
    copyDecorators(source: ParameterReflectionLike, args: DecoArgumentParam): void;
}

export interface ParameterReflectionSecure extends ShiftMain<ParameterReflectionLike> {
    $setType(type: Func): this;

    $clearValues(type: DecoCLearType, ...decorators: Array<Func | DecoLike | string>): this;
}
