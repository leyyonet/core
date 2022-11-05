// x_console.log(`## ${__filename}`, {i: 'loading'});

import {PointerFind, PointerLike, PointerOption, PointerSource, PointerValue, PointerValueLambda} from "./types";
import {FuncLike, ObjectLike} from "../common";
import {$ly} from "../core";
import {DeveloperException} from "../error";
import {$devPointer} from "./index.dev";

/**
 * @instance
 * */
export class PointerInstance<V extends PointerValue> implements PointerLike<V> {
    // region properties
    protected static _BOOLEAN_FIELDS = ['alias', 'same'];
    protected LOG = $ly.preLog;
    private _option: PointerOption;
    private _bucket: string;
    private _lambda: PointerValueLambda<V>;
    private _nameMap: Map<string, FuncLike>;
    private _primaryList: Array<FuncLike>;
    private _aliasList: Array<FuncLike>;

    // endregion properties

    // region constructor
    constructor(bucket: string, option: PointerOption, lambda: PointerValueLambda<V>) {
        option = option ?? {};
        PointerInstance._BOOLEAN_FIELDS.forEach(k => {option[k] = !!option[k]});
        $ly.addTrigger('error', () => {
            bucket = $ly.primitive.check(this, 'bucket', bucket, $ly.primitive.textFilled);
            if ($ly.pointer.getBucketMap().has(bucket)) {
                throw new DeveloperException($devPointer.bucket_duplicated, {bucket}).with(this);
            }
            this._bucket = bucket;
            this._option = option;
            this._lambda = lambda;
        });
        $ly.addTrigger('repo', () => {
            this._nameMap = $ly.repo.newMap<string, FuncLike>(this, '_nameMap');
            this._primaryList = $ly.repo.newArray<FuncLike>(this, '_primaryList');
            this._aliasList = $ly.repo.newArray<FuncLike>(this, '_aliasList');
        });
        $ly.addTrigger('logger', () => {
            this.LOG = $ly.logger.assign(this)
            this.LOG.debug('Bucket created', {bucket});
        });
        $ly.addTrigger('binder', () => $ly.binder.bindAll(this));
        $ly.addTrigger('pointer', () => $ly.pointer.getBucketMap().set(this._bucket, this));
    }
    static {
        $ly.addFqn(this);
    }
    // endregion constructor

    // region private
    protected get _primarySymbol(): string {
        return `pointer.${this._bucket}.primary`;
    }
    protected get _aliasSymbol(): string {
        return `pointer.${this._bucket}.alias`;
    }
    protected get _valueSymbol(): string {
        return `pointer.${this._bucket}.value`;
    }
    protected _normalizePart(name: string): string {
        if (!name.includes('_')) {
            name = name.replace(/[A-Z\d]/g, letter => `_${letter.toLowerCase()}`);
        }
        if (name.includes('_')) {
            name = name.replace(/(_\w)/g, k => k[1].toUpperCase());
        }
        return name[0].toUpperCase() + name.substring(1);
    }
    protected _excludeName(name: string, names: Array<string>, excludes: Array<string>): void {
        const normalized = this.normalizeName(name);
        if (!normalized || names.includes(normalized) || excludes.includes(normalized)) {
            return;
        }
        names.push(normalized);
    }
    protected _getPrimaryFromName(name: string): FuncLike {
        const names = this.getNames(name);
        for (const item of names) {
            if (this._nameMap.has(item)) {
                return this._nameMap.get(item);
            }
        }
        return undefined;
    }
    protected _getNames(primary: FuncLike): Array<string> {
        const names = [];
        for (const [name, fn] of this._nameMap.entries()) {
            if (primary === fn) {
                names.push(name);
            }
        }
        return names;
    }
    protected _appendNames(fn: FuncLike, nicknames: Array<string>): Array<string>;
    protected _appendNames(fn: FuncLike, isFirst: 'primary'): Array<string>;
    protected _appendNames(fn: FuncLike, isAlias: FuncLike): Array<string>;
    protected _appendNames(fn: FuncLike, val: Array<string> | 'primary' | FuncLike): Array<string> {
        // it is first registration
        let givenNames = [] as Array<string>;
        let primary: FuncLike;
        let alias: FuncLike;
        if (val === 'primary') {
            primary = fn;
            givenNames = this.getNames(primary);
        } else if (typeof val === 'function') {
            alias = fn;
            primary = val;
            givenNames = this.getNames(alias);
        } else if ($ly.primitive.isArrayFilled(val)) {
            primary = fn;
            (val as Array<string>).forEach(n => givenNames.push(...this.getNames(n)));
        }
        const previousNames = this._getNames(primary);
        const addedNames = [] as Array<string>;
        givenNames.forEach(n => this._excludeName(n, addedNames, previousNames));
        addedNames.forEach(name => {
            if (this._nameMap.has(name)) {
                const err = new DeveloperException($devPointer.name_duplicated)
                    .with(this)
                    .patch({bucket:this._bucket, name, primary: $ly.fqn.get(primary), other: $ly.fqn.get(this._nameMap.get(name))});
                err.raise(!name.includes('.'));
            } else {
                this._nameMap.set(name, primary);
            }
        });
        return addedNames;
    }
    protected _checkFn(fn: FuncLike, source: PointerSource) {
        if (source === 'primary') {
            if ($ly.not(fn) || typeof fn !== 'function') {
                throw new DeveloperException($devPointer.primary_invalid)
                    .with(this).patch({bucket: this._bucket, [source]: fn, typeOf: typeof fn});
            }
        } else {
            if ($ly.not(fn) || typeof fn !== 'function') {
                throw new DeveloperException($devPointer.alias_invalid)
                    .with(this).patch({bucket: this._bucket, [source]: fn, typeOf: typeof fn});
            }
        }
    }
    protected _findResult<T>(found: unknown, throwable?: boolean, identifier?: string): PointerFind<T> {
        return {value: $ly.symbol.findReferenced(found) as T, throwable, identifier};
    }
    protected _findValue(identifier: V | FuncLike | string, throwable: boolean): PointerFind<V> {
        let info: string;
        if (typeof identifier === 'function') {
            // case: identifier is primary
            let primary = identifier as FuncLike;
            // find: value of primary
            let value = $ly.symbol.get(primary, this._primarySymbol);
            // primary has value
            if (value) {
                return this._findResult<V>(value);
            }
            // case: identifier is value
            value = identifier as V;
            if (this._option.same) { // value can be function
                // validate: value
                if ($ly.symbol.exist(value, this._valueSymbol)) {
                    return this._findResult<V>(value);
                }
            }
            // alias supported
            if (this._option.alias) {
                const alias = identifier as FuncLike;
                // find: primary of alias
                primary = $ly.symbol.get(alias, this._aliasSymbol);
                // alias has primary
                if (primary) {
                    // find: value of primary
                    value = $ly.symbol.get(primary, this._primarySymbol);
                    // primary has value
                    if (value) {
                        return this._findResult<V>(value);
                    }
                }
            }
            info = $ly.fqn.get(identifier);
        } else if ($ly.primitive.isObject(identifier)) {
            // case: identifier is value
            const value = identifier as V;
            // validate: value
            if ($ly.symbol.exist(value, this._valueSymbol)) {
                return this._findResult<V>(value);
            }
            info = $ly.fqn.get(identifier);
        } else if (typeof identifier === 'string') {
            // case: identifier is name
            const name = identifier;
            // find: primary of name
            const primary = this._getPrimaryFromName(name);
            // name has primary
            if (primary) {
                // find: value of primary
                const value = $ly.symbol.get(primary, this._primarySymbol);
                // primary has value
                if (value) {
                    return this._findResult<V>(value);
                }
            }
            info = name;
        }
        // case: not found value
        if (info === undefined) {
            info = $ly.fqn.get(identifier);
        }
        return this._findResult<V>(undefined, throwable, info);
    }
    protected _findPrimary(identifier: V | FuncLike | string, throwable: boolean): PointerFind<FuncLike> {
        let info: string;
        if (typeof identifier === 'function') {
            // case: identifier is primary
            const primary = identifier as FuncLike;
            // validate: primary
            if ($ly.symbol.exist(primary, this._primarySymbol)) {
                return this._findResult<FuncLike>(primary);
            }
            // value can be function
            if (this._option.same) {
                // case: identifier is value
                const value = identifier as V;
                // find: primary of value
                const primary = $ly.symbol.get(value, this._valueSymbol);
                // value has primary
                if (primary) {
                    return this._findResult<FuncLike>(primary);
                }
            }
            // alias supported
            if (this._option.alias) {
                // case: identifier is alias
                const alias = identifier as FuncLike;
                // find: primary of alias
                const primary = $ly.symbol.get(alias, this._aliasSymbol);
                // alias has primary
                if (primary) {
                    return this._findResult<FuncLike>(primary);
                }
            }
            info = $ly.fqn.get(identifier);
        } else if ($ly.primitive.isObject(identifier)) {
            // case: identifier is value
            const value = identifier as V;
            // find: primary of value
            const primary = $ly.symbol.get(value, this._valueSymbol);
            // value has primary
            if (primary) {
                return this._findResult<FuncLike>(primary);
            }
            info = $ly.fqn.get(value);
        } else if (typeof identifier === 'string') {
            // case: identifier is name
            const name = identifier;
            // find: primary of name
            const primary = this._getPrimaryFromName(name);
            // name has primary
            if (primary) {
                return this._findResult<FuncLike>(primary);
            }
            info = name;
        }
        // case: not found primary
        if (info === undefined) {
            info = $ly.fqn.get(identifier);
        }
        return this._findResult<FuncLike>(undefined, throwable, info);
    }
    protected _findAlias(identifier: FuncLike, throwable: boolean): PointerFind<FuncLike> {
        let info: string;
        if (typeof identifier === 'function') {
            // case: identifier is alias
            const alias = identifier as FuncLike;
            // validate: alias
            if ($ly.symbol.exist(alias, this._aliasSymbol)) {
                return this._findResult<FuncLike>(alias);
            }
            info = $ly.fqn.get(alias);
        }
        if (info === undefined) {
            info = $ly.fqn.get(identifier);
        }
        return this._findResult<FuncLike>(undefined, throwable, info);
    }
    // endregion private

    // region public
    get option(): PointerOption {
        return this._option;
    }
    get bucket(): string {
        return this._bucket;
    }
    getNameMap(): Map<string, FuncLike> {
        return this._nameMap;
    }
    getPrimaryList(): Array<FuncLike> {
        return this._primaryList;
    }
    getAliasList(): Array<FuncLike> {
        return this._aliasList;
    }

    getNames(identifier: FuncLike|ObjectLike|string): Array<string> {
        const names = [];
        if (!identifier) {
            return names;
        }
        const name = (typeof identifier === 'string') ? identifier : $ly.fqn.get(identifier);
        if (!name) {
            return names;
        }
        let normalized = this.normalizeName(name);
        if (!normalized) {
            return names;
        }
        names.push(normalized);
        if (!name.includes('.')) {
            return names;
        }
        normalized = this.normalizeName(name.split('.').pop());
        if (!normalized) {
            return names;
        }
        names.push(normalized);
        return names;
    }
    normalizeName(name: string): string {
        if (typeof name !== 'string') {
            return undefined;
        }
        if (!name.includes('.')) {
            return this._normalizePart(name);
        }
        return name.split('.').map(item => this._normalizePart(item)).join('.');
    }
    addPrimary(primary: FuncLike, value: V): Array<string> {
        if ($ly.not(value)) {
            value = primary as V;
        }
        primary = $ly.symbol.findReferenced(primary) as FuncLike;
        this._checkFn(primary, 'primary');
        // validate value
        if (!this._lambda(value)) {
            throw new DeveloperException($devPointer.value_invalid)
                .with(this).patch({bucket:this._bucket, primary: $ly.fqn.get(primary)});
        }
        // value is already pointed by another primary
        if ($ly.symbol.exist(value, this._valueSymbol)) {
            throw new DeveloperException($devPointer.value_duplicated)
                .with(this).patch({bucket:this._bucket, primary: $ly.fqn.get(primary)});
        }
        // primary already points another value
        if ($ly.symbol.exist(primary, this._primarySymbol)) {
            throw new DeveloperException($devPointer.primary_duplicated)
                .with(this).patch({bucket:this._bucket, primary: $ly.fqn.get(primary)});
        }
        // primary is already as an alias
        if (this._option.alias && $ly.symbol.exist(primary, this._aliasSymbol)) {
            throw new DeveloperException($devPointer.primary_is_alias)
                .with(this).patch({bucket:this._bucket, primary: $ly.fqn.get(primary)});
        }
        $ly.symbol.set(value, this._valueSymbol, primary);
        $ly.symbol.set(primary, this._primarySymbol, value);
        this._primaryList.push(primary);
        return this._appendNames(primary, 'primary');
    }
    addAlias(alias: FuncLike, primary: FuncLike): Array<string> {
        if (!this._option.alias) {
            throw new DeveloperException($devPointer.alias_not_supported)
                .with(this)
                .patch({bucket: this._bucket, alias: $ly.fqn.get(alias), primary: $ly.fqn.get(primary)});
        }
        alias = $ly.symbol.findReferenced(alias) as FuncLike;
        this._checkFn(alias, 'alias');

        primary = $ly.symbol.findReferenced(primary) as FuncLike;
        this._checkFn(primary, 'primary');

        // alias and primary are same function
        if (primary === alias) {
            throw new DeveloperException($devPointer.alias_is_primary)
                .with(this)
                .patch({bucket: this._bucket, alias: $ly.fqn.get(alias)});
        }
        // alias is already pointed by another primary
        if ($ly.symbol.exist(alias, this._aliasSymbol)) {
            throw new DeveloperException($devPointer.alias_duplicated)
                .with(this)
                .patch({bucket: this._bucket, alias: $ly.fqn.get(alias)});
        }
        // alias is already as a primary
        if ($ly.symbol.exist(alias, this._primarySymbol)) {
            throw new DeveloperException($devPointer.alias_is_primary)
                .with(this)
                .patch({bucket: this._bucket, alias: $ly.fqn.get(alias)});
        }
        // primary is already as an alias
        if ($ly.symbol.exist(primary, this._aliasSymbol)) {
            throw new DeveloperException($devPointer.primary_is_alias)
                .with(this)
                .patch({bucket: this._bucket, primary: $ly.fqn.get(primary)})
                ;
        }
        // primary is not marked as primary
        if (!$ly.symbol.exist(primary, this._primarySymbol)) {
            throw new DeveloperException($devPointer.primary_not_primary)
                .with(this)
                .patch({bucket: this._bucket, primary: $ly.fqn.get(primary)})
                ;
        }

        $ly.symbol.set(alias, this._aliasSymbol, primary);
        this._aliasList.push(alias);
        return this._appendNames(alias, primary);
    }
    appendNicknames(primary: FuncLike, nicknames: Array<string>): Array<string> {
        return this._appendNames(primary, nicknames);
    }

    $getValue(primary: FuncLike): V {
        return $ly.symbol.findReferenced($ly.symbol.get(primary, this._primarySymbol)) as V;
    }
    listValues(): Array<V> {
        return this._primaryList.map(primary => $ly.symbol.findReferenced($ly.symbol.get(primary, this._primarySymbol)) as V);
    }
    findValue(identifier: V | FuncLike | string, throwable?: boolean): V {
        const result = this._findValue(identifier, throwable);
        if (result.value) {
            return result.value;
        }
        if (!result.throwable) {
            return undefined;
        }
        throw new DeveloperException($devPointer.value_absent)
            .with(this).patch({bucket:this._bucket, identifier: result.identifier});
    }
    findPrimary(identifier: V | FuncLike | string, throwable?: boolean): FuncLike {
        const result = this._findPrimary(identifier, throwable);
        if (result.value) {
            return result.value;
        }
        if (!result.throwable) {
            return undefined;
        }
        throw new DeveloperException($devPointer.primary_absent)
            .with(this).patch({bucket:this._bucket, identifier: result.identifier});
    }
    findAlias(alias: FuncLike, throwable?: boolean): FuncLike {
        if (!this._option.alias) {
            throw new DeveloperException($devPointer.alias_not_supported)
                .with(this).patch({bucket:this._bucket});
        }
        const result = this._findAlias(alias, throwable);
        if (result.value) {
            return result.value;
        }
        if (!result.throwable) {
            return undefined;
        }
        throw new DeveloperException($devPointer.alias_absent)
            .with(this).patch({bucket:this._bucket, identifier: result.identifier});
    }
    isAny(identifier: FuncLike | V | string): boolean {
        return !!this.findValue(identifier, false);
    }
    isAlias(alias: FuncLike): boolean {
        return (this._option.alias && typeof alias === 'function' && $ly.symbol.exist(alias as FuncLike, this._aliasSymbol));
    }
    isPrimary(primary: FuncLike | string): boolean {
        if (typeof primary === 'function' && $ly.symbol.exist(primary, this._primarySymbol)) {
            return true;
        }
        else if (typeof primary === 'string' && this._getPrimaryFromName(primary)) {
            return true;
        }
        return false;
    }
    isValue(value: V): boolean {
        if (typeof value === 'function' && this._option.same) {
            return $ly.symbol.exist(value, this._valueSymbol) && this._lambda(value);
        } else if ($ly.primitive.isObject(value)) {
            return $ly.symbol.exist(value, this._valueSymbol) && this._lambda(value);
        }
        return false;
    }
    // endregion public
}
