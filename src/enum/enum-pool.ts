import {assertion, is, KeyValue, Obj} from "@leyyo/common";
import {EnumItem, EnumNonFunctional, EnumObject, EnumPoolLike, EnumPoolSecure, EnumType} from "./index-types";
import {AbstractCallback} from "../callback";
import {core} from "../core";

export class EnumPool extends AbstractCallback<EnumItem, EnumObject> implements EnumPoolLike, EnumPoolSecure {

    constructor() {
        super('enum', ins => ins.pointer, ins => !!ins.pointer && ['enumeration', 'literal'].includes(ins.type));
    }

    mapToArray<T>(enumeration: T): Array<EnumNonFunctional<T[keyof T]>> {
        return Object.keys(enumeration)
            .filter(key => isNaN(Number(key)))
            .map(key => enumeration[key])
            .filter(val => typeof val === "number" || typeof val === "string") as Array<EnumNonFunctional<T[keyof T]>>;
    }
    enumeration(name: string, target: Obj | Record<string, KeyValue>): void {
        assertion.text(name, {indicator: 'invalid.path', where: 'EnumPool'});
        assertion.object(target, {indicator: 'invalid.enum', where: 'EnumPool'});
        this.$add(target);
    }

    literal(name: string, target: unknown): void {
        assertion.text(name, {indicator: 'invalid.path', where: 'EnumPool'});
        assertion.array(target, {indicator: 'invalid.literal', where: 'EnumPool'});
        this.$add(target);
    }

    get $secure(): EnumPoolSecure {
        return this;
    }

    get $back(): EnumPoolLike {
        return this;
    }

    $add(target: EnumObject): void {
        const isMap = is.object(target);
        let items: Array<KeyValue>;
        let type: EnumType;
        if (isMap) {
            items = this.mapToArray(target);
            type = 'enumeration';

            // build up a relation between enum values and fn
            core.proxy.set(target, items, `${this._bucket}:to`);
        }
        else {
            items = target as Array<KeyValue>;
            type = 'literal';
        }

        const value = {type, pointer: target, items};
        if (!core.fqn.exists(target)) {
            core.fqn.onReady(target, (name: string) => {
                const bases = this._bases.filter(base => this.equals(base, value, target, items));
                bases.forEach(base => {
                    base.full = core.fqn.normalizeName(name);
                    this._clearAliases(base);
                    this._appendAliases(base);
                });
                if (isMap) {
                    // set fqn name
                    core.proxy.copyFqn(target, items);
                }
            });
        }
        else if (isMap) {

            // set fqn name
            core.proxy.copyFqn(target, items);
        }
        const base = this.add(value);
        if (isMap) {
            if (!base.pointers.includes(target)) {
                base.pointers.push(target);
            }
        }
    }
}