import util from "util";
import {CoreJsonLike} from "./types";
import {$ly} from "../core";
import {FuncLike, ObjectLike, ToJsonLike} from "../common";


/**
 * @core
 * */
export class CoreJson implements CoreJsonLike {
    constructor() {
        $ly.addFqn(this);
    }
    static {
        $ly.addDependency('json', () => new CoreJson());
    }

    protected _name(fn: FuncLike): string {
        return $ly.fqn?.get(fn) ?? fn?.name ?? undefined;
    }

    protected _check(value: unknown, level: number, maxLevel: number, map: WeakMap<ObjectLike, number>): unknown {
        if ($ly.not(value)) {
            return value;
        }
        switch (typeof value) {
            case "string":
            case "number":
            case "boolean":
                return value;
            case "bigint":
                return value.toString();
            case "object":
                let count = 1;
                if (!map.has(value)) {
                    map.set(value, count);
                } else {
                    count = map.get(value) + 1;
                    map.set(value, count);
                }
                if (count > 1000) {
                    return {$ref: `#circular: ${this._name(value?.constructor)}`};
                }
                if (level >= maxLevel) {
                    return {$ref: `#max-level: ${maxLevel}`};
                }
                if (value instanceof Array) {
                    return value.map(item => this._check(item, level+1, maxLevel, map));
                } else if (value instanceof Set) {
                    return Array.from(value.values()).map(item => this._check(item, level+1, maxLevel, map));
                } else if (value instanceof Map) {
                    const rec = {};
                    for (const [k, item] of value.entries()) {
                        rec[k] = this._check(item, level + 1, maxLevel, map);
                    }
                    return rec;
                } else if ((typeof value[Symbol.iterator] === 'function')) {
                    return Array.from(value as Iterable<unknown>).map(item => this._check(item, level+1, maxLevel, map));
                } else if (value instanceof Object) {
                    if (typeof (value as ToJsonLike).toJSON === 'function') {
                        return this._check((value as ToJsonLike).toJSON(), level, maxLevel, map);
                    }
                    const rec = {};
                    for (const [k, item] of Object.entries(value)) {
                        rec[k] = this._check(item, level+1, maxLevel, map);
                    }
                    return rec;
                }
                break;
            case 'function':
                return {$ref: `#function: ${this._name(value)}`};
            case 'symbol':
                return {$ref: `#symbol: ${value.toString()}`};
        }
        return value;
    }

    check<E = unknown>(value: unknown, maxLevel?: number): E {
        if (typeof maxLevel !== "number" || maxLevel < 1 || maxLevel > 100) {
            maxLevel = 10;
        }
        return this._check(value, 0, maxLevel, new WeakMap<ObjectLike, number>()) as E;
    }
    stringify(value: unknown, maxLevel?: number): string {
        return JSON.stringify(this.check(value, maxLevel));
    }
    print(...params: Array<unknown>): void {
        console.log(...params.map(p => p ? util.inspect(this.check(p), {showHidden: false, depth: 10, colors: true}) : p));
    }

}