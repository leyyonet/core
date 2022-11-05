import {CoreHookLike, HookKind, HookTrigger} from "./types";
import {FuncLike} from "../common";
import {$ly} from "../core";
import {DeveloperException} from "../error";

/**
 * @core
 * */
export class CoreHook implements CoreHookLike {
    // region properties
    protected _triggers: Map<string, Map<string, FuncLike>>; // Map<name, Map<tag, trigger>>
    protected _lambdas: Map<string, FuncLike>; // Map<name, hook>
    protected LOG = $ly.preLog;

    // endregion properties
    constructor() {
        $ly.addFqn(this);
        $ly.addTrigger('logger', () => {this.LOG = $ly.logger.assign(this)});
        $ly.addTrigger('repo', () => {
            this._lambdas = $ly.repo.newMap<string, FuncLike>(this, '_lambdas');
            this._triggers = $ly.repo.newMap<string, Map<string, FuncLike>>(this, '_triggers');
        });
    }
    static {
        $ly.addDependency('hook', () => new CoreHook());
    }

    // region protected
    protected _getName(name: string): string {
        return $ly.primitive.check(this, 'name', name, $ly.primitive.textFilled);
    }

    // noinspection JSUnusedLocalSymbols
    protected _getFn(fn: FuncLike, name: string, kind: HookKind): FuncLike {
        return $ly.primitive.check(this, 'fn', fn, $ly.primitive.funcFilled, {name, kind});
    }

    protected _getTag(tag: string, name: string): string {
        return $ly.primitive.check(this, 'tag', tag, $ly.primitive.text, {name}) ?? name;
    }

    protected _runTrigger(name: string, fn: FuncLike): void {
        if (this._triggers.has(name)) {
            this.LOG.debug(`Hook triggered: ${name}`);
            this._triggers.get(name).forEach(f => f(fn));
        }
    }

    // endregion protected

    // region public
    get(name: string, silent?: boolean): FuncLike {
        name = this._getName(name);
        if (this._lambdas.has(name)) {
            return this._lambdas.get(name);
        }
        if (!silent) {
            throw new DeveloperException('hook.absent.name', {name}).with(this);
        }
        return undefined;
    }

    has(name: string): boolean {
        return this._lambdas.has(this._getName(name));
    }

    add(name: string, fn: FuncLike) {
        name = this._getName(name);
        fn = this._getFn(fn, name, 'function');
        if (this._lambdas.has(name)) {
            throw new DeveloperException('hook.duplicated.name', {name}).with(this);
        }
        this._lambdas.set(name, fn);
        this._runTrigger(name, fn);
        this.LOG.debug('Hook added', {name});
    }

    // noinspection JSUnusedGlobalSymbols
    update(name: string, fn: FuncLike): boolean {
        name = this._getName(name);
        fn = this._getFn(fn, name, 'function');
        if (!this._lambdas.has(name)) {
            throw new DeveloperException('hook.absent.name', {name}).with(this);
        }
        this._lambdas.set(name, fn);
        this._runTrigger(name, fn);
        this.LOG.debug(`Hook updated: ${name}`);
        return true;
    }

    remove(name: string): boolean {
        name = this._getName(name);
        if (!this._lambdas.has(name)) {
            throw new DeveloperException('hook.absent.name', {name}).with(this);
        }
        this._lambdas.delete(name);
        this.LOG.info(`Hook removed: ${name}`);
        return true;
    }

    // noinspection JSUnusedGlobalSymbols
    addTrigger(name: string, fn: HookTrigger, tag?: string, silent?: boolean): void {
        fn = this._getFn(fn, name, 'trigger') as HookTrigger;
        name = this._getName(name);
        tag = this._getTag(tag, name);
        if (!this._triggers.has(name)) {
            this._triggers.set(name, new Map<string, FuncLike>());
        }
        if (this._triggers.get(name).has(tag) && !silent) {
            throw new DeveloperException('hook.duplicated.tag', {name, tag}).with(this);
        }
        this._triggers.get(name).set(tag, fn);
        this.LOG.debug('Hook trigger added', (name === tag) ? {name} : {name, tag});
        if (this._lambdas.has(name)) {
            this._runTrigger(name, this._lambdas.get(name));
        }
    }

    clearTriggers(name: string): boolean {
        name = this._getName(name);
        if (this._triggers.has(name)) {
            this._triggers.delete(name);
            this.LOG.debug(`Hook triggers cleared: ${name}`);
            return true;
        }
        throw new DeveloperException('hook.absent.name', {name}).with(this);
    }

    // noinspection JSUnusedGlobalSymbols
    clearTrigger(name: string, tag: string): boolean {
        name = this._getName(name);
        tag = this._getTag(tag, name);
        if (this._triggers.has(name) && this._triggers.get(name).has(tag)) {
            this._triggers.get(name).delete(tag);
            this.LOG.debug(`Hook trigger cleared: ${name}`, {tag});
            return true;
        }
        throw new DeveloperException('hook.absent.name', {name, tag}).with(this);
    }

    run<T = unknown>(name: string, ...a: Array<unknown>): T {
        return this.get(name)(...a) as T;
    }

    // noinspection JSUnusedGlobalSymbols
    runOrIgnore<T = unknown>(name: string, ...a: Array<unknown>): T {
        const fn = this.get(name, true);
        return (typeof fn === 'function') ? fn(...a) : undefined;
    }

    // noinspection JSUnusedGlobalSymbols
    async runAsync<T = unknown>(name: string, ...a: Array<unknown>): Promise<T> {
        return this.get(name)(...a) as Promise<T>;
    }

    // noinspection JSUnusedGlobalSymbols
    async runOrIgnoreAsync<T = unknown>(name: string, ...a: Array<unknown>): Promise<T> {
        const fn = this.get(name, true);
        return (typeof fn === 'function') ? fn(...a) as Promise<T> : undefined;
    }

    // endregion public
}
