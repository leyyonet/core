import {Func0, RecLike} from "../common";
import {CoreCallLike} from "../api";

export type ContextGetLambda<T = RecLike> = (req: unknown, res?: unknown) => T;
export type ContextSetLambda = (req: unknown, res?: unknown) => void;
export type ContextLoadLambda<R = unknown> = (req: unknown, res?: unknown) => Promise<R>;

export interface CoreContextLike {
    get<C = RecLike>(req: unknown, res?: unknown): C;
    set(req: unknown, res?: unknown): void;
    setAsync<R = unknown>(req: unknown, res?: unknown): Promise<R>;

    call<C = RecLike, Q = RecLike | unknown, S = RecLike | unknown, A = RecLike | unknown, N = Func0>(req: Q, res?: S): CoreCallLike<C, Q, S, A, N>;
    callAsync<C = RecLike, Q = RecLike | unknown, S = RecLike | unknown, A = RecLike | unknown, N = Func0>(req: Q, res?: S): Promise<CoreCallLike<C, Q, S, A, N>>;
    setGetLambda<T = RecLike>(fn: ContextGetLambda<T>): this;

    setSetLambda(fn: ContextSetLambda): this;
    setLoadLambda(fn: ContextLoadLambda): this;
}
