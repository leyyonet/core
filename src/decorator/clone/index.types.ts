import {Dict} from "@leyyo/common";
import {DecoIdLike} from "../identifier";
import {DecoLike} from "../abstract";

export interface DecoCloneLike<V = Dict, M = Dict, P = V> extends DecoLike<V, M, P> {
    // region getters
    get id(): DecoIdLike<V, M, P>;

    // endregion getters
}
