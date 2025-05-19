import {Dict} from "@leyyo/common";
import {DecoIdLike} from "../identifier";
import {DecoLike} from "../abstract";

export interface DecoCloneLike<V = Dict, M = Dict, P = V> extends DecoLike<V, M, P> {
    // region getters
    info(detailed?: boolean): DecoClonedDetail;

    get id(): DecoIdLike<V, M, P>;

    // endregion getters
}

export interface DecoClonedDetail {
    name: string;
    identifier: Reference;
}

export interface Reference {
    $ref: string;
}
