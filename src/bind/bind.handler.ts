import {$assert, $descriptor, $dev, ClassLike, Fnc, Func, Obj, SysFunction, SysFunctionItems} from "@leyyo/common";
import {core} from "../core";
import {BindHandlerLike, BindScopeType} from "./index.types";
import {FQN_PCK} from "./internal";
import {$$coreInternalOn} from "../internal";
import {BindSign} from "./index.symbols";

/** @inheritDoc */
export class BindHandler implements BindHandlerLike {
    /**
     * Validates is a correct method
     *
     * - Non-functions are excluded
     * - Constructors are excluded
     * - Symbol methods are excluded
     * - System functions are excluded
     * */
    protected _isValidMethod(target: Func | Obj | ClassLike, key: string, isInstance: boolean): boolean {
        if (key === (isInstance ? 'constructor' : 'prototype') || typeof key === 'symbol' || SysFunctionItems.includes(key as SysFunction)) {
            return false;
        }
        const desc = $descriptor.get(target, key);
        if (!desc) {
            return false;
        }
        return typeof desc.value === 'function' && typeof desc.get !== 'function';
    }

    /**
     * Binds a function and sign it as bound
     * */
    protected _bind(fn: Func, ins: Obj): Func {
        if ($descriptor.getValue<Obj>(fn, BindSign) === ins) {
            return fn;
        }
        $descriptor.save(fn, BindSign, true);
        return (fn as Function).bind(ins);
    }

    /** @inheritDoc */
    forInstances(target: Obj): number {
        let size = 0;
        const fn = target?.constructor?.prototype as Obj;
        if (fn) {
            Object.getOwnPropertyNames(fn).forEach(property => {
                if (this._isValidMethod(fn, property, true)) {
                    const old = fn[property].name;
                    fn[property] = this._bind(fn[property], target);
                    core.nameHandler.set(fn[property], old);
                    size++;
                }
            });
        }
        return size;
    }

    /** @inheritDoc */
    forStatics(fn: Func | ClassLike): number {
        let size = 0;
        if (fn) {
            Object.getOwnPropertyNames(fn).forEach(property => {
                if (this._isValidMethod(fn, property, false)) {
                    const old = fn[property].name;
                    fn[property] = this._bind(fn[property], fn);
                    core.nameHandler.set(fn[property], old);
                    size++;
                }
            });
        }
        return size;
    }

    /** @inheritDoc */
    forAll(target: Func | Obj | ClassLike): number {
        return this.forInstances(target) + this.forStatics(target as Func);
    }

    /** @inheritDoc */
    byScope(target: Func | Obj | ClassLike): number {
        let size = 0;
        if (!target || !['function', 'object'].includes(typeof target)) {
            return size;
        }
        if (typeof target === 'function') {
            return this.forStatics(target as Func);
        }
        return this.forInstances(target as Obj);
    }

    /** @inheritDoc */
    run(target: Func | Obj | ClassLike, type: BindScopeType): number {
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

    /** @inheritDoc */
    isBound(target: Func): boolean {
        $assert.func(target, () => $dev.opt({where: 'leyyo.bind.BindHandler', method: 'isBound'}));
        return $descriptor.has(target, BindSign);
    }
}

$$coreInternalOn('class-pool-2', () => {
    core.$secure.$setBindHandler(new BindHandler());
});
$$coreInternalOn('class-instance', () => {
    core.fqnHandler.clazz(BindHandler, FQN_PCK);
});
