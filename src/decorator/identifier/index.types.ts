import {Dict, ShiftMain, ShiftSecure} from "@leyyo/common";
import {DecoLike} from "../abstract";
import {DecoCloneLike} from "../clone";
import {DecoInstanceLike} from "../instance";
import {DecoRule} from "../literals";

/**
 * DecoratorPool identifier
 *
 * Generics:
 * V: value
 * */
export interface DecoIdLike<V = Dict, M = Dict, P = V> extends DecoLike<V, M, P>, ShiftSecure<DecoIdSecure<V, M, P>> {
    // region public
    info(detailed?: boolean): Dict; // todo
    get clones(): Array<DecoCloneLike>;

    get instances(): Array<DecoInstanceLike>;

    keywords(...keywords: Array<string|symbol>): this;

    metadata(metadata: M): this;

    rules(...rules: Array<DecoRule>): this;

    processor<R = any>(fn: DecoProcessorLambda<R, V, M, P>): this;

    dirty(): void;
}

export interface DecoIdSecure<V = Dict, M = Dict, P = V> extends ShiftMain<DecoIdLike<V, M, P>> {
    $setMetadata(metadata: M): this;

    $setProcessor<R = any>(fn: DecoProcessorLambda<R, V, M, P>): this;
}

export type DecoProcessorLambda<R, V = Dict, M = Dict, P = V> = (ins: DecoInstanceLike<V, M, P>, parameters?: P) => R;
