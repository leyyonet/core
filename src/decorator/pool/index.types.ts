import {Dict, Func, ShiftMain, ShiftSecure} from "@leyyo/common";
import {DecoIdLike} from "../identifier";
import {DecoCloneLike} from "../clone";
import {DecoLike} from "../abstract";

export interface DecoratorPoolLike extends ShiftSecure<DecoratorPoolSecure> {
    decorators(): Array<DecoLike>;

    get<V = Dict, M = Dict, P = V>(target: Func | string | DecoLike, required?: boolean): DecoLike<V, M, P>;

    exists(target: Func | string | DecoLike): boolean;

    // region identifier
    newIdentifier<V = Dict, M = Dict, P = V>(fn: Func): DecoIdLike<V, M, P>;

    newId<V = Dict, M = Dict, P = V>(fn: Func): DecoIdLike<V, M, P>;

    isIdentifier(target: Func | string): boolean;

    getIdentifier<V = Dict, M = Dict, P = V>(target: Func | string): DecoIdLike<V, M, P>;

    identifiers(): Array<DecoIdLike>;

    // endregion identifier
    // region clone
    newClone<V = Dict, M = Dict, P = V>(clone: Func, identifier: Func): DecoCloneLike<V, M, P>;

    clones(): Array<DecoCloneLike>;

    getClone<V = Dict, M = Dict, P = V>(target: Func | string): DecoCloneLike<V, M, P>;

    isClone(target: Func | string): boolean;

    // endregion clone
}

export interface DecoratorPoolSecure extends ShiftMain<DecoratorPoolLike> {
}
