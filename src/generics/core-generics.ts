// x_console.log(`## ${__filename}`, {i: 'loading'});
import {
    CoreGenericsLike,
    GenericsAnyIdentifier,
    GenericsLike,
    GenericsOption,
    GenericsStagingLike,
    GenericsTreeLike
} from "./types";
import {GenericsTree} from "./generics-tree";

import {DeveloperException} from "../error";
import {PointerLike} from "../pointer";
import {ArraySome, FuncLike, OneOrMore, RecLike} from "../common";
import {$ly} from "../core";
import {CastAnyIdentifier, CastCheckResult, CastOption, CastTransfer} from "../cast";
import {PointerInstance} from "../pointer/pointer-instance";

type V = GenericsLike;


/**
 * @core
 * */
export class CoreGenerics implements CoreGenericsLike {
    // region properties
    protected _map: Map<string, GenericsTreeLike>;
    protected _stagingMap: Map<string, Array<GenericsStagingLike>>;
    private _pointer: PointerLike<V>;
    protected LOG = $ly.preLog;

    // endregion properties
    constructor() {
        $ly.addFqn(this);
        $ly.addTrigger('logger', () => {this.LOG = $ly.logger.assign(this)});
        $ly.addTrigger('pointer', () => {
            this._pointer = new PointerInstance('generics', {alias: true, same: true}, (v) => this._checkClass(v));
            $ly.pointer.registerNickname(this._appendNicknames);
        });
        $ly.addTrigger('repo', () => {
            this._map = $ly.repo.newMap<string, GenericsTreeLike>(this, '_map');
            this._stagingMap = $ly.repo.newMap<string, Array<GenericsStagingLike>>(this, '_stagingMap');
        })
        $ly.addTrigger('binder', () => $ly.binder.bindAll(this));
        $ly.addTrigger('processor', () => {
            $ly.processor.add('beforeInjected', () => {
                // there should not be waiting casts
                if (this._stagingMap.size > 0) {
                    const records = {};
                    for (const [name, items] of this._stagingMap.entries()) {
                        if (items.length > 0) {
                            records[name] = [];
                            items.forEach(staging => {
                                records[name].push({
                                    target: staging.described.description,
                                    style: staging.style,
                                    typeOf: staging.typeOf,
                                    propValue: staging.propValue,
                                    tree: staging.tree,
                                });
                            });
                        } else {
                            this._stagingMap.delete(name);
                        }
                    }
                    if (Object.keys(records).length > 0) {
                        throw new DeveloperException('generics:has.staging', records);
                    }
                }
            }, 'generics-staging-control');
        });
    }
    static {
        $ly.addDependency('generics', () => new CoreGenerics());
    }
    // region private
    protected _checkClass(instance: unknown): boolean {
        if (typeof instance === 'function' || $ly.primitive.isObject(instance)) {
            return (typeof (instance as V).gen === 'function');
        }
        return false;
    }
    protected _toTree(identifier: GenericsAnyIdentifier, isChild = false): GenericsTreeLike {
        if ($ly.primitive.isObject(identifier) && identifier instanceof GenericsTree) {
            return identifier;
        }
        if (typeof identifier === 'string') {
            const str = this._pointer.normalizeName(identifier);
            if (str) {
                return this.parse(str);
            }
        } else if ($ly.primitive.isFunc(identifier) && this.$checkInstance(identifier as GenericsLike, isChild)) {
            return this.buildTree($ly.fqn.get(identifier));
        } else if ($ly.primitive.isArray(identifier)) {
            if (identifier[0]) {
                return this.buildTree('Array', identifier[0]);
            }
        } else if ($ly.primitive.isObject(identifier)) {
            if (this.$checkInstance(identifier as GenericsLike, isChild)) {
                return this.buildTree($ly.fqn.get(identifier));
            }
            // todo
            // return this.fromObject(given as RecLike);
        }
        throw new DeveloperException('generics:max.keys', {clazz: identifier}).with(this);
    }

    protected _stringify(tree: OneOrMore<GenericsTreeLike>): string {
        if (Array.isArray(tree)) {
            return tree.map(v => this._stringify(v)).join(',');
        }
        if (tree.children.length > 0) {
            return `${tree.base}<${this._stringify(tree.children)}>`;
        }
        return tree.base;
    }

    protected _array(tree: OneOrMore<GenericsTreeLike>): Array<unknown> {
        if (Array.isArray(tree)) {
            if (tree.length < 1) {
                return [];
            }
            return tree.map(v => this._array(v));
        }
        return [tree.base, ...this._array(tree.children)];
    }

    protected _fromObject(obj: RecLike): Array<GenericsTreeLike> {
        if (!$ly.primitive.isObjectFilled(obj)) {
            return [];
        }
        return Object.keys(obj).map(k => this.buildTree(k, ...this._fromObject(obj[k] as RecLike)));
    }

    protected _toObject(tree: OneOrMore<GenericsTreeLike>): RecLike {
        if (Array.isArray(tree)) {
            if (tree.length < 1) {
                return undefined;
            }
            const obj = {};
            tree.forEach(item => {
                obj[item.base] = this._toObject(item.children);
            });
            return obj;
        }
        return {[tree.base]: this._toObject(tree.children)};
    }

    protected _parse(values: string | ArraySome): OneOrMore<GenericsTreeLike> {
        if (typeof values === 'string') {
            return this.buildTree(values);
        }
        // if (values.length === 1) {
        //     return {lambda: values[0] as string, children: []};
        // }
        let index = -1;
        const arr: Array<GenericsTreeLike> = [];
        values.forEach(v => {
            if (Array.isArray(v)) {
                if (arr[index] === undefined) {
                    throw new Error('invalid index at ' + JSON.stringify(v));
                }
                arr[index].children = this._parse(v) as Array<GenericsTreeLike>;
            } else {
                index++;
                arr[index] = this.buildTree(v as string);
            }
        });
        return arr;
    }
    // endregion private

    // region pointer
    getNameMap(): Map<string, FuncLike> {
        return this._pointer.getNameMap();
    }
    getList(): Array<FuncLike> {
        return this._pointer.getPrimaryList();
    }
    getAliasList(): Array<FuncLike> {
        return this._pointer.getAliasList();
    }
    protected _processStaging(instance: V, name: string) {
        if (this._stagingMap.has(name)) {
            this._stagingMap.get(name).forEach(staging => {
                $ly.cast.$setLambda({
                    described: staging.described,
                    style: staging.style,
                    typeOf: staging.typeOf,
                    propValue: staging.propValue,
                    fn: (v, o) => instance.gen(staging.tree, v, o),
                });
            });
            this._stagingMap.delete(name);
        }
    }
    add(clazz: FuncLike, instance: V): void {
        this._pointer.addPrimary(clazz, instance).forEach(n => this._processStaging(instance, n));
        this.LOG.debug('Generics added', {clazz: $ly.fqn.get(clazz)});
    }
    addAlias(alias: FuncLike, clazz: FuncLike): void {
        const instance = this._pointer.$getValue(clazz);
        if (!instance) {
            return;
        }
        this._pointer.addAlias(alias, clazz).forEach(n => this._processStaging(instance, n));
        this.LOG.debug('Alias added', {clazz: $ly.fqn.get(clazz), alias: $ly.fqn.get(alias)});
    }
    protected _appendNicknames(clazz: FuncLike, nicknames: Array<string>): void {
        if (!this._pointer.isPrimary(clazz)) {
            return;
        }
        const instance = this._pointer.$getValue(clazz);
        if (!instance) {
            return;
        }
        const appended = this._pointer.appendNicknames(clazz, nicknames);
        appended.forEach(n => this._processStaging(instance, n));
        this.LOG.debug('Generics nicknames', {clazz: $ly.fqn.get(clazz), nicknames: appended});
    }

    getInstance(clazz: FuncLike): V {
        return this._pointer.$getValue(clazz);
    }
    listValues(): Array<V> {
        return this._pointer.listValues();
    }

    findInstance(identifier: V|FuncLike|string, throwable?: boolean): V {
        return this._pointer.findValue(identifier as FuncLike, throwable);
    }

    findClass(identifier: V|FuncLike|string, throwable?: boolean): FuncLike {
        return this._pointer.findPrimary(identifier as FuncLike, throwable);
    }

    isAny(identifier: FuncLike | V | string): boolean {
        return this._pointer.isAny(identifier as FuncLike);
    }
    isAlias(identifier: FuncLike | string): boolean {
        return this._pointer.isAlias(identifier as FuncLike);
    }
    isPrimary(identifier: FuncLike | string): boolean {
        return this._pointer.isPrimary(identifier as FuncLike);
    }
    isValue(instance: V): boolean {
        return this._pointer.isValue(instance);
    }

    // endregion pointer


    // region internal
    $stagingMap(): Map<string, Array<GenericsStagingLike>> {
        return this._stagingMap;
    }
    $checkInstance(instance: V, isChild?: boolean, throwable?: boolean): CastCheckResult {
        if (!instance) {
            new DeveloperException('generics:invalid.target.class').with(this).raise(throwable);
            return undefined;
        }
        if (this._checkClass(instance)) {
            return 'self';
        }
        const proto = (instance as unknown as FuncLike)?.prototype;
        if (proto && this._checkClass(proto)) {
            return 'proto';
        }
        if (isChild) {
            return $ly.cast.$checkInstance(instance, throwable);
        }
        new DeveloperException('generics:invalid.target.class', {instance}).with(this).raise(throwable);
        return undefined;
    }
    $fromCast(transfer: CastTransfer): void {
        const tree = this.toTree(transfer.identifier);
        if (!tree) {
            throw new DeveloperException('generics:invalid.identifier', {
                identifier: transfer.identifier,
                target: transfer.described.description,
                style: transfer.style,
                typeOf: transfer.typeOf,
                propValue: transfer.propValue,
            }).with(this);
        }
        const instance = this._pointer.findValue(tree.base, false);
        if (instance) {
            $ly.cast.$setLambda({
                described: transfer.described,
                style: transfer.style,
                typeOf: transfer.typeOf,
                propValue: transfer.propValue,
                fn: (v, o) => instance.gen(tree, v, o),
            });
        } else {
            if (!this._stagingMap.has(tree.base)) {
                this._stagingMap.set(tree.base, []);
            }
            this._stagingMap.get(tree.base).push({
                described: transfer.described,
                style: transfer.style,
                typeOf: transfer.typeOf,
                propValue: transfer.propValue,
                tree,
            });
        }

    }
    // endregion internal

    // region custom
    run<T>(identifier: GenericsAnyIdentifier, value: unknown, opt?: GenericsOption): T {
        const tree = this.toTree(identifier);
        if (!tree.base) {
            throw new DeveloperException('generics:invalid.tree', {identifier}).with(this);
        }
        if (tree.children.length < 1) {
            return $ly.cast.findInstance(tree.base, true).cast(value, opt as CastOption) as T;
        }
        const rec = this._pointer.findValue(tree.base, true);
        if ($ly.primitive.isInteger(rec.genMin) && rec.genMin > tree.children.length) {
            throw new DeveloperException('generics:min.keys', {clazz: tree.base, actual: tree.children.length, expected: rec.genMin}).with(this);
        }
        if ($ly.primitive.isInteger(rec.genMax) && rec.genMax < tree.children.length) {
            throw new DeveloperException('generics:max.keys', {clazz: tree.base, actual: tree.children.length, expected: rec.genMax}).with(this);
        }
        return rec.gen(tree, value, opt) as T;
    }
    buildTree(parent: string, ...children: Array<GenericsAnyIdentifier>): GenericsTreeLike {
        return new GenericsTree(parent, ...(children as Array<GenericsAnyIdentifier>));
    }

    toTree(given: OneOrMore<CastAnyIdentifier>|GenericsTreeLike): GenericsTreeLike {
        return this._toTree(given as GenericsAnyIdentifier, false);
    }
    $toTreeAsChild(given: OneOrMore<CastAnyIdentifier>|GenericsTreeLike): GenericsTreeLike {
        return this._toTree(given as GenericsAnyIdentifier, true);
    }

    parse(given: unknown): GenericsTreeLike {
        const text = $ly.primitive.text(given);
        if (!text) {
            return new GenericsTree();
        }
        if (!this._map.has(text)) {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const slf = this;
            let i = 0;

            function main() {
                const arr = [];
                let collected = '';
                while (i < text.length) {
                    const chr = text[i];
                    i++;
                    switch (chr) {
                        case ' ':
                            break;
                        case ',':
                            if (collected !== '') {
                                arr.push(slf._pointer.normalizeName(collected));
                                collected = '';
                            }
                            break;
                        case "<":
                            if (collected !== '') {
                                arr.push(slf._pointer.normalizeName(collected));
                                collected = '';
                            }
                            arr.push(main());
                            break;
                        case ">":
                            if (collected !== '') {
                                arr.push(slf._pointer.normalizeName(collected));
                                collected = '';
                            }
                            return arr;
                        default:
                            collected += chr;
                            break;
                    }
                }
                if (collected !== '') {
                    arr.push(slf._pointer.normalizeName(collected));
                }
                return arr;
            }

            this._map.set(text, this._parse(main() as ArraySome) as GenericsTreeLike);
        }
        const tree: GenericsTreeLike = this._map.get(text);
        return Array.isArray(tree) ? tree[0] : tree;
    }

    stringify(tree: GenericsTreeLike): string {
        return this._stringify(tree);
    }

    fromArray(arr: ArraySome): GenericsTreeLike {
        if (!Array.isArray(arr) || arr.length < 1) {
            return undefined;
        }
        const tree = this.buildTree(arr.shift());
        if (arr.length < 1) {
            return tree;
        }
        arr.forEach(v => {
            tree.children.push(this.fromArray(v));
        });
        return tree;
    }

    toArray(tree: GenericsTreeLike): ArraySome {
        return this._array(tree);
    }

    fromObject(obj: RecLike): GenericsTreeLike {
        const tree = this._fromObject(obj);
        return Array.isArray(tree) ? tree[0] : tree;
    }

    toObject(tree: GenericsTreeLike): RecLike {
        return this._toObject(tree);
    }
    // endregion custom
}
