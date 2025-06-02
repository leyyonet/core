import {$assert, $descriptor, $dev, $is, $log, $name, KeyValue, Obj} from "@leyyo/common";
import {EnumItem, EnumNonFunctional, EnumValue, EnumPoolLike, EnumPoolSecure, EnumType} from "./index.types";
import {NamedDepotItem, NamedDepotLike, NamedDepotName, NamedDepotSecure} from "../named";
import {core} from "../core";
import {FQN_PCK} from "./internal";
import {$$coreInternalOn} from "../internal";
import {EnumSign} from "./index.symbols";

export class EnumPool implements EnumPoolLike, EnumPoolSecure {
    private readonly logger = $log.create(EnumPool);
    protected readonly _depot: NamedDepotLike<EnumItem, EnumValue>;
    protected readonly _secure: NamedDepotSecure<EnumItem, EnumValue>;

    constructor() {
        this._depot = core.namedPool.assign<EnumItem, EnumValue>(
            FQN_PCK, 'pool.items',
            ins => ins.pointer,
            ins => !!ins.pointer && Array.isArray(ins.items) && ['enumeration', 'literal'].includes(ins.type)
        );
        this._secure = this._depot.$secure;
    }

    // region private
    private _add(value: EnumItem, ...aliases: Array<string>): NamedDepotItem<EnumItem, EnumValue> {
        const [base, lookup] = this._secure.$add(value, ...aliases);
        this.logger.debug(`${lookup.full ?? lookup.basic} is registered`);

        const name = core.fqnHandler.exists(value.pointer) ? core.fqnHandler.get(value.pointer) : `#${base.id}`;
        $descriptor.save(value.pointer, EnumSign, name);

        if (value.type === 'enumeration') {
            $descriptor.save(value.items, EnumSign, name);
        }
        return base;
    }

    // endregion private

    // region public
    getBase(value: NamedDepotName, required?: boolean): NamedDepotItem<EnumItem, EnumValue> {
        return this._depot.get(value, required);
    }

    get(value: NamedDepotName, required?: boolean): EnumItem {
        return this.getBase(value, required)?.value;
    }

    enums(): Array<EnumItem> {
        return this._depot.bases.map(base => base.value);
    }

    itemsOf<E extends KeyValue = KeyValue>(value: NamedDepotName, required?: boolean): Array<E> {
        const item = this.getBase(value, required)?.value;
        return item ? item.items as Array<E> : [];
    }

    mapToArray<E>(enumeration: E): Array<EnumNonFunctional<E[keyof E]>> {
        return Object.keys(enumeration)
            .filter(key => isNaN(Number(key)))
            .map(key => enumeration[key])
            .filter(val => typeof val === "number" || typeof val === "string") as Array<EnumNonFunctional<E[keyof E]>>;
    }

    addEnumeration(name: string, target: Obj | Record<string, KeyValue>): void {
        $assert.text(name, () => $dev.opt({field: 'name', method: 'enumeration', where: 'leyyo.enum.EnumPool'}));
        $assert.object(target, () => $dev.opt({field: 'target', method: 'enumeration', where: 'leyyo.enum.EnumPool'}));
        this.logger.info('Add-enum: ' + name);
        this.$add(target);
    }

    addLiteral(name: string, target: unknown): void {
        $assert.text(name, () => $dev.opt({field: 'name', method: 'literal', where: 'leyyo.enum.EnumPool'}));
        $assert.array(target, () => $dev.opt({field: 'target', method: 'literal', where: 'leyyo.enum.EnumPool'}));
        this.logger.info('Add-literal: ' + name);
        this.$add(target);
    }

    hasSign(value: EnumValue): boolean {
        return $descriptor.has(value, EnumSign);
    }

    getSign(value: EnumValue): string {
        return $descriptor.getValue<string>(value, EnumSign);
    }

    // endregion public

    // region secure
    get $secure(): EnumPoolSecure {
        return this;
    }

    get $back(): EnumPoolLike {
        return this;
    }

    $add(target: EnumValue): void {
        const isMap = $is.bareObject(target);
        let items: Array<KeyValue>;
        let type: EnumType;
        if (isMap) {
            items = this.mapToArray(target);
            type = 'enumeration';

            // build up a relation between enum values and fn
            core.proxyHandler.set(target, items, this._secure.$proxyInheritedBy);
        } else {
            items = target as Array<KeyValue>;
            type = 'literal';
        }

        const value = {type, pointer: target, items};
        if (!core.fqnHandler.exists(target)) {
            core.fqnHandler.onReady(target, (name: string) => {
                const bases = this._secure.$bases
                    .filter(base => this._depot.equals(base, value, target, items));
                bases.forEach(base => {
                    $name.validate(name, true);
                    base.full = name;
                    this._secure.$clearAliases(base);
                    this._secure.$appendAliases(base);
                });
                if (isMap) {
                    // set fqn name
                    core.fqnHandler.copy(target, items);
                }
            });
        } else if (isMap) {

            // set fqn name
            core.fqnHandler.copy(target, items);
        }
        const base = this._add(value);
        if (isMap) {
            if (!base.pointers.includes(target)) {
                base.pointers.push(target);
            }
        }
    }

    // endregion secure


    // noinspection JSUnusedGlobalSymbols
    toJSON(): any {
        return {
            __: EnumPool.name,
            bases: this._secure.$bases,
        };
    }
}

$$coreInternalOn('class-pool-3', () => {
    core.$secure.$setEnumPool(new EnumPool());
});
$$coreInternalOn('class-instance', () => {
    core.fqnHandler.clazz(EnumPool, FQN_PCK);
});
