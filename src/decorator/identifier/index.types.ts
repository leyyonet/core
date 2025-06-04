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
    get clones(): Array<DecoCloneLike<V, M, P>>;
    addClone(clone: DecoCloneLike<V, M, P>): void;

    get instances(): Array<DecoInstanceLike>;

    keywords(...keywords: Array<string|symbol>): this;

    metadata(metadata: M): this;
    deleteMetaKey(key: keyof M): this;
    setMetaKey(key: keyof M, value: M[keyof M]): this;

    rules(...rules: Array<DecoRule>): this;

    processor<R = any>(fn: DecoProcessorLambda<R, P>): this;
    addInstance(ins: DecoInstanceLike): void;

    dirty(): void;
}

export interface DecoIdSecure<V = Dict, M = Dict, P = V> extends ShiftMain<DecoIdLike<V, M, P>> {
    $setMetadata(metadata: M): this;

    $setProcessor<R = any>(fn: DecoProcessorLambda<R, P>): this;
}

export type DecoProcessorLambda<R, P> = (ins: DecoInstanceLike, parameters?: P) => R;
