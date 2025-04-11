import {DecoIdLike} from "../identifier";
import {DecoCloneLike} from "../clone";
import {Dict, Func, ShiftMain, ShiftSecure} from "@leyyo/common";
import {Forbidden, Target} from "../literals";
import {DecoLike} from "../abstract";
import {CallbackLike} from "../../callback";

export interface DecoratorPoolLike extends CallbackLike<DecoLike, Func>, ShiftSecure<DecoratorSecure> {
    // region identifier
    addIdentifier<V extends Dict = Dict>(fn: Func, keywords: Array<Target|Forbidden>): DecoIdLike<V>;

    isIdentifier(target: Func | string): boolean;

    getIdentifier<V extends Dict = Dict>(target: Func | string): DecoIdLike<V>;

    identifiers(): Array<DecoIdLike>;

    // endregion identifier
    // region clone
    addClone<V extends Dict = Dict>(clone: Func, identifier: Func, target?: Array<Target>): DecoCloneLike<V>;

    clones(): Array<DecoCloneLike>;

    getClone<V extends Dict = Dict>(target: Func | string): DecoCloneLike<V>;

    isClone(target: Func | string): boolean;

    // endregion clone
}

export interface DecoratorSecure extends ShiftMain<DecoratorPoolLike> {
}