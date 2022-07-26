import {CoreLike, HookLike, HookTrigger, LoggerLike} from "../index-types";
import {FuncLike} from "../index-aliases";
import {DeveloperException, Exception} from "../index-errors";

export class CoreHook implements HookLike {
    // region properties
    protected _init: boolean;
    protected readonly _lyy: CoreLike;
    protected _triggers: Map<string, Map<string, FuncLike>>; // Map<name, Map<tag, trigger>>
    protected _lambdas: Map<string, FuncLike>; // Map<name, hook>
    protected LOG: LoggerLike;
    // endregion properties
    constructor(ins: CoreLike) {
        this._lyy = ins;
        this._lambdas = this._lyy.ly_map<string, FuncLike>(this, '_lambdas');
        this._triggers = this._lyy.ly_map<string, Map<string, FuncLike>>(this, '_triggers');
        this.LOG = this._lyy.ly_log(this);
    }
    ly_init(): void {
        if (this._init) {return;}
        this._init = true;
    }
    private _getName(given: string): string {
        let name;
        try {
            name = this._lyy.primitive.text(given);
        } catch (e) {
            throw Exception.cast(e).with(this).appendParams({indicator: 'hook.invalid-name'});
        }
        if (!name) {
            throw new DeveloperException('hook.empty-name', {name: given}).with(this);
        }
        return name;
    }
    private _getFn(given: FuncLike, name: string, type: 'function'|'trigger'): FuncLike {
        let fn;
        try {
            fn = this._lyy.primitive.func(given);
        } catch (e) {
            throw Exception.cast(e).with(this).appendParams({indicator: 'hook.invalid-function', name, type});
        }
        if (!fn) {
            throw new DeveloperException('hook.empty-function', {name, type, fn: given}).with(this);
        }
        return fn;
    }
    private _getTag(given: string, name: string): string {
        let tag;
        try {
            tag = this._lyy.primitive.text(given);
        } catch (e) {
            throw Exception.cast(e).with(this).appendParams({indicator: 'hook.invalid-tag', name});
        }
        return tag ?? name;
    }
    get(name: string, silent?: boolean): FuncLike {
        name = this._getName(name);
        if (this._lambdas.has(name)) {
            return this._lambdas.get(name);
        }
        if (!silent) {
            throw new DeveloperException('hook.notFound-name', {name}).with(this);
        }
        return null;
    }

    has(name: string): boolean {
        return this._lambdas.has(this._getName(name));
    }

    add(name: string, fn: FuncLike) {
        name = this._getName(name);
        fn = this._getFn(fn, name, 'function');
        if (this._lambdas.has(name)) {
            throw new DeveloperException('hook.duplicated-name', {name}).with(this);
        }
        this._lambdas.set(name, fn);
        this._runTrigger(name, fn);
        this.LOG.info('added', {name});
    }

    update(name: string, fn: FuncLike): boolean {
        name = this._getName(name);
        fn = this._getFn(fn, name, 'function');
        if (!this._lambdas.has(name)) {
            throw new DeveloperException('hook.notFound-name', {name}).with(this);
        }
        this._lambdas.set(name, fn);
        this._runTrigger(name, fn);
        this.LOG.info('update', {name});
        return true;
    }

    remove(name: string, silent?: boolean): boolean {
        name = this._getName(name);
        if (!this._lambdas.has(name)) {
            throw new DeveloperException('hook.notFound-name', {name}).with(this);
        }
        this._lambdas.delete(name);
        this.LOG.info('removed', {name});
        return true;
    }

    protected _runTrigger(name: string, fn: FuncLike): void {
        if (this._triggers.has(name)) {
            this.LOG.debug('trigger.run', {name});
            this._triggers.get(name).forEach(trigger => trigger(fn));
        }
    }
    addTrigger(name: string, trigger: HookTrigger, tag?: string, silent?: boolean): void {
        trigger = this._getFn(trigger, name, 'trigger') as HookTrigger;
        name = this._getName(name);
        tag = this._getTag(tag, name);
        if (!this._triggers.has(name)) {
            this._triggers.set(name, new Map<string, FuncLike>());
        }
        if (this._triggers.get(name).has(tag) && !silent) {
            throw new DeveloperException('hook.duplicated-tag', {name, tag}).with(this);
        }
        this._triggers.get(name).set(tag, trigger);
        this.LOG.info('trigger.added', {name, tag});
        if (this._lambdas.has(name)) {
            this._runTrigger(name, this._lambdas.get(name));
        }
    }
    clearTriggers(name: string, silent?: boolean): boolean {
        name = this._getName(name);
        if (this._triggers.has(name)) {
            this._triggers.delete(name);
            this.LOG.info('triggers.cleared', {name});
            return true;
        }
        throw new DeveloperException('hook.notFound-name', {name}).with(this);
    }
    clearTrigger(name: string, tag: string): boolean {
        name = this._getName(name);
        tag = this._getTag(tag, name);
        if (this._triggers.has(name) && this._triggers.get(name).has(tag)) {
            this._triggers.get(name).delete(tag);
            this.LOG.info('trigger.cleared', {name, tag});
            return true;
        }
        throw new DeveloperException('hook.notFound-tag', {name}).with(this);
    }
    run<T = unknown>(name: string, ...args: Array<unknown>): T {
        return this.get(name)(...args) as T;
    }
    runOrIgnore<T = unknown>(name: string, ...args: Array<unknown>): T {
        const fn = this.get(name, true);
        return (typeof fn === 'function') ? fn(...args) : undefined;
    }
    async runAsync<T = unknown>(name: string, ...args: Array<unknown>): Promise<T> {
        return this.get(name)(...args) as Promise<T>;
    }
    async runOrIgnoreAsync<T = unknown>(name: string, ...args: Array<unknown>): Promise<T> {
        const fn = this.get(name, true);
        return (typeof fn === 'function') ? fn(...args) as Promise<T> : undefined;
    }
}