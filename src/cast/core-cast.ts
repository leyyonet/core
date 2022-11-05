import {DeveloperException} from "../error";
import {
    CastAnyCommand,
    CastCheckResult,
    CastKeyofClassMap,
    CastKeyofCommand,
    CastKeyofLike,
    CastLambda,
    CastLike,
    CastOneClass,
    CastOneCommand,
    CastOption,
    CastSetLambda,
    CastStagingLike,
    CastTypeofClassMap,
    CastTypeofCommand,
    CastTypeofLike,
    CoreCastLike
} from "./types";
import {PointerLike} from "../pointer";
import {FuncLike, RecLike} from "../common";
import {$ly} from "../core";
import {ReflectDescribed, ReflectKeyword} from "../reflect";
import {DecoLike} from "../deco";
import {$devCast} from "./index.dev";
import {PointerInstance} from "../pointer/pointer-instance";

type V = CastLike;


/**
 * @core
 * */
export class CoreCast implements CoreCastLike {
    // region properties
    protected _stagingMap: Map<string, Array<CastStagingLike>>;
    protected LOG = $ly.preLog;
    private _pointer: PointerLike<V>;

    // endregion properties
    constructor() {
        $ly.addFqn(this);
        $ly.addTrigger('logger', () => {this.LOG = $ly.logger.assign(this)});
        $ly.addTrigger('repo', () => {
            this._stagingMap = $ly.repo.newMap<string, Array<CastStagingLike>>(this, '_stagingMap')
        });
        $ly.addTrigger('pointer', () => {
            this._pointer = new PointerInstance('cast', {alias: true, same: true}, (v) => this._checkInstance(v));
            $ly.pointer.registerNickname(this._appendNicknames);
        });
        $ly.addTrigger('binder', () => {$ly.binder.bindAll(this)});
        $ly.addTrigger('processor', () => {
            $ly.processor.add('beforeInjected', () => {
                // there should not be waiting casts
                if (this._stagingMap.size > 0) {
                    const records = {};
                    for (const [k, items] of this._stagingMap.entries()) {
                        if (items.length > 0) {
                            records[k] = [];
                            items.forEach(staging => {
                                records[k].push({
                                    clazz: $ly.fqn.get(staging.described.classFn),
                                    property: staging.described.property,
                                    index: staging.described.index,
                                    style: staging.style,
                                    typeOf: staging.typeOf,
                                    propValue: staging.propValue,
                                });
                            });
                        } else {
                            this._stagingMap.delete(k);
                        }
                    }
                    if (Object.keys(records).length > 0) {
                        throw new DeveloperException($devCast.staging_has, records);
                    }
                }
            }, 'cast-staging-control');
        });
    }
    static {
        $ly.addDependency('cast', () => new CoreCast());
    }
    // todo deco is necessity
    // todo nick-names
    $addFromDeco(deco: DecoLike, described: ReflectDescribed, keyword: ReflectKeyword): void {
        const clazz = described.classFn;
        if ($ly.cast.isClass(clazz) || $ly.generics.isPrimary(clazz)) {
            // todo
            return;
        }
        let instance: CastLike;
        if (keyword === 'static') {
            instance = clazz as unknown as CastLike;
        }
        else {
            instance = $ly.injector.$newInstance(clazz, deco.fn);
        }
        $ly.cast.add(clazz, instance);
        deco.assign(described, {keyword});
    }
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
    protected _processStaging(instance: V, name: string): void {
        if (this._stagingMap.has(name)) {
            this._stagingMap.get(name).forEach(staging => {
                $ly.cast.$setLambda({
                    described: staging.described,
                    style: staging.style,
                    typeOf: staging.typeOf,
                    propValue: staging.propValue,
                    fn: (v, o) => instance.cast(v, o),
                });
            });
            this._stagingMap.delete(name);
        }
    }
    add(clazz: FuncLike, instance: V): void {
        this._pointer.addPrimary(clazz, instance).forEach(n => this._processStaging(instance, n));
        this.LOG.debug('Cast added', {clazz: $ly.fqn.get(clazz)});
    }
    addAlias(alias: FuncLike, clazz: FuncLike): void {
        const instance = this._pointer.$getValue(clazz);
        if (!instance) {
            return;
        }
        this._pointer.addAlias(alias, clazz).forEach(n => this._processStaging(instance, n));
        this.LOG.debug('Cast alias added', {clazz: $ly.fqn.get(clazz), alias: $ly.fqn.get(alias)});
    }
    protected _appendNicknames(clazz: FuncLike, nicknames: Array<string>): void {
        const instance = this._pointer.$getValue(clazz);
        if (!instance) {
            return;
        }
        const appended = this._pointer.appendNicknames(clazz, nicknames);
        appended.forEach(n => this._processStaging(instance, n));
        this.LOG.debug('Cast nicknames', {clazz: $ly.fqn.get(clazz), nicknames: appended});
    }

    $getInstance(clazz: FuncLike): V {
        return this._pointer.$getValue(clazz);
    }
    listValues(): Array<V> {
        return this._pointer.listValues();
    }

    findInstance(identifier: V|FuncLike|string, throwable?: boolean): V {
        return this._pointer.findValue(identifier as FuncLike, throwable);
    }
    isInstance(instance: V): boolean {
        return this._pointer.isValue(instance);
    }

    findClass(identifier: V|FuncLike|string, throwable?: boolean): FuncLike {
        return this._pointer.findPrimary(identifier as FuncLike, throwable);
    }

    isAny(identifier: FuncLike | V | string): boolean {
        return this._pointer.isAny(identifier as FuncLike);
    }
    isAlias(alias: FuncLike): boolean {
        return this._pointer.isAlias(alias);
    }
    isClass(identifier: FuncLike | string): boolean {
        return this._pointer.isPrimary(identifier as FuncLike);
    }
    // endregion pointer

    // region private
    protected _checkInstance(instance: unknown): boolean {
        return (typeof (instance as V)?.cast === 'function');
    }
    // endregion private

    // region internal
    $stagingMap(): Map<string, Array<CastStagingLike>> {
        return this._stagingMap;
    }
    $one(described: ReflectDescribed, identifier: CastOneClass, opt?: CastOption): void {
        this.$refactor(described, {style: 'one', identifier}, opt);
        if (typeof identifier === 'string' && identifier.includes('<')) {
            $ly.generics.$fromCast({style: 'one', described, identifier,});
            return;
        }
        if ($ly.primitive.isArrayFilled(identifier)) {
            $ly.generics.$fromCast({style: 'one', described, identifier,});
            return;
        }
        if ($ly.primitive.isObject(identifier) && !this._checkInstance(identifier)) {
            $ly.generics.$fromCast({style: 'one', described, identifier,});
            return;
        }
        const instance = this._pointer.findValue(identifier as V, typeof identifier !== 'string');
        if (instance) {
            this.$setLambda({
                described,
                style: 'one',
                fn: (v, o) => instance.cast(v, o)
            })
        } else if (typeof identifier !== "string") {
            throw new Error('aaaa');
        } else {
            if (!this._stagingMap.has(identifier)) {
                this._stagingMap.set(identifier, []);
            }
            this._stagingMap.get(identifier).push({described, style: 'one',});
        }
    }
    $typeof(described: ReflectDescribed, classMap: CastTypeofClassMap, opt?: CastOption): void {
        const style = 'typeof';
        this.$refactor(described, {style, classMap}, opt);
        // todo validate
        for (const [k, identifier] of Object.entries(classMap)) {
            const typeOf = k as unknown as CastTypeofLike;
            if (typeof identifier === 'string' && identifier.includes('<')) {
                $ly.generics.$fromCast({style, described, identifier, typeOf});
                continue;
            }
            if ($ly.primitive.isArrayFilled(identifier)) {
                $ly.generics.$fromCast({style, described, identifier, typeOf});
                continue;
            }
            if ($ly.primitive.isObject(identifier) && !this._checkInstance(identifier)) {
                $ly.generics.$fromCast({style, described, identifier, typeOf});
                continue;
            }
            const instance = this._pointer.findValue(identifier as V, typeof identifier !== 'string');
            if (instance) {
                this.$setLambda({
                    described,
                    style,
                    typeOf,
                    fn: (v, o) => instance.cast(v, o)
                })
            } else if (typeof identifier !== "string") {
                throw new Error('aaaa');
            } else {
                if (!this._stagingMap.has(identifier)) {
                    this._stagingMap.set(identifier, []);
                }
                this._stagingMap.get(identifier).push({described, style: 'typeof', typeOf});
            }
        }
    }
    $keyof(described: ReflectDescribed, key: string, classMap: CastKeyofClassMap, opt?: CastOption): void {
        this.$refactor(described, {style: 'keyof', key, classMap}, opt);
        // todo validate
        for (const [k, identifier] of Object.entries(classMap)) {
            const propValue = k as unknown as CastKeyofLike;
            if (typeof identifier === 'string' && identifier.includes('<')) {
                $ly.generics.$fromCast({style: 'keyof', described, identifier, propValue});
                continue;
            }
            if ($ly.primitive.isArrayFilled(identifier)) {
                $ly.generics.$fromCast({style: 'keyof', described, identifier, propValue});
                continue;
            }
            if ($ly.primitive.isObject(identifier) && !this._checkInstance(identifier)) {
                $ly.generics.$fromCast({style: 'keyof', described, identifier, propValue});
                continue;
            }
            const instance = this._pointer.findValue(identifier as V, typeof identifier !== 'string');
            if (instance) {
                this.$setLambda({
                    described,
                    style: 'keyof',
                    propValue,
                    fn: (v, o) => instance.cast(v, o)
                })
            } else if (typeof identifier !== "string") {
                throw new Error('aaaa');
            } else {
                if (!this._stagingMap.has(identifier)) {
                    this._stagingMap.set(identifier, []);
                }
                this._stagingMap.get(identifier).push({described, style: 'keyof', propValue});
            }
        }
    }
    $checkInstance(instance: V, throwable?: boolean): CastCheckResult {
        if (!instance) {
            new DeveloperException($devCast.instance_invalid).with(this).raise(throwable);
            return undefined;
        }
        if (this._checkInstance(instance)) {
            return 'self';
        }
        const proto = (instance as unknown as FuncLike)?.prototype;
        if (proto && this._checkInstance(proto)) {
            return 'proto';
        }
        new DeveloperException($devCast.instance_invalid, {instance}).with(this).raise(throwable);
        return undefined;
    }
    $setLambda(setLambda: CastSetLambda): void {
        let descClass: RecLike;
        switch (setLambda.style) {
            case "one":
                let cdOne: CastOneCommand;
                switch (setLambda.described.target) {
                    case 'field':
                        descClass = $ly.symbol.get(setLambda.described.classFn, 'descClass', {});
                        cdOne = descClass[setLambda.described.property] as CastOneCommand;
                        cdOne.fn = setLambda.fn;
                        break;
                    case 'parameter':
                        descClass = $ly.symbol.get(setLambda.described.classFn, 'descClass-' + setLambda.described.property, {});
                        cdOne = descClass[setLambda.described.index] as CastOneCommand;
                        cdOne.fn = setLambda.fn;
                        break
                }
                break;
            case "typeof":
                let cdTypeof: CastTypeofCommand;
                switch (setLambda.described.target) {
                    case 'field':
                        descClass = $ly.symbol.get(setLambda.described.classFn, 'descClass', {});
                        cdTypeof = descClass[setLambda.described.property] as CastTypeofCommand;
                        cdTypeof.fnMap[setLambda.typeOf] = setLambda.fn;
                        break;
                    case 'parameter':
                        descClass = $ly.symbol.get(setLambda.described.classFn, 'descClass-' + setLambda.described.property, {});
                        cdTypeof = descClass[setLambda.described.index] as CastTypeofCommand;
                        cdTypeof.fnMap[setLambda.typeOf] = setLambda.fn;
                        break
                }
                break;
            case "keyof":
                let cdKeyof: CastKeyofCommand;
                switch (setLambda.described.target) {
                    case 'field':
                        descClass = $ly.symbol.get(setLambda.described.classFn, 'descClass', {});
                        cdKeyof = descClass[setLambda.described.property] as CastKeyofCommand;
                        cdKeyof.fnMap[setLambda.propValue] = setLambda.fn;
                        break;
                    case 'parameter':
                        descClass = $ly.symbol.get(setLambda.described.classFn, 'descClass-' + setLambda.described.property, {});
                        cdKeyof = descClass[setLambda.described.index] as CastKeyofCommand;
                        cdKeyof.fnMap[setLambda.propValue] = setLambda.fn;
                        break
                }
                break;
        }
    }
    $refactor(described: ReflectDescribed, command: CastAnyCommand, opt?: CastOption): void {
        switch (described.target) {
            case 'field':
                const descClass = $ly.symbol.get(described.classFn, 'descClass', {});
                descClass[described.property] = command;

                // todo instance?
                let def = undefined;
                const descriptor = Object.getOwnPropertyDescriptor(described.classFn, described.property);
                if (descriptor) {
                    def = descriptor.value;
                    delete described.classFn[described.property];
                }
                if (described.classFn[described.property] !== undefined) {
                    delete described.classFn[described.property];
                }
                let fn0: FuncLike;
                if ($ly.primitive.isObject(def)) {
                    fn0 = () => {
                        return {...def};
                    };
                }
                else if ($ly.primitive.isArray(def)) {
                    fn0 = () => {
                        return [...def];
                    };
                } else {
                    fn0 = () => def;
                }
                const get = function (): unknown {
                    const valueMap = $ly.symbol.get(this, 'cast', {});
                    return valueMap[described.property];
                };
                let fn2: CastLambda;
                switch (command.style) {
                    case "one":
                        const descOne = descClass[described.property] as CastOneCommand;
                        fn2 = (v, o) => {
                            if ($ly.not(v)) {
                                return v;
                            }
                            if (descOne.fn) {
                                return descOne.fn(v, o);
                            } else {
                                this.LOG.debug('Not defined setter', {
                                    target: described.description,
                                    fn: $ly.fqn.get(descOne.identifier),
                                });
                                return v;
                            }
                        };
                        break;
                    case "typeof":
                        const descTypeof = descClass[described.property] as CastTypeofCommand;
                        fn2 = (v, o) => {
                            if ($ly.not(v)) {
                                return v;
                            }
                            const t = typeof v;
                            // function is found
                            if (descTypeof.fnMap[t]) {
                                return descTypeof.fnMap[t](v, o);
                            }
                            // class is found but function is absent
                            else if (descTypeof.classMap[t]) {
                                // function is waiting todo
                                this.LOG.debug('Not defined setter', {
                                    target: described.description,
                                    fn: $ly.fqn.get(descTypeof.classMap[t]),
                                    typeOf: t,
                                });
                                return v;
                            }
                            // default function is found
                            else if (descTypeof.classMap['*']) {
                                // create short cut
                                descTypeof.classMap[t] = descTypeof.fnMap['*'];
                                return descTypeof.fnMap[t](v, o);
                            }
                            // default class is found but default function is absent
                            else if (descTypeof.classMap['*']) {
                                // default function is waiting todo
                                this.LOG.debug('Not defined setter', {
                                    target: described.description,
                                    fn: $ly.fqn.get(descTypeof.classMap[t]),
                                    typeOf: t,
                                    isElse: true,
                                });
                                return v;
                            }
                            throw new Error('Not allowed type'); // todo
                        };
                        break;
                    case "keyof":
                        const descKeyof = descClass[described.property] as CastKeyofCommand;
                        if (typeof descKeyof.key !== 'string') {
                            throw new DeveloperException($devCast.discriminator_key_invalid)
                                .patch({target: described.description, key: descKeyof.key})
                                .with(this);
                        }
                        fn2 = (v, o) => {
                            if ($ly.not(v)) {
                                return v;
                            }
                            if (typeof v !== 'object' || Array.isArray(v) || v instanceof Set) {
                                throw new Error('Not allowed type'); // todo
                            }
                            let keyValue;
                            if (v instanceof Map) {
                                keyValue = v.get(descKeyof.key);
                            } else {
                                keyValue = v[descKeyof.key];
                            }
                            if (!['string','boolean','number'].includes(typeof keyValue)) {
                                keyValue = undefined;
                            }

                            // function is found
                            if (keyValue && descKeyof.fnMap[keyValue]) {
                                return descKeyof.fnMap[keyValue](v, o);
                            }
                            // class is found but function is absent
                            else if (keyValue && descKeyof.classMap[keyValue]) {
                                // function is waiting todo
                                this.LOG.debug('Not defined setter', {
                                    target: described.description,
                                    fn: $ly.fqn.get(descKeyof.classMap[keyValue]),
                                    key: descKeyof.key,
                                    keyValue: keyValue,
                                });
                                return v;
                            }
                            // default function is found
                            else if (descKeyof.classMap['*']) {
                                if (keyValue) {
                                    // create short cut
                                    descKeyof.classMap[keyValue] = descKeyof.fnMap['*'];
                                    const keySize = Object.keys(descKeyof.classMap).length;
                                    if (keySize > 100) {
                                        this.LOG.warn('too much keys', {
                                            target: described.description,
                                            fn: $ly.fqn.get(descKeyof.classMap[keyValue]),
                                            key: descKeyof.key,
                                            keySize,
                                        });
                                    }
                                    return descKeyof.fnMap[keyValue](v, o);
                                } else {
                                    this.LOG.warn('Empty key value', {
                                        target: described.description,
                                        ccc: $ly.fqn.get(descKeyof.classMap[keyValue]),
                                        key: descKeyof.key,
                                    });
                                    return descKeyof.fnMap['*'](v, o);
                                }
                            }
                            // default class is found but default function is absent
                            else if (descKeyof.classMap['*']) {
                                // default function is waiting todo
                                this.LOG.debug('Not defined setter', {
                                    target: described.description,
                                    fn: $ly.fqn.get(descKeyof.classMap[keyValue]),
                                    key: descKeyof.key,
                                    isElse: true,
                                });
                                return v;
                            }
                            throw new Error('Not allowed property'); // todo
                        };
                        break;
                }
                const set = function (v: unknown): void {
                    const valueMap = $ly.symbol.get(this, 'cast', {});
                    try {
                        valueMap[described.property] = (v !== undefined) ? fn2(v, opt) : fn0();
                    } catch (e) {
                        $ly.error.build(e).field(described.property).raise();
                    }
                };
                Object.defineProperty(described.classFn, described.property, {
                    configurable: true,
                    enumerable: true,
                    get,
                    set
                });

                break;
            case 'parameter':
                // todo
                break
        }
    }
    // endregion internal

    // region custom
    run<T>(identifier: V | FuncLike | string, value: unknown, opt?: CastOption): T {
        return this._pointer.findValue(identifier as FuncLike, true)?.cast(value, opt) as T;
    }

    // endregion custom
}

// x_console.log(`## ${__filename}`, {i: 'loaded'});