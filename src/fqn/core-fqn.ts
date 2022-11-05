import {
    CoreFqnLike,
    FqnFootprint,
    FqnFootprintDetail,
    FqnFootprintTree,
    FqnGetSet,
    FqnSource,
    FqnSymbol,
    FqnType
} from "./types";
import {ClassLike, FuncLike, ObjectLike, ObjectOrFunction} from "../common";
import {$ly} from "../core";
import {DeveloperException} from "../error";

/**
 * @core
 * */
export class CoreFqn implements CoreFqnLike {
    // region property
    protected readonly _NAME = 'fqn';
    protected readonly _TYPE = 'fqt';
    protected readonly _ORIGIN = 'fqo';
    protected _set: WeakSet<ClassLike> = new WeakSet<ClassLike>();
    protected LOG = $ly.preLog;

    // endregion property
    constructor() {
        $ly.addFqn(this);
        $ly.addTrigger('logger', () => {this.LOG = $ly.logger.assign(this)});
        $ly.addTrigger('processor', () => {
                $ly.processor.add('afterStarted', () => this._set = undefined, 'fqn-clear');
            });
    }
    static {
        $ly.addDependency('fqn', () => new CoreFqn());
    }

    // region protected
    protected _buildFootprint(name: string, stereotype: FqnType, possibleOrigin: FqnFootprintDetail | string): FqnFootprint {
        let origin: string;
        if (possibleOrigin && typeof possibleOrigin !== 'string') {
            origin = (possibleOrigin as FqnFootprintDetail).origin;
        } else {
            origin = possibleOrigin as string;
        }
        return {name, stereotype, origin, count: 1} as FqnFootprint;
    }

    protected _readName(prefixes: Array<string>): Array<string> {
        return prefixes.map(v => $ly.primitive.text(v)).filter(v => !!v);
    }

    protected _buildName(names: Array<string>): string {
        return names.length > 0 ? names.join('.') : undefined;
    }

    protected _isTarget(name: string, target: ObjectOrFunction): boolean {
        return target && ['function', 'object'].includes(typeof target) && $ly.system.isCustomClass(name);
    }

    protected _buildOrigin(item: ObjectOrFunction): string {
        if (!item) {
            return undefined;
        }
        let typed = (typeof item) as string;
        if (!['function', 'object'].includes(typed)) {
            return typed as unknown as string;
        }
        const stringify = Object.prototype.toString.call(item) as string;
        if (stringify.startsWith('[function')) {
            typed = 'function-' + stringify.substring(stringify.indexOf(' ') + 1, stringify.indexOf(']'));
        }
        if (stringify.startsWith('[object')) {
            typed = 'object-' + stringify.substring(stringify.indexOf(' ') + 1, stringify.indexOf(']'));
        }
        if (stringify === '[object GeneratorFunction]') {
            return 'function-generator';
        }
        let str = '';
        try {
            str = item + '';
        } catch (e) {
            return typed as string;
        }
        if (str.startsWith('class')) {
            const className = str.substring(5, str.indexOf('{')).trim();
            if (className === '') {
                return 'class-anonymous';
            } else if (className.includes('extends ')) {
                return 'class-inherited';
            }
            return 'class-regular';
        } else if (str.startsWith('function')) {
            return 'function-regular';
        } else if (str.startsWith('(')) {
            return 'function-anonymous';
        }
        return typed as string;
    }

    protected _prepareFootprint(item: ObjectOrFunction, detailed: boolean): FqnFootprintDetail {
        if (!item) {
            return undefined;
        }
        const obj = {
            name: (item as FuncLike).name,
            fqn: undefined,
            stereotype: undefined,
            origin: undefined,
        } as FqnFootprintDetail;
        const fp = this._getFootprint(item);
        if (fp) {
            obj.fqn = fp.name;
            obj.stereotype = fp.stereotype;
            obj.origin = fp.origin;
        }
        // clear undefined
        for (const [k, v] of Object.entries(obj)) {
            if (!v) {
                delete obj[k];
            }
        }
        if (!obj.origin) {
            obj.origin = this._buildOrigin(item);
        }
        if (detailed) {
            const details = {
                parent: Object.getPrototypeOf(item),
                proto: (item as FuncLike)?.prototype,
                constructor: (item as FuncLike)?.constructor,
            }
            for (const [k, v] of Object.entries(details)) {
                const footprintDetail = this._prepareFootprint(v, false);
                if (footprintDetail) {
                    obj[k] = footprintDetail;
                }
            }
        }
        return obj;
    }

    protected _possibleEnum(name: string, map: ObjectOrFunction, ...names: Array<string>): FqnFootprint | boolean {
        name = $ly.primitive.text(name);
        if (!name || !$ly.primitive.isObjectFilled(map)) {
            return false;
        }
        const preSign = this._prepareFootprint(map, false);
        if (preSign.fqn) {
            return true;
        }
        if (map.constructor?.name !== 'Object') {
            // constructor should be an object
            return false;
        }
        for (const key of Object.keys(map)) {
            const desc = Object.getOwnPropertyDescriptor(map, key);
            if (desc) {
                if (typeof desc.get === 'function') {
                    // property has getter
                    return false;
                }
                if (typeof desc.set === 'function') {
                    // property has setter
                    return false;
                }
                if (!['string', 'number'].includes(typeof desc.value)) {
                    // property type is not string or number
                    return false;
                }
            }
        }
        names = this._readName(names);
        names.push(name);
        return this._buildFootprint(this._buildName(names), 'enum', 'enum-anonymous');
    }

    protected _possibleObject(name: string, obj: ObjectOrFunction, ...names: Array<string>): FqnFootprint | boolean {
        name = $ly.primitive.text(name);
        if (!name) {
            return false;
        }
        const preSign = this._prepareFootprint(obj, false);
        if (preSign.fqn) {
            return true;
        }
        if (!obj.constructor?.name) {
            return false;
        }
        names = this._readName(names);
        names.push(name);
        return this._buildFootprint(this._buildName(names), 'object', '# ' + obj.constructor.name);
    }

    protected _renameAnonymous(name: string, fn: FuncLike | ClassLike, footprintDetail: FqnFootprintDetail): boolean {
        const origin = footprintDetail.origin;
        if (origin && origin.endsWith('anonymous')) {
            $ly.binder.setName(fn as FuncLike, name);
        }
        return true;
    }

    protected _group(instance: ObjectOrFunction, group: FqnType, ...prefixes: Array<string>): void {
        if (!$ly.primitive.isObjectFilled(instance)) {
            throw new DeveloperException('fqn.invalid.group', {group, instance, reason: 'not-object', prefixes});
        }
        const names = this._readName(prefixes);
        if (Object.keys(instance).length !== 1) {
            throw new DeveloperException('fqn.invalid.group', {group, instance, reason: 'only-a-child', prefixes});
        }
        const [key, mdl] = Object.entries(instance)[0];
        if (!$ly.primitive.isObjectFilled(mdl)) {
            throw new DeveloperException('fqn.invalid.group', {group, instance, key, reason: 'invalid-child', prefixes});
        }
        names.push(key);
        const path = this._buildName(names);
        for (const [member, item] of Object.entries(mdl)) {
            const footprintDetail = this._prepareFootprint(item, true);
            if (!footprintDetail) {
                continue;
            }
            if (footprintDetail.fqn) {
                continue;
            }
            this._renameAnonymous(member, item as FuncLike, footprintDetail);
            if (footprintDetail.origin.startsWith('function')) {
                this._func(item as FuncLike, footprintDetail, path);
            } else if (footprintDetail.origin.startsWith('class')) {
                this._clazz(item as ClassLike, footprintDetail, path);
            } else if (!this._obj(member, item, path)) {
                const footprintDetail = this._prepareFootprint(item, true);
                this.LOG.warn('_obj', {member, footprint: footprintDetail});
            }
        }
        this.setFootprint(mdl, this._buildName(names), group);
    }

    protected _obj(name, obj, ...names: Array<string>): boolean {
        let fp: FqnFootprint;
        if ($ly.primitive.isObjectFilled(obj)) {
            fp = this._possibleEnum(name, obj, ...names) as FqnFootprint;
        }
        if (!fp) {
            fp = this._getFootprint(obj.constructor);
            if (!fp) {
                fp = this._possibleObject(name, obj, ...names) as FqnFootprint;
            }
        }
        if ($ly.primitive.isObjectFilled(fp)) {
            this.setFootprint(obj, fp.name, fp.stereotype, fp.origin);
            return true;
        } else if (!fp) {
            return false;
        }
    }

    protected _clazz(clazz: ClassLike, fp: FqnFootprintDetail, path: string): void {
        if (!this._isTarget(clazz.name, clazz)) {
            return;
        }
        // region is-already
        try {
            if (this._set.has(clazz as ClassLike)) {
                return;
            }
            this._set.add(clazz as ClassLike);
        } catch (e) {
            return;
        }
        // endregion is-already
        // region is-inherited
        const parent = Object.getPrototypeOf(clazz);
        if (parent) {
            this._clazz(clazz, undefined, path);
        }
        // endregion is-inherited
        // region class
        if (!fp) {
            fp = this._prepareFootprint(clazz, false);
        }
        path = (path ? `${path}.` : '') + `${clazz.name}`;
        this.setFootprint(clazz, path, 'class', fp.origin);
        // endregion class
        // region instance-members
        if (this._isTarget(clazz.name, clazz.prototype)) {
            Object.getOwnPropertyNames(clazz.prototype).forEach(property => {
                switch (this.getSource(clazz.prototype, property, true)) {
                    case "function":
                        const fn = (clazz.prototype[property]) as FuncLike;
                        if (!fn.name) {
                            $ly.binder.setName(fn, property);
                        }
                        this.setFootprint(clazz.prototype[property], `${path}.${property}`, 'method', 'method-instance');
                        break;
                    case "getter":
                        this._setGetter(clazz.prototype, property, path, 'getter-instance');
                        break;
                    case "setter":
                        this._setSetter(clazz.prototype, property, path, 'setter-instance');
                }
            });
        }
        // endregion instance-members
        // region static-members
        Object.getOwnPropertyNames(clazz).forEach(property => {
            switch (this.getSource(clazz, property, false)) {
                case "function":
                    const fn = (clazz[property]) as FuncLike;
                    if (!fn.name) {
                        $ly.binder.setName(fn, property);
                    }
                    this.setFootprint(clazz[property], `${path}.${property}`, 'method', 'method-static');
                    break;
                case "getter":
                    this._setGetter(clazz, property, path, 'getter-static');
                    break;
                case "setter":
                    this._setSetter(clazz, property, path, 'setter-static');
                    break;
            }
        });
        // endregion static-members
        this.LOG.debug('Class signed', {clazz:path});
        const cb = $ly.symbol.get(clazz, 'fqn_on'); // todo
        if (typeof cb === 'function') {
            cb();
        }
    }

    protected _func(fn: FuncLike, fp: FqnFootprintDetail, path: string) {
        path = (path ? `${path}.` : '') + (($ly.filled(fn.name) && fn.name !== '') ? fn.name : '<anonymous>');
        this.setFootprint(fn, path, 'function', fp.origin);
    }

    protected _getFootprint(target: ObjectOrFunction): FqnFootprint {
        if (!target) {
            return undefined;
        }
        const rec = $ly.symbol.getSome(target, this._NAME, this._TYPE, this._ORIGIN);
        if (!rec) {
            return undefined;
        }
        return {
            name: rec[this._NAME],
            stereotype: rec[this._TYPE],
            origin: rec[this._ORIGIN],
        } as FqnFootprint;
    }
    _setGetter(clazz: ObjectOrFunction, property: string, path: string, origin: string): void {
        $ly.symbol.set<FqnGetSet>(clazz, 'g-' + property, {
            n: `${path}.${property}`,
            o: origin,
        });
    }
    _setSetter(clazz: ObjectOrFunction, property: string, path: string, origin: string): void {
        $ly.symbol.set<FqnGetSet>(clazz, 's-' + property, {
            n: `${path}.${property}`,
            o: origin,
        });
    }
    getterFootprint(clazz: ObjectOrFunction, property: string): FqnFootprint {
        const rec = $ly.symbol.get<FqnGetSet>(clazz, 'g-' + property);
        if (!rec) {
            return undefined;
        }
        return {
            name: rec.n,
            stereotype: 'getter',
            origin: rec.o,
        }
    }
    setterFootprint(clazz: ObjectOrFunction, property: string): FqnFootprint {
        const rec = $ly.symbol.get<FqnGetSet>(clazz, 's-' + property);
        if (!rec) {
            return undefined;
        }
        return {
            name: rec.n,
            stereotype: 'setter',
            origin: rec.o,
        }
    }
    protected constructorName(clazz: ObjectOrFunction) {
        if (typeof clazz === 'function') {
            return clazz?.name;
        }
        if (typeof clazz === 'object') {
            return clazz?.constructor?.name;
        }
        return undefined;
    }
    setFootprint(target: ObjectOrFunction, name: string, stereotype: FqnType, origin?: string): boolean {
        if (stereotype === 'class' && !$ly.system.isCustomClass(this.constructorName(target))) {
            return false;
        }
        return $ly.symbol.setSome<FqnSymbol>(target, {
            [this._NAME]: name,
            [this._TYPE]: stereotype,
            [this._ORIGIN]: origin,
        }) > 0;
    }

    getSource(target: ObjectOrFunction, key: string, isInstance: boolean): FqnSource {
        const descriptor = $ly.system.propertyDescriptor(target, key, isInstance);
        if (!descriptor) {
            return undefined;
        }
        if (typeof descriptor.get === 'function') {
            return 'getter';
        }
        if (typeof descriptor.set === 'function') {
            return 'setter';
        }
        if (typeof descriptor.value === 'function') {
            return 'function';
        }
        return undefined;
    }

    // endregion protected

    // region descriptor
    getFootprint(value: ObjectOrFunction): FqnFootprint {
        if ($ly.not(value)) {
            return undefined;
        }
        try {
            const typeOf = typeof value;
            let descriptor: FqnFootprint;
            switch (typeOf) {
                case 'string':
                case 'boolean':
                case 'number':
                case 'bigint':
                case 'symbol':
                    return {name: typeOf, stereotype: typeOf as FqnType, origin: 'primitive'};
                case 'object':
                    descriptor = this._getFootprint(value);
                    if (descriptor) {
                        return descriptor;
                    }
                    descriptor = this._getFootprint(value?.constructor);
                    if (descriptor) {
                        return descriptor;
                    }
                    return {name: value?.constructor?.name as string, stereotype: 'object', origin: undefined};
                case "function":
                    descriptor = this._getFootprint(value);
                    if (descriptor) {
                        return descriptor;
                    }
                    return {name: (value as FuncLike)?.name as string, stereotype: 'object', origin: undefined};
                default:
                    return {name: typeOf, stereotype: typeOf as FqnType, origin: 'unknown'};
            }
        } catch (e) {
            this.LOG.native(e, 'getFootprint', {value});
        }
        return undefined;
    }

    // noinspection JSUnusedGlobalSymbols
    isGetter(clazz: ObjectOrFunction, key: string, isInstance: boolean): boolean {
        return this.getSource(clazz, key, isInstance) === "getter";
    }

    // endregion descriptor
    // region footprint
    is(target: ObjectOrFunction): boolean {
        return !!this._getFootprint(target);
    }

    get(target: unknown): string {
        if ($ly.not(target)) {
            return undefined;
        }
        let name: string;
        switch (typeof target) {
            case "function":
                name = $ly.symbol.get<string>(target, this._NAME);
                if (name) {
                    return name;
                }
                return target.name;
            case "object":
                name = $ly.symbol.get<string>(target, this._NAME);
                if (name) {
                    return name;
                }
                return this.get(target.constructor);
            case "string":
                return target;
            case "number":
            case "symbol":
            case "bigint":
                return target.toString(10);
            case "boolean":
                return target ? 'true' : 'false';
        }
        return undefined;
    }

    stereotype(target: unknown): FqnType {
        return $ly.symbol.get<FqnType>(target, this._TYPE);
    }

    origin(target: unknown): string {
        return $ly.symbol.get<string>(target, this._ORIGIN);
    }

    // endregion footprint
    // region dimensions

    clazz(clazz: ObjectOrFunction, ...prefixes: Array<string>): void {
        if (clazz && typeof clazz === 'object') {
            clazz = clazz.constructor;
        }
        const footprint = this._prepareFootprint(clazz, false);
        if (!footprint || !footprint.origin?.startsWith('class')) {
            throw new DeveloperException('fqn.invalid.class', {clazz, footprint, prefixes});
        }
        this._clazz(clazz as ClassLike, footprint, this._buildName(this._readName(prefixes)));
    }

    func(fn: FuncLike, ...prefixes: Array<string>): void {
        const footprint = this._prepareFootprint(fn, false);
        if (!footprint || !footprint.origin?.startsWith('function')) {
            throw new DeveloperException('fqn.invalid.function', {fn, footprint, prefixes});
        }
        this._func(fn, footprint, this._buildName(this._readName(prefixes)));
    }
    deco(fn: FuncLike, ...prefixes: Array<string>): void {
        const footprint = this._prepareFootprint(fn, false);
        if (!footprint || !footprint.origin?.startsWith('function')) {
            throw new DeveloperException('fqn.invalid.function', {fn, footprint, prefixes});
        }
        footprint.origin = 'function-decorator';
        this._func(fn, footprint, this._buildName(this._readName(prefixes)));
    }

    enum(name: string, map: ObjectLike, ...prefixes: Array<string>): void {
        const fp = this._possibleEnum(name, map, ...prefixes);
        if (fp === true) {
            return;
        }
        if (fp === false) {
            throw new DeveloperException('fqn.invalid.enum', {name, map, prefixes});
        }
        fp.origin = 'enum-regular';
        this.setFootprint(map, fp.name, fp.stereotype, fp.origin);
    }

    module(instance: ObjectLike, ...prefixes: Array<string>): void {
        this._group(instance, 'module', ...prefixes);
    }

    namespace(instance: ObjectLike, ...prefixes: Array<string>): void {
        this._group(instance, 'namespace', ...prefixes);
    }

    file(instance: ObjectLike, ...prefixes: Array<string>): void {
        this._group(instance, 'file', ...prefixes);
    }

    object(name: string, obj: ObjectLike, ...prefixes: Array<string>): void {
        const names = this._readName(prefixes);
        if (!obj || typeof obj !== 'object') {
            throw new DeveloperException('fqn.invalid.object', {name, obj, prefixes, typeOf: typeof obj});
        }
        // todo look for constructor
        names.push(name);
        if (!this._obj(name, obj, ...prefixes)) {
            const footprint = this._prepareFootprint(obj, true);
            throw new DeveloperException('fqn.invalid.object', {name, obj, footprint, prefixes});
        }
    }

    // endregion dimensions
    // region report
    // noinspection JSUnusedGlobalSymbols
    reports(...objects: Array<ObjectOrFunction>): Array<FqnFootprintTree> {
        return objects.map(obj => this.report(obj));
    }

    report(obj: ObjectOrFunction): FqnFootprintTree {
        const footprint = this.getFootprint(obj) as FqnFootprintTree;
        if (!footprint?.name) {
            return footprint;
        }
        switch (footprint.stereotype) {
            case 'function':
            case 'enum':
            case 'object':
                break;
            case 'class':
                footprint.children = {};
                if (this._isTarget(footprint.name, obj)) {
                    if (typeof obj === 'function') {
                        Object.getOwnPropertyNames(obj).forEach(key => {
                            switch (this.getSource(obj, key, false)) {
                                case "function":
                                    footprint.children[`::${key}`] = this.getFootprint(obj[key]);
                                    break;
                                case "getter":
                                    footprint.children[`::${key}`] = this.getterFootprint(obj, key);
                                    break;
                                case "setter":
                                    footprint.children[`::${key}`] = this.setterFootprint(obj, key);
                                    break;
                            }
                        });
                        const proto = (obj as FuncLike).prototype;
                        if (this._isTarget(footprint.name, proto)) {
                            Object.getOwnPropertyNames(proto).forEach(key => {
                                switch (this.getSource(proto, key, true)) {
                                    case "function":
                                        footprint.children[key] = this.getFootprint(proto[key]);
                                        break;
                                    case "getter":
                                        footprint.children[key] = this.getterFootprint(proto, key);
                                        break;
                                    case "setter":
                                        footprint.children[key] = this.setterFootprint(proto, key);
                                        break;
                                }
                            });
                        }
                    } else {
                        const constructor = (obj as ObjectLike).constructor;
                        if (this._isTarget(footprint.name, constructor)) {
                            if (this._isTarget(footprint.name, constructor)) {
                                Object.getOwnPropertyNames(constructor).forEach(key => {
                                    switch (this.getSource(constructor, key, false)) {
                                        case "function":
                                            footprint.children[`::${key}`] = this.getFootprint(constructor[key]);
                                            break;
                                        case "getter":
                                            footprint.children[`::${key}`] = this.getterFootprint(constructor, key);
                                            break;
                                        case "setter":
                                            footprint.children[`::${key}`] = this.setterFootprint(constructor, key);
                                            break;
                                    }
                                });
                            }
                            const proto = constructor?.prototype;
                            if (this._isTarget(footprint.name, proto)) {
                                Object.getOwnPropertyNames(proto).forEach(key => {
                                    switch (this.getSource(proto, key, true)) {
                                        case "function":
                                            footprint.children[key] = this.getFootprint(proto[key]);
                                            break;
                                        case "getter":
                                            footprint.children[key] = this.getterFootprint(proto, key);
                                            break;
                                        case "setter":
                                            footprint.children[key] = this.setterFootprint(proto, key);
                                            break;
                                    }
                                });
                            }
                        }
                    }
                }
                break;
            case 'file':
            case 'module':
            case 'namespace':
                footprint.children = {};
                for (const [k, v] of Object.entries(obj)) {
                    footprint.children[k] = this.report(v);
                }
                break;
        }
        return footprint;
    }

    // endregion report
}
