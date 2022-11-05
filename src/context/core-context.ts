// x_console.log(`## ${__filename}`, {i: 'loading'});

import {ContextGetLambda, ContextLoadLambda, ContextSetLambda, CoreContextLike} from "./types";
import {Func0, RecLike} from "../common";
import {$ly} from "../core";
import {CoreCallLike} from "../api";

/**
 * @core
 * */
export class CoreContext implements CoreContextLike {
    // region properties
    protected LOG = $ly.preLog;
    // endregion properties
    // region lambda
    // noinspection JSUnusedLocalSymbols
    protected _getLambda: ContextGetLambda<unknown>;

    // noinspection JSUnusedLocalSymbols
    protected _setLambda: ContextSetLambda;
    protected _loadLambda: ContextLoadLambda;

    // endregion lambda
    constructor() {
        this.$init();
        $ly.addFqn(this);
        $ly.addTrigger('logger', () => {this.LOG = $ly.logger.assign(this)});
    }
    static {
        $ly.addDependency('context', () => new CoreContext());
    }
    private $init() {
        this._getLambda = (() => undefined) as ContextGetLambda;
        this._setLambda = () => undefined;
        this._loadLambda = async () => undefined;
    }

    // region internal
    setGetLambda<T = RecLike>(fn: ContextGetLambda<T>): this {
        this._getLambda = fn;
        return this;
    }

    setSetLambda<T = RecLike>(fn: ContextSetLambda): this {
        this._setLambda = fn;
        return this;
    }
    setLoadLambda(fn: ContextLoadLambda): this {
        this._loadLambda = fn;
        return this;
    }

    // endregion internal
    get<C = RecLike>(req: unknown, res?: unknown): C {
        return this._getLambda(req, res) as C;
    }
    set(req: unknown, res?: unknown): void {
        this._setLambda(req, res);
    }
    async setAsync<R = unknown>(req: unknown, res?: unknown): Promise<R> {
        return await this._loadLambda(req, res) as R;
    }
    call<C = RecLike, Q = RecLike | unknown, S = RecLike | unknown, A = RecLike | unknown, N = Func0>(req: Q, res?: S): CoreCallLike<C, Q, S, A, N> {
        return {
            ctx: this.get(req, res),
            req, res
        } as CoreCallLike<C, Q, S, A, N>;
    }
    async callAsync<C = RecLike, Q = RecLike | unknown, S = RecLike | unknown, A = RecLike | unknown, N = Func0>(req: Q, res?: S): Promise<CoreCallLike<C, Q, S, A, N>> {
        return {
            ctx: await this.setAsync(req, res),
            req, res
        } as CoreCallLike<C, Q, S, A, N>;
    }
    // noinspection JSUnusedGlobalSymbols
}
// x_console.log(`## ${__filename}`, {i: 'loaded'});