import {$assert, $descriptor, $dev, $log, AsyncFnc, ClassLike, Dict, Func, Obj} from "@leyyo/common";
import {
    InjectionBase,
    InjectionFetchClassLambda,
    InjectionInstance,
    InjectionOptionalState,
    InjectionParamItem,
    InjectionPoolLike,
    InjectionPoolSecure
} from "./index.types";
import {DecoInstanceLike, DecoLike} from "../../decorator";
import {core} from "../../core";
import {
    AsyncProvider,
    AsyncProviderOpt,
    Inject,
    InjectOpt,
    Loader,
    Optional,
    PostConstruct,
    PostConstructOpt,
    Provider,
    ProviderOpt
} from "../decorators";
import {ClassReflectionLike} from "../../reflection";
import {NamedDepotLike, NamedDepotSecure} from "../../named";
import {FQN_PCK} from "../internal";
import {$$coreInternalOn} from "../../internal";

export class InjectionPool implements InjectionPoolLike, InjectionPoolSecure {
    private readonly _DEEP = 3;
    private readonly _SYS_CLASSES = [Number, String, Boolean, BigInt, Array, Object, Map, Set] as Array<ClassLike>;
    protected readonly _depot: NamedDepotLike<InjectionInstance, ClassLike>;
    protected readonly _secure: NamedDepotSecure<InjectionInstance, ClassLike>;
    private readonly logger = $log.create(InjectionPool);

    constructor() {
        this._depot = core.namedPool.assign<InjectionInstance, ClassLike>(
            FQN_PCK, 'pool.items',
            ins => ins.provider,
            ins => typeof ins.provider === 'function'
        );
        this._secure = this._depot.$secure;
    }

    // region private
    protected _fetchConstructor(base: InjectionBase): void {
        const injectList = [Inject, Optional] as Array<Func>;
        const refMethod = base.value.decoIns.asClass.getInstanceProperty('constructor');
        refMethod.listParameters().forEach((paramRef, index) => {
            if (paramRef.isVariadic) {
                throw $dev.developerError({
                    issue: 'variadic.is.not.supported',
                    desc: base.value.decoIns.description,
                    index
                });
            }

            const paramItem = {logs: []} as InjectionParamItem;
            if (paramRef.hasDefault) {
                paramItem.optional = true;
                paramItem.logs.push('optional by parameter');
            }
            paramItem.ref = paramRef;

            // find param decorator
            const foundInjects = paramRef.decorators().filter(deco => injectList.includes(deco.fn));
            let foundInject: DecoLike;
            if (foundInjects.length > 0) {
                if (foundInjects.length > 1) {
                    foundInjects
                        .map(item => item.name)
                        .forEach(name => paramItem.logs.push('Duplicated: ' + name));
                }
                foundInject = foundInjects[0];
                if (foundInjects.filter(item => item.fn === Optional).length) {
                    paramItem.logs.push('optional by decorator');
                }
            }

            // read identifier from param decorator
            if (foundInject) {
                const doc = paramRef.getDocByDeco<InjectOpt>(foundInject);
                if (doc) {
                    paramItem.identifier = doc.value.identifier;
                }
            }

            // identifier is used
            if (paramItem.identifier) {
                const found = this._depot.findByAlias(paramItem.identifier);
                if (found) {
                    paramItem.foundType = found.value.provider;
                    paramItem.instance = found.value.data;
                    paramItem.logs.push('found with identifier');
                } else {
                    base.value.nameCallbacks.push(paramItem.identifier);
                }
            }
            // if identifier is used, type should not be used
            else if (paramRef.type) {
                if (this._SYS_CLASSES.includes(paramRef.type as ClassLike)) {
                    if (!paramItem.optional) {
                        throw $dev.developerError({
                            issue: 'system.type.is.used',
                            desc: base.value.decoIns.description,
                            index
                        });
                    }
                    paramItem.ignored = true; // send undefined
                    paramItem.logs.push('ignored for system type');
                }
                const found = this._findByProvider(paramRef.type as ClassLike);
                if (found) {
                    paramItem.foundType = found.value.provider;
                    paramItem.instance = found.value.data;
                    paramItem.logs.push('found with parameter type');
                } else {
                    base.value.typeCallbacks.push(paramRef.type as ClassLike);
                }
            } else {
                throw $dev.invalidError({
                    issue: 'type.could.not.be.found',
                    desc: base.value.decoIns.description,
                    index
                });
            }
            base.value.parameters.push(paramItem);
        });
    }

    protected _create<T>(provider: ClassLike, decoIns: DecoInstanceLike, callback: InjectionFetchClassLambda<T>, value: T): InjectionBase {
        const rec = {
            provider, decoIns,
            identifiers: [],
            parameters: [],
            nameCallbacks: [],
            typeCallbacks: [],
        } as InjectionInstance;
        const [, lookup] = this._secure.$add(rec);
        this.logger.debug(`${lookup.basic} is queued`);

        const base = this._findByProvider(provider);
        callback(base, value);
        this._fetchConstructor(base);
        return base;
    }

    protected _findByProvider(clazz: ClassLike): InjectionBase {
        const list = this._secure.$bases
            .filter(base => base.value.provider === clazz);
        return list.length > 0 ? list[0] : undefined;
    }

    protected _discoverProvidersByDeco<T>(decoFn: Func, callback: InjectionFetchClassLambda<T>): void {
        const id = core.decoratorPool.getIdentifier(decoFn);
        id.assignedClasses().forEach(clazz => {
            clazz.listDocsByDeco<T>(id).forEach(doc => {
                const classRef = doc.ins.asClass;
                const base = this._findByProvider(classRef.creator);
                if (base) {
                    console.warn('duplicated provider: ' + classRef.name);
                    callback(base, doc.value);
                } else {
                    this._create(classRef.creator, doc.ins, callback, doc.value);
                }
            });
        });
    }

    protected async _discoverLazy(): Promise<void> {
        const id = core.decoratorPool.getIdentifier(PostConstruct);
        for (const prop of id.assignedProperties()) {
            const docs = prop.listDocsByDeco<PostConstructOpt>(id);
            if (docs.length === 0) {
                throw $dev.invalidError({
                    issue: 'decorator.info.not.found',
                    property: prop.description,
                    deco: PostConstruct.name
                });
            }
            if (docs.length > 1) {
                $dev.log({issue: 'multiple.decorator.used', desc: docs[0].ins.description}, 'warn');
            }
            const doc = docs[0];
            let memberName: string;
            let requiredType: ClassLike;
            let parentRef: ClassReflectionLike;
            let isAsync: boolean;
            let isMethod: boolean;
            const identifier = doc.value.identifier;
            if (doc.ins.isMethod) {
                isMethod = true;
                const methodRef = doc.ins.asMethod;
                parentRef = methodRef.clazz;
                memberName = methodRef.name;
                if (methodRef.listParameters().length !== 1) {
                    throw $dev.developerError({
                        issue: 'member.must.have.only.one.parameter',
                        desc: doc.ins.description,
                        clazz: parentRef.name,
                        paramSize: methodRef.listParameters().length
                    });
                }
                if (typeof methodRef.callable !== 'function') {
                    throw $dev.invalidError({
                        issue: 'invalid.method.body',
                        desc: doc.ins.description,
                        clazz: parentRef.name
                    });
                }
                isAsync = core.footprint.isAsync(methodRef.callable);
                const paramRef = methodRef.getParameter(0);
                requiredType = paramRef.type as ClassLike;
            } else {
                const fieldRef = doc.ins.asField;
                parentRef = fieldRef.clazz;
                memberName = fieldRef.name;
                requiredType = fieldRef.type as ClassLike;
                const descriptor = $descriptor.get(parentRef.creator.prototype, memberName);
                if (!descriptor) {
                    $dev.log({issue: 'member.could.not.be.found', desc: doc.ins.description}, 'warn');
                }
            }
            const found = this._findByProvider(parentRef.creator);
            if (!found) {
                throw $dev.invalidError({
                    issue: 'class.is.not.provider',
                    desc: doc.ins.description,
                    clazz: parentRef.name
                });
            }
            if (!found.value.data) {
                throw $dev.developerError({
                    issue: 'class.does.not.have.an.instance',
                    desc: doc.ins.description,
                    clazz: parentRef.name
                });
            }
            const selfInstance = found.value.data;
            let dependency: Obj;
            const member = selfInstance[memberName];


            // find dependency
            if (identifier) {
                const found = this._depot.findByAlias(identifier);
                if (found) {
                    dependency = found.value.data;
                } else {
                    throw $dev.invalidError({
                        issue: 'type.could.not.be.found',
                        desc: doc.ins.description,
                        expectedIdentifier: identifier
                    });
                }
            }
            // if identifier is used, type should not be used
            else if (requiredType) {
                if (this._SYS_CLASSES.includes(requiredType)) {
                    throw $dev.developerError({
                        issue: 'system.type.is.used',
                        desc: doc.ins.description,
                        clazz: requiredType.name
                    });
                }
                const found = this._findByProvider(requiredType);
                if (found) {
                    dependency = found.value.data;
                } else {
                    throw $dev.invalidError({
                        issue: 'type.could.not.be.found',
                        desc: doc.ins.description,
                        expectedType: requiredType.name
                    });
                }
            } else {
                throw $dev.invalidError({issue: 'type.could.not.be.found', desc: doc.ins.description});
            }


            if (typeof member === 'function') {
                if (!isMethod) {
                    $dev.log({issue: 'member.is.not.expected.as.method', desc: doc.ins.description}, 'warn');
                }
                const methodFn = member as Function;
                if (methodFn.length !== 1) {
                    throw $dev.developerError({
                        issue: 'member.must.have.only.one.parameter',
                        desc: doc.ins.description,
                        clazz: parentRef.name,
                        paramSize: methodFn.length
                    });
                }
                if (core.footprint.isAsync(methodFn)) {
                    if (!isAsync) {
                        $dev.log({issue: 'method.is.not.expected.as.async', desc: doc.ins.description}, 'warn');
                    }
                    try {
                        await methodFn(dependency);
                    } catch (e) {
                        throw $dev.nativeError(e, {
                            issue: 'instance.could.not.be.set',
                            desc: doc.ins.description, scope: 'method/async'
                        });
                    }
                } else {
                    try {
                        methodFn(dependency);
                    } catch (e) {
                        throw $dev.nativeError(e, {
                            issue: 'instance.could.not.be.set',
                            desc: doc.ins.description, scope: 'method/sync'
                        });
                    }
                }
            } else {
                if (isMethod) {
                    $dev.log({issue: 'member.is.not.expected.as.field', desc: doc.ins.description}, 'warn');
                }
                try {
                    selfInstance[memberName] = dependency;
                } catch (e) {
                    throw $dev.nativeError(e, {
                        issue: 'instance.could.not.be.set',
                        desc: doc.ins.description, scope: 'field'
                    });
                }
            }

        }
    }

    protected _appendIdentifier(base: InjectionBase, identifier: string) {
        if (identifier && !base.value.identifiers.includes(identifier)) {
            this._secure.$appendAlias(base, identifier, 'custom');
            base.value.identifiers.push(identifier);
        }
    }

    protected _discoverProviders(): void {
        // load providers
        this._discoverProvidersByDeco<ProviderOpt>(Provider, (base, value) => {
            this._appendIdentifier(base, value.identifier);
        });
        this._discoverProvidersByDeco<Dict>(Loader, () => {

        });
        this._discoverProvidersByDeco<AsyncProviderOpt>(AsyncProvider, (base, value) => {
            base.value.isAsync = true;
            if (value.tag === 'bulk') {
                base.value.isBulk = true;
            }
            this._appendIdentifier(base, value.identifier);
            if (value.member && base.value.member !== value.member) {
                base.value.member = value.member;
            }
        });
    }

    protected async _runLoadMember(base: InjectionBase): Promise<void> {
        const loadFn = base.value.data[base.value.member] as AsyncFnc;
        await loadFn();
    }

    protected async _createAnInstance(base: InjectionBase, tree: Array<InjectionBase>, optionalState: InjectionOptionalState): Promise<number> {
        if (tree.includes(base)) {
            return 0;
        }
        tree.push(base);

        if (base.value.data) {
            return 0;
        }
        const classFn = base.value.provider;
        if (base.value.parameters.length > 0) {
            try {
                base.value.data = new classFn();
            } catch (e) {
                throw $dev.nativeError(e, {
                    issue: 'instance.could.not.be.created',
                    desc: base.value.decoIns.description
                });
            }
        } else {
            const args = [];
            let optionalIndexes = [] as Array<number>;
            base.value.parameters.forEach((item, ix) => {
                if (item.instance) {
                    args.push(item.instance);
                } else if (item.ignored) {
                    args.push(undefined);
                } else if (item.optional && optionalState === 'ignore-then-undefined') {
                    args.push(undefined);
                    optionalIndexes.push(ix);
                } else {
                    const another = this._findByProvider(item.foundType);
                    if (another) {
                        item.instance = another.value.data;
                        args.push(item.instance);
                    } else {
                        return 0;
                    }
                }
            });
            try {
                base.value.data = new classFn(...args);
            } catch (e) {
                throw $dev.nativeError(e, {
                    issue: 'instance.could.not.be.created',
                    desc: base.value.decoIns.description
                });
            }
            if (optionalIndexes.length > 0) {
                optionalIndexes.forEach(ix => {
                    const item = base.value.parameters[ix];
                    if (!item.logs.includes('optional-set')) {
                        item.logs.push('optional-set');
                    }
                });
            }
        }
        let size = 1; // self created
        if (base.value.member) {
            try {
                await this._runLoadMember(base);
            } catch (e) {
                throw $dev.nativeError(e, {issue: 'async.method.failed', desc: base.value.decoIns.description});
            }
        }
        size += await this._triggerAfterCreation(base, tree, optionalState);
        return size;
    }

    protected async _triggerAfterCreation(base: InjectionBase, tree: Array<InjectionBase>, optionalState: InjectionOptionalState): Promise<number> {
        let size = 0;
        for (const alias of base.aliases) {
            const list = this._secure.$bases
                .filter(another => (
                    another !== base &&
                    !another.value.data &&
                    !tree.includes(another) &&
                    another.value.nameCallbacks.includes(alias)));
            if (list.length > 0) {
                for (const another of list) {
                    size += await this._createAnInstance(another, tree, optionalState);
                }
            }
        }
        const typeList = this._secure.$bases
            .filter(another => (
                another !== base &&
                !another.value.data &&
                !tree.includes(another) &&
                another.value.typeCallbacks.includes(base.value.provider)));
        if (typeList.length > 0) {
            for (const another of typeList) {
                size += await this._createAnInstance(another, tree, optionalState);
            }
        }
        return size;
    }

    protected _sumPrev(prev: Array<number>): number {
        return prev.reduce((accumulator, currentValue) => {
            return accumulator + currentValue
        }, 0);
    }

    protected _errorInfo(base: InjectionBase): string {
        const params = base.value.parameters.filter(p => !p.ignored && !p.instance).map((p, ix) => {
            if (p.identifier) {
                return `${ix}: i/${p.identifier}`;
            }
            return `${ix}: c/${p.foundType?.name ?? '?'}`;
        })
        return `${base.value.decoIns?.description ?? 'no-deco'} [${params.join(', ')}]`;
    }

    protected async _tryAgain(optionalState: InjectionOptionalState, prev: Array<number>, deepSize: number): Promise<void> {
        const pending = this._secure.$bases.filter(base => !base.value.data);
        const first = pending.length;
        if (first < 1) {
            return;
        }
        let added = 0;
        const tree = [] as Array<InjectionBase>;
        pending
            .sort((first, second) => {
                const a = (first.value.parameters.length * 2) + (first.value.isBulk ? 0 : 3) + (first.value.isAsync ? 11 : 0);
                const b = (second.value.parameters.length * 2) + (second.value.isBulk ? 0 : 3) + (second.value.isAsync ? 11 : 0);
                if (a < b) {
                    return -1;
                } else if (a > b) {
                    return 1;
                }
                return 0;
            });
        for (const base of pending) {
            added += await this._createAnInstance(base, tree, optionalState);
        }

        if (added === 0) {
            const sum = this._sumPrev(prev);
            prev.push(0);
            if (sum === 0) {
                if (prev.length >= this._DEEP) {
                    switch (optionalState) {
                        case 'wait-then-ignore':
                            // change optional methodology
                            return this._tryAgain('ignore-then-undefined', [], deepSize);
                        case "ignore-then-undefined":
                            // failed
                            throw $dev.developerError({
                                issue: 'injection.failed',
                                tree: tree.map(base => this._errorInfo(base))
                            });
                        case 'only-wait':
                            return;
                    }
                } else {
                    // continue
                    return this._tryAgain(optionalState, prev, deepSize);
                }
            }
        }
        // start again
        return this._tryAgain(optionalState, [], deepSize);
    }

    // endregion private

    // region public
    instances(): Array<InjectionInstance> {
        return this._secure.$bases.map(base => base.value);
    }

    get<T>(given: Func | ClassLike<T> | string, required?: boolean): InjectionInstance<T> {
        const base = this._depot.get(given, required);
        return base?.value;
    }

    exists(given: Func | ClassLike | string): boolean {
        return this._depot.has(given);
    }

    getInstance<T>(given: Func | ClassLike<T> | string, required?: boolean): T {
        const value = this._depot.fetchValue(given, required);
        return value?.data;
    }

    isBuilt(given: Func | ClassLike | string): boolean {
        const value = this._depot.fetchValue(given, false);
        return !!value?.data;

    }

    remove(given: Func | ClassLike | string, raiseIfAbsent?: boolean): boolean {
        const [removed, lookup] = this._secure.$remove(given, raiseIfAbsent);
        if (!removed) {
            this.logger.info(`${lookup.basic} is ignored for remove`);
        } else {
            this.logger.info(`${lookup.any} is removed`);
        }
        return removed;
    }

    async setInstance<T>(given: Func | ClassLike<T> | string, instance: T, raiseIfExists?: boolean): Promise<void> {
        $assert.object(instance, () => $dev.opt({
            field: 'instance',
            where: 'leyyo.injection.InjectionPool',
            method: 'setInstance'
        }));
        let provider: ClassLike;
        let identifier: string;
        if (typeof given !== 'function') {
            $assert.text(given, () => $dev.opt({
                field: 'identifier',
                where: 'leyyo.injection.InjectionPool',
                method: 'setInstance'
            }));
            identifier = given;
            provider = (instance as Obj).constructor as ClassLike;
        } else {
            provider = given as ClassLike;
            if (!(instance instanceof provider)) {
                $dev.log({
                    issue: 'instance.is.not.type.of.class',
                    field: 'identifier',
                    where: 'leyyo.injection.InjectionPool',
                    method: 'setInstance',
                    expected: core.fqnHandler.get(provider),
                    current: core.fqnHandler.get(instance)
                }, "warn");
            }
        }

        let base = this._depot.get(given, false);
        if (base) {
            if (base.value.data) {
                if (raiseIfExists) {
                    throw $dev.developerError({
                        issue: 'instance.is.already.built',
                        where: 'leyyo.injection.InjectionPool',
                        method: 'setInstance',
                        provider: core.fqnHandler.get(base.value.provider)
                    });
                }
            }
            if (identifier && !base.value.identifiers.includes(identifier)) {
                base.value.identifiers.push(identifier);
                this._secure.$appendAlias(base, identifier, 'custom');
            }
            base.value.data = instance;
            this.logger.debug(`${base.basic} is injected`);
            await this._triggerAfterCreation(base, [], 'only-wait');
            return;
        }
        const rec = {
            provider, decoIns: undefined, data: instance,
            identifiers: [],
            parameters: [],
            nameCallbacks: [],
            typeCallbacks: [],
        } as InjectionInstance;
        const [, lookup] = this._secure.$add(rec);
        this.logger.debug(`${lookup.basic} is injected`);
        base = this._findByProvider(provider);

        if (identifier && !base.value.identifiers.includes(identifier)) {
            base.value.identifiers.push(identifier);
            this._secure.$appendAlias(base, identifier, 'custom');
        }
        await this._triggerAfterCreation(base, [], 'only-wait');
    }

    async build(): Promise<void> {
        this._discoverProviders();
        await this._tryAgain('wait-then-ignore', [], this._DEEP);
        await this._discoverLazy();
    }

    // endregion public

    // region secure
    get $back(): InjectionPoolLike {
        return this;
    }

    get $secure(): InjectionPoolSecure {
        return this;
    }

    // endregion secure


    toJSON(): any {
        return {
            __: InjectionPool.name,
            bases: this._secure.$bases,
        };
    }
}

$$coreInternalOn('class-pool-3', () => {
    core.$secure.$setInjectionPool(new InjectionPool());
});
$$coreInternalOn('class-instance', () => {
    core.fqnHandler.clazz(InjectionPool, FQN_PCK);
});
