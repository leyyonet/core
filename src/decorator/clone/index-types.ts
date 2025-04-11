import {Dict} from "@leyyo/common";
import {DecoIdLike} from "../identifier";
import {DecoLike} from "../abstract";

export interface DecoCloneLike<V extends Dict = Dict> extends DecoLike<V> {
    // region getters
    info(detailed?: boolean): DecoClonedDetail;

    get id(): DecoIdLike<V>;

    // endregion getters
}

export interface DecoClonedDetail {
    name: string;
    identifier: Reference;
}

export interface Reference {
    $ref: string;
}
