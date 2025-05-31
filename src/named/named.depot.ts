import {$descriptor, $dev, $is, $log, $repo, List, Logger} from "@leyyo/common";
import {
    NamedDepotAliasItem,
    NamedDepotEqualsLambda,
    NamedDepotFinderLambda,
    NamedDepotInfo,
    NamedDepotItem,
    NamedDepotLike,
    NamedDepotLookup,
    NamedDepotName,
    NamedDepotNameType,
    NamedDepotSecure,
    NamedDepotValue,
    NamedPoolNewDoc
} from "./index.types";
import {core} from "../core";
import {$$coreInternalOn} from "../internal";
import {FQN_PCK} from "./internal";

/**
 * {@inheritDoc}
 * */
export class NamedDepot<V extends NamedDepotValue, P extends NamedDepotValue> implements NamedDepotLike<V, P>, NamedDepotSecure<V, P> {
    // region properties
    private static _id: number = 0;
    readonly bucket: string;
    readonly $proxyInherits: symbol;
    readonly $proxyInheritedBy: symbol;
    readonly $pointerFinderLambda: NamedDepotFinderLambda<V, P>;
    readonly $isLambda: NamedDepotEqualsLambda<V>;
    readonly $bases: List<NamedDepotItem<V, P>>;
    readonly $aliases: Map<string, NamedDepotAliasItem<V, P>>;
    readonly logger: Logger;
    // endregion properties

    // region constructor
    /**
     * basic constructor
     * */
    constructor(doc: NamedPoolNewDoc<V, P>) {
        this.bucket = doc.bucket;
        this.$pointerFinderLambda = doc.pointerFinderLambda;
        this.$isLambda = typeof doc.equalsLambda === 'function' ? doc.equalsLambda : _v => true;
        this.logger = $log.create(this.constructor);
        this.$bases = $repo.newList(doc.pack, doc.name, 'base');
        this.$aliases = $repo.newMap(doc.pack, doc.name, 'aliases');
        this.$proxyInherits = $descriptor.sym(doc.pack, doc.name, 'inherits');
        this.$proxyInheritedBy = $descriptor.sym(doc.pack, doc.name, 'inheritedBy');
    }

    // endregion constructor

    // region getter

    get bases(): Array<NamedDepotItem<V, P>> {
        return [...this.$bases];
    }

    get info(): Array<NamedDepotInfo> {
        return this.$bases.map(base => {
            return {
                type: typeof base.value,
                full: base.full,
                basic: base.basic,
                aliases: base.aliases,
            }
        })
    }

    get aliases(): Map<string, NamedDepotAliasItem<V, P>> {
        return this.$aliases;
    }

    get values(): Array<V> {
        return this.$bases.map(base => base.value);
    }

    // endregion getter

    // region mutable
    add(value: V, ...aliases: Array<string>): NamedDepotItem<V, P> {
        const [base, lookup] = this.$add(value, ...aliases);
        this.logger.debug(`${this.bucket} - ${lookup.full ?? lookup.basic} is added`);
        return base;
    }

    remove(value: NamedDepotName, raiseIfAbsent?: boolean): boolean {
        const [result, lookup] = this.$remove(value, raiseIfAbsent);
        if (result) {
            this.logger.info(`${this.bucket} - ${lookup.any} is removed`);
        } else {
            this.logger.info(`${this.bucket} - ${lookup.any} is ignored for remove`);
        }
        return result;
    }

    // endregion mutable

    // region immutable
    addProxy(source: V | P, target: V | P, recursive?: boolean): void {
        const sourceBase = this.get(source);
        const targetBase = this.get(target);
        let sourcePointer: P;
        if (this.$isLambda(source as V)) {
            sourcePointer = this.$getPointer(source);
        } else {
            sourcePointer = source as P;
        }
        let targetPointer: P;
        if (this.$isLambda(target as V)) {
            targetPointer = this.$getPointer(target);
        } else {
            targetPointer = target as P;
        }

        if (recursive) {
            const proxyMap = core.proxyHandler.getAll(source);
            let parents = proxyMap.get(this.$proxyInherits) as Array<P>;
            if (!Array.isArray(parents)) {
                parents = [];
            }
            if (!parents.includes(sourcePointer)) {
                parents.push(sourcePointer);
            }
            core.proxyHandler.set(targetPointer, parents, this.$proxyInherits);
        } else {
            core.proxyHandler.set(targetPointer, [sourcePointer], this.$proxyInherits);
        }
        core.proxyHandler.set(sourcePointer, targetPointer, this.$proxyInheritedBy);

        // remove old
        const oldPointers = [];
        if (sourceBase) {
            oldPointers.push(...sourceBase.pointers);

            this.$clearAliases(sourceBase);
            this.$bases.forEach((item, index) => {
                if (this.equals(item, ...sourceBase.pointers)) {
                    this.$bases.splice(index, 1);
                }
            });
        }

        // add old pointers to new
        if (targetBase) {
            oldPointers.push(sourcePointer);
            oldPointers.forEach(p => {
                if (!targetBase.pointers.includes(p)) {
                    targetBase.pointers.push(p);
                }
            })
        }
    }

    appendPointer(value: NamedDepotName, pointer: P | NamedDepotValue): void {
        const base = this.get(value, true);
        if (!base.pointers.includes(pointer)) {
            base.pointers.push(pointer);
        }
    }

    getProxy(source: V | P): NamedDepotItem<V, P> {
        let sourcePointer: P;
        if (this.$isLambda(source as V)) {
            sourcePointer = this.$getPointer(source);
        } else {
            sourcePointer = source as P;
        }
        const sourceProxy = core.proxyHandler.get(sourcePointer, this.$proxyInheritedBy, true);
        if (sourceProxy) {
            const bases = this.$bases.filter(base => this.equals(base, source as V, sourceProxy));
            if (bases.length > 0) {
                return bases[0];
            }
        }
        return undefined;
    }

    fetchValue(value: NamedDepotName, required?: boolean): V {
        return this.get(value, required)?.value;
    }

    fetchPointer(value: NamedDepotName, required?: boolean): P {
        const base = this.get(value, required);
        return base ? this.$getPointer(base.value) : undefined;
    }

    get(value: NamedDepotName, required?: boolean): NamedDepotItem<V, P> {
        const base = this.$find(value);
        if (base) {
            return base;
        }
        if (required) {
            const lookup = this.$getLookup(value);
            throw $dev.developerError({
                issue: 'not.found',
                where: 'leyyo.named.NamedDepot',
                method: 'get',
                name: lookup?.any
            });
        }
        return undefined;
    }

    has(value: NamedDepotName): boolean {
        return !!this.$find(value);
    }

    findByAlias(alias: string): NamedDepotItem<V, P> {
        const base = this.$findByName(alias);
        if (base) {
            return base;
        }
        return undefined;
    }

    isAlias(name: string): boolean {
        const base = this.$findByName(name);
        if (!base) {
            return false;
        }
        name = core.fqnHandler.normalizeName(name);
        return name && ![base.basic, base.full].includes(name);
    }

    isSource(name: string): boolean {
        const base = this.$findByName(name);
        if (!base) {
            return false;
        }
        name = core.fqnHandler.normalizeName(name);
        return name && [base.basic, base.full].includes(name);
    }

    equals(base: NamedDepotItem<V, P>, ...pointers: Array<NamedDepotValue>): boolean {
        return pointers.some(pointer => base.pointers.includes(pointer));
    }

    // endregion immutable

    // region secure
    $toName(value: NamedDepotValue): string {
        switch (typeof value) {
            case "string":
                return value;
            case "function":
                return core.fqnHandler.get(value);
            case "object":
                return core.fqnHandler.get(this.$pointerFinderLambda(value as V));
            default:
                return undefined;
        }
    }

    $func(value: V, throwable?: boolean): V {
        if ($is.empty(value)) {
            if (!throwable) {
                return undefined;
            }
            throw $dev.developerError({
                issue: 'empty',
                field: 'value',
                where: 'leyyo.named.NamedDepot',
                method: 'func',
                value: this.$toName(value)
            });
        }
        if (!$is.typeOf(value, 'function', 'object')) {
            if (!throwable) {
                return undefined;
            }
            throw $dev.developerError({
                issue: 'invalid',
                field: 'value',
                where: 'leyyo.named.NamedDepot',
                method: 'func',
                type: typeof value,
                value: this.$toName(value)
            });
        }
        return value;
    }

    $clearAll(): void {
        this.$bases.clear();
        this.$aliases.clear();
    }
    $clearAliases(base: NamedDepotItem<V, P>, nameType?: NamedDepotNameType): void {
        if (nameType) {
            for (const [alias, otherBase] of this.$aliases.entries()) {
                if (this.equals(base, ...otherBase.pointers) && this.$aliases.has(alias) && this.$aliases.get(alias).nameType === nameType) {
                    this.$aliases.delete(alias);
                }
            }
        } else {
            for (const [alias, otherBase] of this.$aliases.entries()) {
                if (this.equals(base, ...otherBase.pointers) && this.$aliases.has(alias)) {
                    this.$aliases.delete(alias);
                }
            }
        }
    }

    $appendAliases(base: NamedDepotItem<V, P>): void {
        this.$appendAlias(base, base.basic, 'basic');
        if (base.full && base.full !== base.basic) {
            this.$appendAlias(base, base.full, 'full');
        }
        base.aliases.forEach(alias => {
            this.$appendAlias(base, alias, 'alias');
        });
    }

    $getPointer(value: NamedDepotValue): P {
        try {
            return this.$pointerFinderLambda(value as V);
        } catch (e) {
        }
        return undefined;
    }

    $findByValue(value: V): NamedDepotItem<V, P> {
        const pointer = this.$getPointer(value);
        let bases = this.$bases.filter(base => this.equals(base, value, pointer));
        if (bases.length > 0) {
            return bases[0];
        }
        const proxied = this.getProxy(value);
        if (proxied) {
            return proxied;
        }
        return this.$findByName(this.$toName(value));
    }

    $findByName(name: string): NamedDepotItem<V, P> {
        const naming = core.fqnHandler.toNaming(name);
        if (!naming.basic) {
            return undefined;
        }
        if (this.$aliases.has(naming.full)) {
            return this.$aliases.get(naming.full);
        }
        if (naming.basic !== naming.full && this.$aliases.has(naming.basic)) {
            return this.$aliases.get(naming.basic);
        }
        return undefined;
    }

    $find(value: NamedDepotName): NamedDepotItem<V, P> {
        switch (typeof value) {
            case "string":
                return this.$findByName(value);
            case "function":
            case "object":
                return this.$findByValue(value as V);
            default:
                return undefined;
        }
    }

    $getLookup(value: NamedDepotName): NamedDepotLookup {
        if ($is.empty(value)) {
            return undefined;
        }
        switch (typeof value) {
            case "string":
            case "function":
            case "object":
                const naming = core.fqnHandler.toNaming(this.$toName(value));
                return {value, ...naming, any: naming.full};
            default:
                return undefined;
        }
    }

    $appendAlias(base: NamedDepotItem<V, P>, name: string, nameType: NamedDepotNameType): void {
        if (this.$aliases.has(name)) {
            this.logger.warn(`${this.bucket} - ${name} is duplicated for ${nameType}`);
        } else {
            this.$aliases.set(name, {...base, nameType});
        }
    }

    get $back(): NamedDepotLike<V, P> {
        return this;
    }

    get $secure(): NamedDepotSecure<V, P> {
        return this;
    }

    $add(value: V, ...aliases: Array<string>): [NamedDepotItem<V, P>, NamedDepotLookup] {
        NamedDepot._id++;
        value = this.$func(value, true);
        const name = this.$toName(value);
        const pointer = this.$getPointer(value);
        if (this.$bases.some(base => this.equals(base, value, pointer))) {
            throw $dev.developerError({
                issue: 'duplicated',
                field: 'value',
                where: 'leyyo.named.NamedDepot',
                method: 'add',
                name
            });
        }
        const fn = this.$pointerFinderLambda(value);
        if (!core.fqnHandler.exists(fn)) {
            core.fqnHandler.onReady(fn, (name: string) => {
                const bases = this.$bases.filter(base => this.equals(base, value, pointer));
                bases.forEach(base => {
                    base.full = core.fqnHandler.normalizeName(name);
                    this.$clearAliases(base);
                    this.$appendAliases(base);
                });
            });
        }
        const lookup = this.$getLookup(value);
        if (!lookup) {
            throw $dev.developerError({
                issue: 'invalid.type',
                field: 'lookup',
                where: 'leyyo.named.NamedDepot',
                method: 'add',
                name
            });
        }
        const basic = lookup.basic;
        const full = lookup.full;
        const base = {value, basic, full, aliases: [], pointers: [value, pointer], id: NamedDepot._id};
        if (Array.isArray(aliases)) {
            aliases.forEach(alias => {
                alias = core.fqnHandler.normalizeName(alias);
                if (alias) {
                    if (!base.aliases.includes(alias)) {
                        base.aliases.push(alias);
                    }
                }
            });
        }
        this.$appendAliases(base);
        this.$bases.push(base);
        return [base, lookup];
    }

    $remove(value: NamedDepotName, raiseIfAbsent?: boolean): [boolean, NamedDepotLookup] {
        const base = this.$find(value);
        const lookup = this.$getLookup(value) ?? {any: undefined} as NamedDepotLookup;
        if (!base) {
            if (raiseIfAbsent) {
                throw $dev.developerError({
                    issue: 'not.found',
                    where: 'leyyo.named.NamedDepot',
                    method: 'remove',
                    name: lookup.any
                });
            }
            this.logger.info(`${this.bucket} - ${lookup.any} is ignored for remove`);
            return [false, lookup];
        }
        this.$clearAliases(base);
        this.$bases.forEach((item, index) => {
            if (this.equals(item, ...base.pointers)) {
                this.$bases.splice(index, 1);
            }
        });
        return [true, lookup];
    }

    // endregion secure

}

$$coreInternalOn('class-instance', () => {
    core.fqnHandler.clazz(NamedDepot, FQN_PCK);
});
