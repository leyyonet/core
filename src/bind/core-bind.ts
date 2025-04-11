import {ClassLike, Fnc, Func, Obj, SysFunction, SysFunctionItems} from "@leyyo/common";
import {core} from "../core";
import {CoreBindLike, CoreBindType} from "./index-type";

export class CoreBind implements CoreBindLike {

    protected _isValidMethod(target: Func|Obj|ClassLike, key: string, isInstance: boolean): boolean {
        if (key === (isInstance ? 'constructor' : 'prototype') || typeof key === 'symbol' || SysFunctionItems.includes(key as SysFunction)) {
            return false;
        }
        let desc: PropertyDescriptor;
        try {
            desc = Object.getOwnPropertyDescriptor(target, key) ?? null;
        } catch (e) {
            console.log(`CoreSystem.propertyDescriptor`, e.message);
            return false;
        }

        if (!desc) {
            return false;
        }
        return typeof desc.value === 'function' && typeof desc.get !== 'function';
    }
    forInstances(target: Obj): number {
        let size = 0;
        const fn = target?.constructor?.prototype as Obj;
        if (fn) {
            Object.getOwnPropertyNames(fn).forEach(property => {
                if (this._isValidMethod(fn, property, true)) {
                    const old = fn[property].name;
                    fn[property] = fn[property].bind(target);
                    core.proxy.basicName(fn[property], old);
                    size++;
                }
            });
        }
        return size;
    }
    forStatics(fn: Func|ClassLike): number {
        let size = 0;
        if (fn) {
            Object.getOwnPropertyNames(fn).forEach(property => {
                if (this._isValidMethod(fn, property, false)) {
                    const old = fn[property].name;
                    fn[property] = fn[property].bind(fn);
                    core.proxy.basicName(fn[property], old);
                    size++;
                }
            });
        }
        return size;
    }
    forAll(target: Func|Obj|ClassLike): number {
        return this.forInstances(target) + this.forStatics(target as Func);
    }

    byScope(target: Func|Obj|ClassLike): number {
        let size = 0;
        if (!target || !['function', 'object'].includes(typeof target)) {
            return size;
        }
        if (typeof target === 'function') {
            return this.forStatics(target as Func);
        }
        return this.forInstances(target as Obj);
    }
    run(target: Func|Obj|ClassLike, type: CoreBindType): number {
        switch (type) {
            case "static":
                return this.forStatics(target as Fnc);
            case "instance":
                return this.forInstances(target);
            case "all":
                return this.forAll(target);
            default:
                return this.byScope(target);
        }
    }
}