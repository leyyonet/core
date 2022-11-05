import {CoreSymbolLike} from "./types";
import {LY_SYMBOL_PROXY} from "./constants";
import {$ly, LY_CORE_SYMBOL} from "../core";
import {FuncLike, ObjectOrFunction, RecLike} from "../common";

/**
 * @core
 * */
export class CoreSymbol implements CoreSymbolLike {
    protected readonly _TYPES = ['object', 'function'];
    constructor() {
        $ly.addFqn(this);
    }
    static {
        $ly.addDependency('symbol', () => new CoreSymbol());
    }
    protected _check(target: ObjectOrFunction): RecLike {
        let descriptor = Object.getOwnPropertyDescriptor(target, LY_CORE_SYMBOL);
        if (!descriptor?.value) {
            descriptor = {
                value: {},
                configurable: true,
                writable: false,
                enumerable: false
            };
            Object.defineProperty(target, LY_CORE_SYMBOL, descriptor);
        }
        return descriptor.value as RecLike;
    }
    protected _get<T = unknown>(target: ObjectOrFunction, name: string, def?: T): T {
        try {
            if (this._invalidTarget(target) || this._invalidName(name)) {
                return undefined;
            }
            const rec = this._check(target);
            if (rec[name] === undefined && def !== undefined) {
                rec[name] = def;
            }
            return rec[name] as T;
        } catch (e) {
            console.trace(e.message);
        }
    }
    protected _invalidTarget(target: unknown): boolean {
        return !target || !this._TYPES.includes(typeof target);
    }
    protected _invalidName(name: string): boolean {
        return typeof name !== 'string';
    }
    findReferenced(target: ObjectOrFunction): ObjectOrFunction {
        return this.getReferenced(target as FuncLike) ?? target;
    }
    setReferenced(target: FuncLike, referenced: FuncLike): void {
        if (typeof target !== 'function') {
            throw new Error(`Target[${$ly.fqn.get(target)}] is not a function!`);
        }
        if (typeof referenced !== 'function') {
            throw new Error(`Target[${$ly.fqn.get(referenced)}] is not a function!`);
        }
        if (this.getReferenced(referenced)) {
            throw new Error(`Target[${$ly.fqn.get(referenced)}] is also referenced!`);
        }
        const count = this._get(referenced, 'injector.count', 0);
        this._set(referenced, 'injector.count', count + 1);

        Object.defineProperty(target, LY_SYMBOL_PROXY, {
            value: referenced,
            configurable: true,
            writable: false,
            enumerable: false
        });
        $ly.binder.setName(target, referenced.name);
    }
    getReferenced(target: FuncLike): FuncLike {
        if (typeof target !== 'function') {
            return undefined;
        }
        const descriptor = Object.getOwnPropertyDescriptor(target, LY_SYMBOL_PROXY);
        return descriptor?.value;
    }
    all(target: ObjectOrFunction): RecLike {
        target = this.findReferenced(target);
        if (this._invalidTarget(target)) {
            return undefined;
        }
        return this._check(target);
    }
    protected _set<T = unknown>(target: ObjectOrFunction, name: string, value: T): boolean {
        const rec = this._check(target);
        if (value === undefined) {
            if (rec[name] !== undefined) {
                delete rec[name];
            }
        } else {
            rec[name] = value;
        }
        return true;
    }
    set<T = unknown>(target: ObjectOrFunction, name: string, value: T): boolean {
        if (this._invalidTarget(target) || this._invalidName(name)) {
            return false;
        }
        target = this.findReferenced(target);
        return this._set(target, name, value);
    }
    setSome<T = RecLike>(target: ObjectOrFunction, map: T): number {
        if (this._invalidTarget(target) || !map || ((typeof map !== 'object') && !Array.isArray(map))) {
            return 0;
        }
        target = this.findReferenced(target);
        const rec = this._check(target);
        let size = 0;
        for (const [name, value] of Object.entries(map)) {
            if (!this._invalidName(name)) {
                if (map[name] !== undefined && rec[name] !== value) {
                    rec[name] = value;
                    size++;
                }
            }
        }
        return size;
    }
    push<T = unknown>(target: ObjectOrFunction, name: string, ...values: Array<T>): boolean {
        if (!values || values.length < 1) {
            return false;
        }
        target = this.findReferenced(target);
        const rec = this._get<Array<T>>(target, name, []);
        if (rec) {
            values = values.filter(value => !rec.includes(value));
            rec.push(...values);
            return true;
        }
        return false;
    }
    splice<T = unknown>(target: ObjectOrFunction, name: string, ...values: Array<T>): number {
        if (!values || values.length < 1) {
            return 0;
        }
        target = this.findReferenced(target);
        const rec = this._get<Array<T>>(target, name, []);
        if (rec && rec.length > 0) {
            let size = 0;
            values.forEach(value => {
                const index = rec.indexOf(value);
                if (index >= 0) {
                    rec.splice(index, 1);
                    size++;
                }
            });
            return size;
        }
        return 0;
    }
    patch<T = unknown>(target: ObjectOrFunction, name: string, key: string, value: T): boolean {
        if (this._invalidName(key) || value === undefined) {
            return false;
        }
        target = this.findReferenced(target);
        const rec = this._get<RecLike<T>>(target, name, {});
        if (rec && rec[key] !== value) {
            rec[key] = value;
            return true;
        }
        return false;
    }
    protected _getKey(name: string): symbol {
        return Symbol.for(`$ly.${name}`);
    }
    getDirect<T = unknown>(target: ObjectOrFunction, name: string, def?: T): T {
        if (this._invalidTarget(target) || this._invalidName(name)) {
            return undefined;
        }
        try {
            const sym = this._getKey(name);
            let descriptor = Object.getOwnPropertyDescriptor(target, sym);
            if (descriptor?.value === undefined) {
                if (def !== undefined) {
                    descriptor = {
                        value: def,
                        configurable: true,
                        writable: false,
                        enumerable: false
                    };
                    Object.defineProperty(target, sym, descriptor);
                }
                return def;
            }
            return descriptor.value;
        } catch (e) {
            console.trace(e.message);
        }
        return def;
    }
    deleteDirect(target: ObjectOrFunction, name: string): boolean {
        if (this._invalidTarget(target) || this._invalidName(name)) {
            return false;
        }
        try {
            const sym = this._getKey(name);
            const descriptor = Object.getOwnPropertyDescriptor(target, sym);
            if (descriptor?.value !== undefined) {
                delete target[sym];
                return true;
            }
        } catch (e) {
            console.trace(e.message);
        }
        return false;
    }
    setDirect(target: ObjectOrFunction, name: string, value: unknown): boolean {
        if (value === undefined) {
            return this.deleteDirect(target, name);
        }
        if (this._invalidTarget(target) || this._invalidName(name)) {
            return false;
        }
        try {
            Object.defineProperty(target, Symbol.for(`$ly.${name}`), {
                value: value, // todo
                configurable: true,
                writable: false,
                enumerable: false
            });
            return true;
        } catch (e) {
            console.trace(e.message);
        }
        return false;
    }
    get<T = unknown>(target: ObjectOrFunction, name: string, def?: T): T {
        target = this.findReferenced(target);
        return this._get(target, name, def);
    }
    getSome<T = unknown>(target: ObjectOrFunction, ...nnns: Array<string>): T {
        target = this.findReferenced(target);
        if (this._invalidTarget(target) || nnns.length < 1) {
            return undefined;
        }
        const rec = this._check(target);
        const result = {} as T;
        nnns.forEach(name => {
            if (!this._invalidName(name) && rec[name] !== undefined) {
                result[name] = rec[name];
            }
        });
        return Object.keys(result).length > 0 ? result : undefined;
    }
    exist(target: ObjectOrFunction, name: string): boolean {
        if (this._invalidTarget(target) || this._invalidName(name)) {
            return false;
        }
        target = this.findReferenced(target);
        return this._check(target)[name] !== undefined;
    }
    remove(target: ObjectOrFunction, name: string): boolean {
        if (this._invalidTarget(target) || this._invalidName(name)) {
            return false;
        }
        target = this.findReferenced(target);
        const rec = this._check(target);
        if (rec[name] !== undefined) {
            delete rec[name];
            return true;
        }
        return false;
    }
}