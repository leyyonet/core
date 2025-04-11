import {Dict, ShiftMain, ShiftSecure} from "@leyyo/common";
import {DecoLike} from "../abstract";
import {DecoCloneLike} from "../clone";

/**
 * DecoratorPool identifier
 *
 * Generics:
 * V: value
 * */
export interface DecoIdLike<V extends Dict = Dict> extends DecoLike<V>, ShiftSecure<DecoIdSecure<V>> {
    // region public
    info(detailed?: boolean): Dict; // todo
    get clones(): Array<DecoCloneLike>;
}

export interface DecoIdSecure<V extends Dict = Dict> extends ShiftMain<DecoIdLike<V>> {
}
