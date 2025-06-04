import { Func, ShiftMain, ShiftSecure} from "@leyyo/common";
import {CoreReflectionLike} from "../abstract";
import {PropertyReflectionLike} from "../property";
import {DecoCLearType, DecoLike} from "../../decorator";

export interface ParameterReflectionLike extends CoreReflectionLike, ShiftSecure<ParameterReflectionSecure> {
    // region getters
    get property(): PropertyReflectionLike;
    get proto(): ParameterReflectionLike;
    get hasProto(): boolean;
    get clones(): Array<ParameterReflectionLike>;

    get index(): number;

    get hasDefault(): boolean;

    get isVariadic(): boolean;

    // endregion getters
    copyDecorators(source: ParameterReflectionLike): void;
}

export interface ParameterReflectionSecure extends ShiftMain<ParameterReflectionLike> {
    $appendCopied(child: ParameterReflectionLike): void;
    $setType(type: Func): this;

    $clearValues(type: DecoCLearType, ...decorators: Array<Func | DecoLike | string>): this;
}
