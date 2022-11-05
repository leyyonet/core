import {
    CoreInjectorLike,
    InjectorCallback,
    InjectorItem,
    InjectorStagingItem,
    InjectorStagingKind,
    InjectorWireOption
} from "./types";
import {DeveloperException} from "../error";
import {ArraySome, FuncLike, FuncOrName, NewableClass, ObjectLike, RecLike} from "../common";
import {$ly} from "../core";
import {ClassReflectLike, ParameterReflectLike, PropertyReflectLike, ReflectLike} from "../reflect";
import {DecoLike} from "../deco";
import {PointerLike} from "../pointer";
import {ClassReflect} from "../reflect/class-reflect";
import {PointerInstance} from "../pointer/pointer-instance";

type V = ObjectLike;
/**
 * @core
 * */
export class CoreInjector implements CoreInjectorLike {
    // region properties
    protected _pointer: PointerLike<V>;
    protected _autowired: FuncLike;
    protected _postWired: FuncLike;
    protected _lazyWired: FuncLike;
    protected _rootModule: ClassReflectLike;

    protected _v3_stagingItems: Array<InjectorStagingItem>;

    protected _stagingClasses: Map<FuncLike, Set<ClassReflectLike>>; // deco , classes[]
    protected _stagingMembers: Map<FuncLike, Set<PropertyReflectLike | ParameterReflectLike>>; // deco , members[]

    protected _stagingFunctions: Map<InjectorStagingKind, Map<FuncLike, Array<InjectorItem>>>;
    protected _stagingNames: Map<InjectorStagingKind, Map<string, Array<InjectorItem>>>;

    protected _constructingFunctions: Array<FuncLike>;
    protected _constructingNames: Array<string>;
    protected _namedFnMap: Map<string, FuncLike>;
    protected LOG = $ly.preLog;
    protected _kinds: Array<InjectorStagingKind> = ['post', 'lazy'];

    // endregion properties
    constructor() {
        $ly.addFqn(this);
        $ly.addTrigger('logger', () => {this.LOG = $ly.logger.assign(this)});
        $ly.addTrigger('pointer', () => {
            this._pointer = new PointerInstance<V>('injector', {alias: false, same: false}, (v) => v && typeof v === 'object');
            $ly.pointer.registerNickname(this._appendNicknames);
        });
        $ly.addTrigger('binder', () => $ly.binder.bindAll(this));
        $ly.addTrigger('repo', () => {
            this._v3_stagingItems = $ly.repo.newArray(this, '_v3_stagingItems');

            this._stagingClasses = $ly.repo.newMap(this, '_stagingClasses');
            this._stagingMembers = $ly.repo.newMap(this, '_stagingMembers');
            this._stagingFunctions = $ly.repo.newMap(this, '_stagingFunctions');
            this._stagingNames = $ly.repo.newMap(this, '_stagingNames');
            this._kinds.forEach(k => {
                this._stagingFunctions.set(k, new Map());
                this._stagingNames.set(k, new Map());
            })
            this._constructingFunctions = $ly.repo.newArray<FuncLike>(this, '_constructingFunctions');
            this._constructingNames = $ly.repo.newArray<string>(this, '_constructingNames');
            this._namedFnMap = $ly.repo.newMap<string, FuncLike>(this, '_namedFnMap');
        });
        $ly.addTrigger('processor', () => {
            $ly.processor.$add('injecting', async () => await this._startToConstruct());
        });
        $ly.$bindInstance(this);
    }
    static {
        $ly.addDependency('injector', () => new CoreInjector());
    }
    // region private
    protected _getFn(identifier: FuncLike|string): FuncLike {
        if (typeof identifier === 'function') {
            return identifier;
        }
        if (typeof identifier === 'string') {
            return this._namedFnMap.get(identifier);
        }
        return undefined;
    }
    protected _addToConstructing(identifier: FuncLike | string, exact?: boolean): boolean {
        let added = false;
        const typeOf = typeof identifier;
        if (typeOf === 'function') {
            const fn = $ly.symbol.getReferenced(identifier as FuncLike);
            const name = $ly.fqn.get(fn);
            if (!this._constructingFunctions.includes(fn)) {
                this._constructingFunctions.push(fn);
                added = true;
            }
            if (exact && !this._constructingNames.includes(name)) {
                this._constructingNames.push(name);
                added = true;
            }
        } else if (typeOf === 'string') {
            const name = identifier as string;
            if (!this._constructingNames.includes(name)) {
                this._constructingNames.push(name);
                added = true;
            }
        } else {
            new DeveloperException('injector:unknown.identifier')
                .patch({identifier, typeOf, method: '_addToConstructing'})
                .with(this).log();
        }
        return added;
    }
    protected _removeFromConstructing(identifier: FuncLike | string, exact?: boolean): boolean {
        let removed = false;
        const typeOf = typeof identifier;
        if (typeOf === 'function') {
            const fn = $ly.symbol.getReferenced(identifier as FuncLike);
            const name = $ly.fqn.get(fn);
            if (this._constructingFunctions.includes(fn)) {
                this._constructingFunctions.splice(this._constructingFunctions.indexOf(fn), 1);
                removed = true;
            }
            if (exact && this._constructingNames.includes(name)) {
                this._constructingNames.splice(this._constructingNames.indexOf(name), 1);
                removed = true;
            }
        } else if (typeOf === 'string') {
            const name = identifier as string;
            if (this._constructingNames.includes(name)) {
                this._constructingNames.splice(this._constructingNames.indexOf(name), 1);
                removed = true;
            }
        } else {
            new DeveloperException('injector:unknown.identifier')
                .patch({identifier, typeOf, method: '_removeFromConstructing'})
                .with(this).log();
        }
        return removed;
    }
    protected _isConstructing(identifier: FuncLike | string, exact?: boolean): boolean {
        const typeOf = typeof identifier;
        if (typeOf === 'function') {
            const fn = $ly.symbol.getReferenced(identifier as FuncLike);
            if (this._constructingFunctions.includes(fn)) {
                return true;
            }
            if (exact && this._constructingNames.includes($ly.fqn.get(fn))) {
                return true;
            }
        } else if (typeOf === 'string') {
            if (this._constructingNames.includes(identifier as string)) {
                return true;
            }
        } else {
            new DeveloperException('injector:unknown.identifier')
                .patch({identifier, typeOf, method: '_removeFromConstructing'})
                .with(this).log();
        }
        return false;
    }
    protected _addToStaging(kind: InjectorStagingKind, key: FuncOrName, target: ObjectLike, ref: ReflectLike, callback: InjectorCallback): void {
        if (typeof kind !== 'string') {
            return;
        }
        if (!this._stagingFunctions.has(kind) || !this._stagingNames.has(kind)) {
            return;
        }

        const fnMap = this._stagingFunctions.get(kind);
        const nameMap = this._stagingNames.get(kind);
        const item = {target, ref, callback};
        let fullName: string;
        if (typeof key === 'function') {
            const referenced = $ly.symbol.findReferenced(key) as FuncLike;
            if (!fnMap.has(referenced)) {
                fnMap.set(referenced, []);
            }
            fnMap.get(referenced).push(item);
            fullName = $ly.fqn.get(referenced);
        } else if (typeof key === 'string') {
            fullName = key;
        } else {
            // todo
            return;
        }
        this._pointer.getNames(fullName).forEach(n => {
            if (!nameMap.has(n)) {
                nameMap.set(n, []);
            }
            nameMap.get(n).push(item);
        })
        this.LOG.debug(`Injector staged`, {fn: fullName, target: item.ref.description});
    }
    protected _processNamedStagings(kind: InjectorStagingKind, instance: ObjectLike, name: string) {
        if (!this._stagingNames.has(kind)) {
            return;
        }
        const nameMap = this._stagingNames.get(kind);
        if (nameMap.has(name)) {
            nameMap.get(name).forEach(staging => {
                if (staging.callback(instance)) {
                    this.LOG.info('Staging processed', {name, target: staging.ref.description});
                }
            });
            nameMap.delete(name);
        }
    }
    protected _processStaging(kind: InjectorStagingKind, fn: FuncLike, instance: ObjectLike): void {
        if (typeof kind !== 'string') {
            return;
        }
        if (!this._stagingFunctions.has(kind)) {
            return;
        }
        fn = $ly.symbol.findReferenced(fn) as FuncLike;
        const fnMap = this._stagingFunctions.get(kind);
        if (fnMap.has(fn)) {
            fnMap.get(fn).forEach(staging => {
                if (staging.callback(instance)) {
                    this.LOG.info('Staging processed', {kind, fn, target: staging.ref.description});
                }
            });
            fnMap.delete(fn);
        }
    }
    protected _setWiredFunction(name: string, newFn: FuncLike, oldFn: FuncLike): FuncLike {
        if (!$ly.deco.isDecorator(newFn)) {
            throw new DeveloperException('injector:invalid.wired.function')
                .with(this)
                .patch({[name]: newFn});
        }
        if (oldFn) {
            throw new DeveloperException('injector:already.wired.function')
                .with(this)
                .patch({[name]: newFn, oldFn});
        }
        return newFn;
    }
    protected _setValue(target: ObjectLike, property: string, value: ObjectLike, isMethod: boolean): boolean {
        const wiredProperties = $ly.symbol.getDirect(target, 'i.wired', []);
        if (wiredProperties.includes(property)) {
            return false;
        }
        if (isMethod) {
            target[property](value);
        } else {
            target[property] = value;
        }
        wiredProperties.push(property);
        $ly.symbol.setDirect(target, 'i.wired', wiredProperties);
        return true;
    }
    protected _appendNicknames(clazz: FuncLike, nicknames: Array<string>): void {
        const instance = this._pointer.$getValue(clazz);
        if (!instance) {
            return;
        }
        nicknames = this._pointer.appendNicknames(clazz, nicknames);
        nicknames.forEach(n => this._kinds.forEach(k => this._processNamedStagings(k, instance, n)));
        this.LOG.debug('Injector nicknames', {clazz, nicknames});
    }
    protected async _setMembers(target: ObjectLike, cRef: ClassReflectLike, fn: FuncLike, opt: InjectorWireOption): Promise<void> {
        const refs = cRef.listAnyProperties({keyword: 'instance'})
            .filter(r => r.hasDecorator(fn));
        for (const ref of refs) {
            await this._setMember(target, ref, opt);
        }
    }
    protected async _setMember(target: ObjectLike, ref: PropertyReflectLike, opt: InjectorWireOption): Promise<void> {
        this.LOG.debug('setMember', {target: $ly.fqn.get(target), ref: ref.description});
        let fn: FuncLike;
        let identifier: string;
        let pRef: ParameterReflectLike;
        if (ref.target === 'method') {
            if (typeof ref.methodFn !== 'function') {
                throw new DeveloperException('injector:invalid.method.body')
                    .with(this)
                    .patch({method: ref.description});
            }
            if (ref.methodFn.length !== 1) {
                throw new DeveloperException('injector:invalid.method.parameters')
                    .with(this)
                    .patch({method: ref.description, expected: 1, actual: ref.methodFn.length});
            }
            pRef = ref.getParameter(0);
            fn = pRef.typeFn;
            identifier = pRef.namedType;
        } else {
            fn = ref.typeFn;
            identifier = ref.namedType;
        }
        if (typeof fn === 'function' && this.has(fn)) {
            this.LOG.debug('Value set', {target: ref.description, fn: $ly.fqn.get(fn)});
            this._setValue(target, ref.name, this.get(fn), false);
            return;
        }
        else if (typeof identifier === 'string' && this.has(identifier)) {
            const primary = this._pointer.findPrimary(identifier, false);
            if (primary) {
                if (ref.target === 'method') {
                    pRef.$setTypeFn(primary);
                } else {
                    ref.$setTypeFn(primary);
                }
                this.LOG.debug('Value set', {target: ref.description, fn: $ly.fqn.get(primary)});
                this._setValue(target, ref.name, this.get(primary), false);
            }
            return;
        }
        if (opt.kind) {
            let staged = false;
            if (typeof fn === 'function' && $ly.system.isCustomClass(fn.name)) {
                this._addToStaging(opt.kind, fn, target, ref,
                    (v) => this._setValue(target, ref.name, v, false));
                staged = true;
            }
            if (typeof identifier === 'string') {
                this._addToStaging(opt.kind, identifier, target, ref, (value) => {
                    if (this._setValue(target, ref.name, value, false)) {
                        const fn = this._pointer.findPrimary(identifier, false);
                        if (fn) {
                            if (ref.target === 'method') {
                                pRef.$setTypeFn(fn);
                            } else {
                                ref.$setTypeFn(fn);
                            }
                        }
                        return true;
                    }
                    return false;
                });
                staged = true;
            }
            if (staged) {
                return;
            }
        }
        if (typeof fn === 'function' && this._isConstructing(fn)) {
            throw new DeveloperException('injector:circular.dependency')
                .with(this)
                .patch({target: ref.description, fn: $ly.fqn.get(fn), loop: this._constructingFunctions.map(f => $ly.fqn.get(f))});
        }
        throw new DeveloperException('injector:unknown.dependency.name')
            .with(this)
            .patch({identifier, fn, target: ref.description});
    }
    protected async _setParameters(cRef: ClassReflectLike): Promise<ArraySome> {
        const values = [];
        if (!cRef.hasAnyProperty('constructor', {kind: 'method'})) {
            return values;
        }

        const mRef = cRef.getAnyProperty('constructor', {kind: 'method'});
        if (!mRef) {
            return values;
        }
        let params = mRef.listParameters();
        if (params.length < 1) {
            return values;
        }
        if (params.some(r => (r.typeFn === undefined && r.namedType === undefined))) {
            $ly.reflect.$findConstructorParams(cRef.classFn);
            params = mRef.listParameters();
        }
        for (const pRef of params) {
            this.LOG.debug('setParam', {clazz: cRef.name, param: pRef.description, type: pRef.typeFn, named: pRef.namedType});
            let infoName: string;
            if (typeof pRef.typeFn === 'function') {
                if (this.has(pRef.typeFn)) {
                    values.push(this.get(pRef.typeFn));
                    continue;
                }
                if (this._isConstructing(pRef.typeFn)) {
                    throw new DeveloperException('injector:circular.dependency')
                        .with(this)
                        .patch({ccc: cRef.description, index: pRef.index, loop: this._constructingFunctions.map(f => $ly.fqn.get(f))});
                }
                infoName = $ly.fqn.get(pRef.typeFn);
            }
            if (pRef.hasDecorator(this._autowired)) {
                const decoVal = pRef.getValue(this._autowired) as RecLike;
                if (typeof decoVal?.identifier === 'string') {
                    infoName = decoVal.identifier;
                    if (this.has(infoName)) {
                        values.push(this.get(infoName));
                        continue;
                    }
                }
            }
            // if (typeof pRef.typeFn === 'function') {
            //     const tRef = $ly.reflect.getClass(pRef.typeFn, false);
            //     if (tRef) {
            //         const ins = await this._wireClass(tRef);
            //         values.push(ins);
            //         return;
            //     }
            // }
            if (infoName) {
                throw new DeveloperException('injector.unknown.dependency')
                    .with(this)
                    .patch({name: infoName, ccc: cRef.description, index: pRef.index});
            }
            throw new DeveloperException('injector.empty.dependency')
                .with(this)
                .patch({name: infoName, ccc: cRef.description, index: pRef.index});

        }
        return values;
    }
    protected async _wireClass(staging: InjectorStagingItem): Promise<unknown> {
        const ref = staging.ref as ClassReflectLike;
        let ins = this.get(ref.classFn);
        // already created
        if (ins) {
            return ins;
        }

        this.LOG.debug('Class creating...', {target: ref.name});
        const clazz = ref.classFn as NewableClass;

        this._addToConstructing(clazz);

        // autowired fields
        if (this._autowired) {
            await this._setMembers(clazz.prototype, ref, this._autowired, {});
        }

        // autowired parameters
        const paramValues = await this._setParameters(ref);

        try {
            ins = new clazz(...paramValues);
        } catch (e) {
            throw $ly.error.build(e).patch({target: ref.description});
        }
        this.add(ref.classFn, ins);

        this._removeFromConstructing(clazz);

        // postWired field & methods
        if (this._postWired) {
            await this._setMembers(ins, ref, this._postWired, {kind: 'post'});
        }
        // todo postConstruct
        return ins;
    }
    protected async _wireMember(staging: InjectorStagingItem): Promise<void> {
        let identifier: string;
        const target = staging.ref.target;
        const fRef = (staging.ref as PropertyReflectLike);
        const decoVal = fRef.getValue(staging.deco) as RecLike;
        if (typeof decoVal?.identifier === 'string') {
            identifier = decoVal.identifier;
        }
        if (identifier) {
            if (target === 'field') {
                fRef.$setNamedType(identifier);
            } else if (target === 'method') {
                const pRef = fRef.getParameter(0);
                if (pRef) {
                    pRef.$setNamedType(identifier);
                }
            }
        }
    }
    protected async _startToConstruct(): Promise<void> {
        await $ly.processor.$runAsync('beforeInjected');
        if (!this._rootModule) {
            throw new DeveloperException('injector.notfound.rood.module').with(this);
        }

        // todo before construct
        const classes = [] as Array<ClassReflectLike>;
        for (const staging of this._v3_stagingItems) {
            if ((staging.ref as ClassReflectLike).classFn) {
                await this._wireClass(staging);
                classes.push(staging.ref as ClassReflectLike);
            } else {
                await this._wireMember(staging);
            }
        }
        // lazy wired
        if (this._lazyWired) {
            for (const ref of classes) {
                await this._setMembers(this.get(ref.classFn), ref, this._lazyWired, {kind: 'lazy'});
            }
        }
        this._v3_stagingItems = [];
        // todo after construct
        $ly.processor.$run('injected');
        await $ly.processor.$runAsync('afterInjected');
    }
    // endregion private
    // region internal
    $newInstance<T = ObjectLike>(clazz: FuncLike, origin?: FuncLike): T {
        if (this.has(clazz)) {
            return this.get(clazz) as T;
        }
        this._addToConstructing(clazz);
        if (clazz.length > 0) {
            throw new DeveloperException('injector.instance.constructor.has.parameters', {clazz, origin})
                .with(this);
        }
        const instance = Reflect.construct(clazz, []);
        this.add(clazz, instance);
        this._removeFromConstructing(clazz);
        this.LOG.debug('Instance created', {clazz, origin});
        return instance;
    }
    $setAutowired(fn: FuncLike): void {
        this._autowired = this._setWiredFunction('Autowired', fn, this._autowired);
    }
    $setPostWired(fn: FuncLike): void {
        this._postWired = this._setWiredFunction('PostWired', fn, this._postWired);
    }
    $setLazyWired(fn: FuncLike): void {
        this._lazyWired = this._setWiredFunction('LazyWired', fn, this._lazyWired);
    }
    $setRootModule(ref: ClassReflectLike): void {
        if (this._rootModule) {
            throw new DeveloperException('injector:already.root.module')
                .with(this)
                .patch({previous: this._rootModule.name, next: ref.name});
        }
        if (!(ref instanceof ClassReflect)) {
            throw new DeveloperException('injector:invalid.class')
                .with(this)
                .patch({clazz: ref.name});
        }
        this._rootModule = ref;
    }
    $addToStagingClass(deco: DecoLike, ref: ReflectLike): void {
        this._v3_stagingItems.push({deco, ref});
    }
    $addToStagingMember(deco: DecoLike, ref: ReflectLike): void {
        this._v3_stagingItems.push({deco, ref});
    }
    // endregion internal

    // region pointer
    listNames(): Map<string, FuncLike> {
        return this._pointer.getNameMap();
    }
    listInstances(): Array<FuncLike> {
        return this._pointer.getPrimaryList();
    }
    add(identifier: FuncLike|string, instance: V): void {
        let fn: FuncLike;
        let name: string;
        if (typeof identifier === 'string') {
            name = identifier;
            if (!this._namedFnMap.has(name)) {
                fn = () => false;
                $ly.binder.setName(fn, name);
                $ly.fqn.func(fn);
                this._namedFnMap.set(name, fn);
            } else {
                fn = this._namedFnMap.get(name);
            }
        } else if (typeof identifier === 'function') {
            fn = identifier;
            name = $ly.fqn.get(fn);
        }
        this._pointer.addPrimary(fn, instance)
            .forEach(n => this._kinds.forEach(k => this._processNamedStagings(k, instance, n)));

        this._kinds.forEach(k => this._processStaging(k, fn, instance));
        this.LOG.debug('Class injected', {clazz: name});
    }


    get<T = V>(identifier: FuncLike|string): T {
        return this._pointer.$getValue(this._getFn(identifier)) as T;
    }

    find<T = V>(identifier: V|FuncLike|string, throwable?: boolean): T {
        return this._pointer.findValue(identifier as FuncLike, throwable) as T;
    }

    has(identifier: FuncLike | string): boolean {
        return this._pointer.isPrimary(identifier as FuncLike);
    }
    // endregion pointer
}
