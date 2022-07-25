import {CoreLike, FqnArgument, FqnBasic, FqnPoolLike, LoggerLike} from "../index-types";
import {ClassLike, FuncLike, ObjectLike} from "../index-aliases";

export class CoreFqnPool implements FqnPoolLike {
    // region properties
    protected _init: boolean;
    protected readonly _lyy: CoreLike;
    private _ins: FqnBasic;
    protected _pool: Array<FqnArgument>;
    protected LOG: LoggerLike;
    // endregion properties
    constructor(ins: CoreLike) {
        this._lyy = ins;
        this._pool = this._lyy.ly_array<FqnArgument>(this, '_pool');
        this.LOG = this._lyy.ly_log(this);
    }
    ly_init(): void {
        if (this._init) {return;}
        this._init = true;
    }

    // region sign
    is(value: unknown): boolean {
        if (this._ins) {
            return this._ins.is(value);
        }
        return false;
    }
    name(value: unknown): string {
        if (this._ins) {
            return this._ins.name(value);
        }
        if (value === undefined || value === null) {
            return 'null';
        }
        try {
            const type = typeof value;
            switch (typeof value) {
                case 'string':
                case 'boolean':
                case 'number':
                case 'bigint':
                case 'symbol':
                    return type;
                case 'object':
                    return value.constructor?.name ?? 'object';
                case "function":
                    return value.name;
            }
        } catch (e) {
        }
        return 'null';
    }
    // endregion sign
    // region dimension
    protected _bind(name: string, target: FuncLike|ObjectLike, key: string, isClass: boolean): void {
        if (key === (isClass ? 'prototype' : 'constructor') || typeof key === 'symbol' || this._lyy.system.isSysFunction(key)) {
            return;
        }
        try {
            const desc = Object.getOwnPropertyDescriptor(target, key);
            if (typeof desc?.value === 'function' && typeof desc?.get !== 'function') {
                target[key] = target[key].bind(target);
            }
        } catch (e) {
            console.log(`CoreFqnPool._bind(${name}, ${key}, ${isClass ? 'static' : 'instance'})`, e.message);
        }
    }
    refresh(target: ObjectLike|FuncLike): void {
        if (this._ins) {
            this._ins.refresh(target);
            return;
        }
        if (!target || !['function', 'object'].includes(typeof target)) {
            return;
        }
        const name = (typeof target === 'function') ? target.name : (target as ObjectLike).constructor?.name;
        if (!name || this._lyy.system.isSysClass(name)) {
            return;
        }
        if (typeof target === 'function') {
            Object.getOwnPropertyNames(target).forEach(property => {
                this._bind(name, target, property, true);
            });
        }
        else {
            Object.getOwnPropertyNames(target).forEach(property => {
                this._bind(name, target, property, false);
            });
            // endregion static-members
        }
        this._pool.push({_f: 'refresh', target});
    }
    clazz(target: ClassLike, ...prefixes: Array<string>): void {
        if (this._ins) {
            this._ins.clazz(target, ...prefixes);
            return;
        }
        this._pool.push({_f: 'clazz', target, prefixes});
    }
    func(target: FuncLike, ...prefixes: Array<string>): void {
        if (this._ins) {
            this._ins.func(target, ...prefixes);
            return;
        }
        this._pool.push({_f: 'func', target, prefixes});
    }
    enumeration(name: string, target: ObjectLike, ...prefixes: Array<string>): void {
        if (this._ins) {
            this._ins.enumeration(name, target, ...prefixes);
            return;
        }
        this._pool.push({_f: 'enumeration', name, target, prefixes});
    }
    // endregion dimension
    protected _afterSet(): void {
        this._pool.forEach(item => {
            try {
                switch (item._f) {
                    case "refresh":
                        this._ins.refresh(item.target);
                        break;
                    case "clazz":
                        this._ins.clazz(item.target as ClassLike, ...item.prefixes);
                        break;
                    case "func":
                        this._ins.func(item.target as FuncLike, ...item.prefixes);
                        break;
                    case "enumeration":
                        this._ins.enumeration(item.name, item.target, ...item.prefixes);
                        break;
                }
            } catch (e) {
                this.LOG.native(e, 'pool', item);
            }
        });
        this._lyy.repo.clearArray(this, '_pool');
    }
    set(ins: FqnBasic): void {
        if (!this._ins) {
            this._ins = ins;
            this._afterSet();
        }
    }
}