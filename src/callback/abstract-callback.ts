import {
    CallbackBase, CallbackBaseName, CallbackFinder,
    CallbackInfo, CallbackIs,
    CallbackLike,
    CallbackLookup,
    CallbackName, CallbackNameType,
    CallbackValue
} from "./index-type";
import {commonLog, is, DeveloperException, Logger} from "@leyyo/common";
import {core} from "../core";

/**
 * abstract callback class
 * */
export class AbstractCallback<V extends CallbackValue, W extends CallbackValue> implements CallbackLike<V, W> {
    protected readonly _bucket: string;
    protected readonly _pointer: CallbackFinder<V, W>;
    protected readonly _isValue: CallbackIs<V>;
    protected readonly _bases: Array<CallbackBase<V, W>>;
    protected readonly _aliases: Map<string, CallbackBaseName<V, W>>;
    protected readonly logger: Logger;

    /**
     * basic constructor
     * */
    constructor(bucket: string, pointer: CallbackFinder<V, W>, isValue?: CallbackIs<V>) {
        const assigned = core.callback.assign<V, W>(bucket, pointer);
        this._pointer = pointer;
        this._isValue = typeof isValue === 'function' ? isValue : () => true;
        this.logger = commonLog.create(this.constructor);
        this._bucket = assigned.bucket;
        this._bases = assigned.bases;
        this._aliases = assigned.aliases;
    }
    // endregion constructor

    // region private
    protected _toName(value: CallbackValue): string {
        switch (typeof value) {
            case "string":
                return value;
            case "function":
                return core.fqn.get(value);
            case "object":
                return core.fqn.get(this._pointer(value as V));
            default:
                return null;
        }
    }
    protected _func(value: V, throwable?: boolean): V {
        if (is.empty(value)) {
            if (!throwable) {
                return null;
            }
            throw new DeveloperException('callback-empty-value', { name: this._toName(value), bucket: this._bucket }).with(this);
        }
        if (!['function', 'object'].includes(typeof value)) {
            if (!throwable) {
                return null;
            }
            throw new DeveloperException('callback-invalid-value', { name: this._toName(value), value, bucket: this._bucket }).with(this);
        }
        return value;
    }

    protected _clearAliases(base: CallbackBase<V, W>, nameType?: CallbackNameType): void {
        if (nameType) {
            for (const [alias, otherBase] of this._aliases.entries()) {
                if (this.equals(base, ...otherBase.pointers) && this._aliases.has(alias) && this._aliases.get(alias).nameType === nameType) {
                    this._aliases.delete(alias);
                }
            }
        }
        else {
            for (const [alias, otherBase] of this._aliases.entries()) {
                if (this.equals(base, ...otherBase.pointers) && this._aliases.has(alias)) {
                    this._aliases.delete(alias);
                }
            }
        }
    }
    protected _appendAliases(base: CallbackBase<V, W>): void {
        this._appendAlias(base, base.basic, 'basic');
        if (base.full && base.full !== base.basic) {
            this._appendAlias(base, base.full, 'full');
        }
        base.aliases.forEach(alias => {
            this._appendAlias(base, alias, 'alias');
        });
    }
    equals(base: CallbackBase<V, W>, ...pointers: Array<CallbackValue>): boolean {
        return pointers.some(pointer => base.pointers.includes(pointer));
    }
    protected _getPointer(value: CallbackValue): W {
        try {
            return this._pointer(value as V);
        } catch (e) {
        }
        return null;
    }
    protected _findByValue(value: V): CallbackBase<V, W> {
        const pointer = this._getPointer(value);
        let bases = this._bases.filter(base => this.equals(base, value, pointer));
        if (bases.length > 0) {
            return bases[0];
        }
        const proxied = this.getProxy(value);
        if (proxied) {
            return proxied;
        }
        return this._findByName(this._toName(value));
    }
    protected _findByName(name: string): CallbackBase<V, W> {
        const naming = core.fqn.toFullName(name);
        if (!naming.basic) {
            return null;
        }
        if (this._aliases.has(naming.full)) {
            return this._aliases.get(naming.full);
        }
        if (this._aliases.has(naming.basic)) {
            return this._aliases.get(naming.basic);
        }
        return null;
    }
    protected _find(value: CallbackName): CallbackBase<V, W> {
        switch (typeof value) {
            case "string":
                return this._findByName(value);
            case "function":
            case "object":
                return this._findByValue(value as V);
            default:
                return null;
        }
    }
    protected _getLookup(value: CallbackName): CallbackLookup {
        if (is.empty(value)) {
            return null;
        }
        switch (typeof value) {
            case "string":
            case "function":
            case "object":
                const naming = core.fqn.toFullName(this._toName(value));
                return {value, ...naming, any: naming.full ?? naming.basic};
            default:
                return null;
        }
    }
    protected _appendAlias(base: CallbackBase<V, W>, name: string, nameType: CallbackNameType): void {
        if (this._aliases.has(name)) {
            this.logger.warn(`duplicated: [${name}] for ${nameType}`, { bucket: this._bucket, name, nameType });
        }
        else {
            this._aliases.set(name, {...base, nameType});
        }
    }
    // endregion private

    // region getter
    get bucket(): string {
        return this._bucket;
    }
    get bases(): Array<CallbackBase<V, W>> {
        return this._bases;
    }
    get info(): Array<CallbackInfo> {
        return this._bases.map(base => {
            return {
                type: typeof base.value,
                full: base.full,
                basic: base.basic,
                aliases: base.aliases,
            }
        })
    }
    get aliases(): Map<string, CallbackBaseName<V, W>> {
        return this._aliases;
    }
    get values(): Array<V> {
        return this._bases.map(base => base.value);
    }
    // endregion getter

    // region public
    addProxy(source: V|W, target: V|W, recursive?: boolean): void {
        const sourceBase = this.get(source);
        const targetBase = this.get(target);
        let sourcePointer: W;
        if (this._isValue(source as V)) {
            sourcePointer = this._getPointer(source);
        }
        else {
            sourcePointer = source as W;
        }
        let targetPointer: W;
        if (this._isValue(target as V)) {
            targetPointer = this._getPointer(target);
        }
        else {
            targetPointer = target as W;
        }

        if (recursive) {
            const sourceDesc = core.proxy.getAll(source);
            let parents = sourceDesc[`${this._bucket}:parents`] as Array<W>;
            if (!is.array(parents)) {
                parents = [];
            }
            if (!parents.includes(sourcePointer)) {
                parents.push(sourcePointer);
            }
            core.proxy.set(targetPointer, parents, `${this._bucket}:parents`);
        }
        else {
            core.proxy.set(targetPointer, [sourcePointer], `${this._bucket}:parents`);
        }
        core.proxy.set(sourcePointer, targetPointer, `${this._bucket}:to`);

        // remove old
        const oldPointers = [];
        if (sourceBase) {
            oldPointers.push(...sourceBase.pointers);

            this._clearAliases(sourceBase);
            this._bases.forEach((item, index) => {
                if (this.equals(item, ...sourceBase.pointers)) {
                    this._bases.splice(index, 1);
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
    appendPointer(value: CallbackName, pointer: W|CallbackValue): void {
        const base = this.get(value, true);
        if (!base.pointers.includes(pointer)) {
            base.pointers.push(pointer);
        }
    }
    getProxy(source: V|W): CallbackBase<V, W> {
        let sourcePointer: W;
        if (this._isValue(source as V)) {
            sourcePointer = this._getPointer(source);
        }
        else {
            sourcePointer = source as W;
        }
        const sourceProxy = core.proxy.get(sourcePointer, `${this._bucket}:to`);
        if (sourceProxy) {
            const bases = this._bases.filter(base => this.equals(base, source as V, sourceProxy));
            if (bases.length > 0) {
                return bases[0];
            }
        }
        return null;
    }
    add(value: V, ...aliases: Array<string>): CallbackBase<V, W> {
        value = this._func(value, true);
        const name = this._toName(value);
        const pointer = this._getPointer(value);
        if (this._bases.some(base => this.equals(base, value, pointer))) {
            throw new DeveloperException('callback-duplicated-value', { name, bucket: this._bucket }).with(this);
        }
        const fn = this._pointer(value);
        if (!core.fqn.exists(fn)) {
            core.fqn.onReady(fn, (name: string) => {
                const bases = this._bases.filter(base => this.equals(base, value, pointer));
                bases.forEach(base => {
                    base.full = core.fqn.normalizeName(name);
                    this._clearAliases(base);
                    this._appendAliases(base);
                });
            });
        }
        const lookup = this._getLookup(value);
        if (!lookup) {
            throw new DeveloperException('callback-invalid-value', { name, value, bucket: this._bucket }).with(this);
        }
        const basic = lookup.basic;
        const full = lookup.full ?? null;
        const base = { value, basic, full, aliases: [], pointers: [value, pointer] };
        if (is.array(aliases)) {
            aliases.forEach(alias => {
                alias = core.fqn.normalizeName(alias);
                if (alias) {
                    if (!base.aliases.includes(alias)) {
                        base.aliases.push(alias);
                    }
                }
            });
        }
        this._appendAliases(base);
        this._bases.push(base);
        this.logger.debug(`added`, { bucket: this._bucket, name: full ?? basic });
        return base;
    }
    remove(value: CallbackName): void {
        const base = this._find(value);
        const lookup = this._getLookup(value) ?? { any: null };
        if (!base) {
            throw new DeveloperException('callback-notFound-source', { name: lookup.any, bucket: this._bucket }).with(this);
        }
        this._clearAliases(base);
        this._bases.forEach((item, index) => {
            if (this.equals(item, ...base.pointers)) {
                this._bases.splice(index, 1);
            }
        });
        this.logger.info(`removed`, { name: lookup.any, bucket: this._bucket });
    }
    fetchValue(value: CallbackName, required?: boolean): V {
        return this.get(value, required)?.value;
    }

    fetchPointer(value: CallbackName, required?: boolean): W {
        const base = this.get(value, required);
        return base ? this._getPointer(base.value) : null;
    }

    get(value: CallbackName, required?: boolean): CallbackBase<V, W> {
        const base = this._find(value);
        if (base) {
            return base;
        }
        if (required) {
            const lookup = this._getLookup(value);
            throw new DeveloperException('callback-notFound', { name: lookup?.any, bucket: this._bucket }).with(this);
        }
        return null;
    }
    has(value: CallbackName): boolean {
        return !!this._find(value);
    }
    findByAlias(alias: string): CallbackBase<V, W> {
        const base = this._findByName(alias);
        if (base) {
            return base;
        }
        return null;
    }
    isAlias(name: string): boolean {
        const base = this._findByName(name);
        if (!base) {
            return false;
        }
        name = core.fqn.normalizeName(name);
        return name && ![base.basic, base.full].includes(name);
    }
    isSource(name: string): boolean {
        const base = this._findByName(name);
        if (!base) {
            return false;
        }
        name = core.fqn.normalizeName(name);
        return name && [base.basic, base.full].includes(name);
    }
}