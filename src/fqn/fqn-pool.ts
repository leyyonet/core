import {
    Arr,
    assertion,
    ClassLike,
    CommonFqnHook,
    commonLog,
    FqnDefinedProvider,
    FqnSignHook,
    FqnStereoType,
    Func,
    hook,
    is,
    KeyValue,
    LY_PENDING_FQN_REGISTER,
    Obj,
    system
} from "@leyyo/common";
import {FqnDetail, FqnGroupType, FqnName, FqnPath, FqnPoolLike, FqnPoolSecure} from "./index-types";
import {FootprintInspected, FootprintKeyword} from "../footprint";
import {core} from "../core";
import {FQN_PCK, FqnSignName} from "./internal";

// console.log(__filename);

export class FqnPool implements FqnPoolLike, FqnPoolSecure {

    private readonly logger = commonLog.create(FqnPool);

    constructor() {
        this._register.bind(this);
        this.get.bind(this);
        this.exists.bind(this);

        hook.defineProvider(LY_PENDING_FQN_REGISTER, FqnPool, {
            proper: true,
            name: this.get,
            exists: this.exists,
            register: this._register,
        } as FqnDefinedProvider);

        this.clazz(FqnPool, FQN_PCK)
    }

    private _register(name: string, target: any, type: FqnStereoType, pckName: string): void {
        switch (type) {
            case "class":
                this.clazz(target, pckName);
                break;
            case "literal":
                this.literal(name, target, pckName);
                break;
            case "function":
                this.func(target, pckName);
                break;
            case "enum":
                this.enumeration(name, target, pckName);
                break;
            default:
                this.logger.warn(null, {name, type, indicator: 'unknown.target.type'});
                break;
        }
    }

    private _isEffectiveTarget(name: string, target: Func | ClassLike): boolean {
        return target && ['function', 'object'].includes(typeof target) && !system.isSysClass(name);
    }

    private _isValidMethod(target: Func | Obj, key: string): boolean {
        const desc = core.footprint.getDescriptor(target, key);
        if (!desc) {
            return false;
        }
        return typeof desc.value === 'function' && typeof desc.get !== 'function';
    }

    private _full(name: string, path: string): string {
        return path ? `${path}.${name}` : name;
    }

    private _addDecoKeyword(target: Func) {
        const inspected = core.footprint.get(target);
        if (inspected && !inspected.keywords.includes('decorator')) {
            inspected.keywords.push('decorator');
            core.footprint.$secure.$save(target, inspected);
        }
    }

    private _func(target: Func, path: string, inside: boolean, isDeco?: boolean): boolean {
        if (inside) {
            if (!is.func(target)) {
                this.logger.warn(null, {target, indicator: 'not.expected.function'});
                return false;
            }
        }
        // already defined
        if (this.get(target)) {
            if (isDeco) {
                this._addDecoKeyword(target);
            }
            return true;
        }
        const inspected = core.footprint.inspect(target);
        if (!inspected || inspected.type !== 'function') {
            this.logger.warn(null, {target, inspected, indicator: 'invalid.function'});
            return false;
        }
        const full = this._full(target.name, path);
        if (full) {
            this.$set(target, full);
            this.logger.debug('registered', {kind: 'function', full});
            if (isDeco) {
                this._addDecoKeyword(target);
            }
            // call waiting hooks
            this._runHooks(target, full);

            return true;
        }
        return false;
    }

    private _possibleLiteral(name: string, target: Arr, path: string, possible: boolean, inside: boolean): boolean {
        if (inside) {
            if (!is.array(target)) {
                this.logger.warn(null, {target, name, indicator: 'not.expected.literal.array'});
                return false;
            }
        }
        // already defined
        if (this.get(target)) {
            return true;
        }

        const inspected = core.footprint.inspect(target);
        if (!inspected) {
            return;
        }
        if (inspected.type !== 'object') {
            this.logger.warn(null, {target, name, inspected, indicator: 'invalid.literal'});
            return false;
        }
        if (inspected.constructor?.name !== 'Array') {
            // constructor should be an array
            return false;
        }
        let changed = false;
        if (!inspected.keywords.includes('literal')) {
            inspected.keywords.push('literal');
            changed = true;
        }
        if (possible && !inspected.keywords.includes('possible')) {
            inspected.keywords.push('possible');
            changed = true;
        }
        if (changed) {
            core.footprint.$secure.$save(target, inspected);
        }

        const invalidValues = target.filter(item => !['string', 'number'].includes(typeof item));
        if (invalidValues.length > 0) {
            // all items should be string or number
            return false
        }
        const full = this._full(name, path);
        if (full) {
            this.$set(target, full);
            this.logger.debug('registered', {kind: 'literal', full, possible});

            // call waiting hooks
            this._runHooks(target, full);

            return true;
        }
        return false;
    }

    private _renameAnonymous(name: string, fn: unknown, inspected: FootprintInspected): boolean {
        if (inspected.name) {
            return true;
        }
        try {
            inspected.name = name;
            core.proxy.basicName(fn as Func, name)

            core.footprint.$secure.$save(fn, inspected);
        } catch (e) {
            this.logger.warn(e, {name, fn, inspected, indicator: 'rename.anonymous'});
            return false;
        }
        return true;
    }

    private _object(name: string, target: Obj, path: string, inside: boolean): boolean {
        if (inside) {
            if (!is.object(target)) {
                return false;
            }
        }
        // already defined
        if (this.get(target)) {
            return true;
        }

        const inspected = core.footprint.inspect(target);
        if (!inspected) {
            return;
        }
        if (!inspected || inspected.type !== 'object') {
            this.logger.warn(null, {target, name, inspected, indicator: 'invalid.object'});
            return false;
        }
        if (inspected.constructor?.name !== 'Object') {
            // constructor should be an object
            this.logger.warn(null, {target, inspected, indicator: 'invalid.object.construction'});
            return false;
        }
        if (inspected.keywords.includes('enum')) {
            // this object was already signed as an enum
            return false;
        }

        for (const [, value] of Object.entries(target)) {
            if (typeof value !== 'function') {
                // property should be function
                return false;
            }
        }

        const full = this._full(name, path);
        if (full) {
            this.$set(target, full);
            this.logger.debug('registered', {kind: 'object', full});

            // call waiting hooks
            this._runHooks(target, full);

            return true;
        }
        return false;
    }

    private _groupItem(name: string, target: any, path: string, next: boolean): boolean {
        // already defined
        if (this.get(target)) {
            return true;
        }

        const inspected = core.footprint.inspect(target);
        if (!inspected) {
            return;
        }

        switch (inspected.type) {
            case 'function':
                this._renameAnonymous(name, target, inspected);
                this._func(target as Func, path, false);
                break;
            case 'class':
                this._renameAnonymous(name, target, inspected);
                this._clazz(target as Func, path, false);
                break;
            case 'object':
                if (Array.isArray(target)) {
                    this._possibleLiteral(name, target, path, true, false);
                } else {
                    if (!this._possibleEnum(name, target, path, true, false)) {
                        if (next) {
                            this._group(null, {name: target}, 'namespace', path);
                        } else {
                            this._object(name, target, path, false);
                        }
                    }
                }
                break;
        }
    }

    private _group(name: string, target: Obj, type: FqnGroupType, path: string): void {
        assertion.func(target, {indicator: 'invalid.class', where: 'fqn'});
        assertion.text(path, {indicator: 'invalid.path', where: 'fqn'});

        if (type !== 'file') {
            if (Object.keys(target).length !== 1) {
                this.logger.warn(null, {target, name, indicator: 'group.should.have.be.only.one.child'});
                return;
            }
            const [key, item] = Object.entries(target)[0];
            name = key;
            target = item;
        }
        assertion.text(name, {indicator: 'invalid.name', where: 'fqn', type});

        for (const [member, item] of Object.entries(target)) {
            this._groupItem(member, item, `${path}.${name}`, type !== 'file');
        }
    }

    private _possibleEnum(name: string, target: Obj, path: string, possible: boolean, inside: boolean): boolean {
        if (inside) {
            if (!is.object(target)) {
                return false;
            }
        }
        // already defined
        if (this.get(target)) {
            return true;
        }

        const inspected = core.footprint.inspect(target);
        if (!inspected) {
            return;
        }
        if (!inspected || inspected.type !== 'object') {
            this.logger.warn(null, {target, name, inspected, indicator: 'invalid.enum'});
            return false;
        }
        if (inspected.constructor?.name !== 'Object') {
            // constructor should be an object
            this.logger.warn(null, {target, name, inspected, indicator: 'invalid.enum.constructor'});
            return false;
        }
        let changed = false;
        if (!inspected.keywords.includes('enum')) {
            inspected.keywords.push('enum');
            changed = true;
        }
        if (possible && !inspected.keywords.includes('possible')) {
            inspected.keywords.push('possible');
            changed = true;
        }
        if (changed) {
            core.footprint.$secure.$save(target, inspected);
        }

        for (const key of Object.keys(target)) {
            const desc = core.footprint.getDescriptor(target, key);
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

        const full = this._full(name, path);
        if (full) {
            this.$set(target, full);
            this.logger.debug('registered', {kind: 'enum', full, possible});

            // call waiting hooks
            this._runHooks(target, full);

            return true;
        }
        return false;
    }

    private _clazzMembers(holder: Func | Obj, full: string, keyword: FootprintKeyword): void {
        Object.getOwnPropertyNames(holder).forEach(property => {
            if (this._isValidMethod(holder, property)) {
                const inspectedMember = core.footprint.inspect(holder[property]);
                // names should be same, otherwise, another function body can be set on this method
                if (inspectedMember && inspectedMember.name === property) {
                    let changed = false;
                    if (inspectedMember.keywords.includes('method')) {
                        inspectedMember.keywords.push('method');
                        changed = true;
                    }
                    if (inspectedMember.keywords.includes(keyword)) { // instance or static
                        inspectedMember.keywords.push(keyword);
                        changed = true;
                    }
                    if (changed) {
                        core.footprint.$secure.$save(holder[property], inspectedMember);
                    }
                    this.$set(holder[property], `${full}.${property}`);
                }
            }
        });
    }

    private _clazz(target: Func | ClassLike, path: string, inside: boolean): boolean {
        if (inside) {
            if (!is.func(target)) {
                return false;
            }
        }
        // already defined
        if (this.get(target)) {
            return true;
        }
        if (!this._isEffectiveTarget(target.name, target)) {
            return false;
        }
        const inspected = core.footprint.inspect(target);
        if (!inspected) {
            return;
        }
        if (!inspected || !['class', 'function'].includes(inspected.type)) {
            this.logger.warn(null, {target, inspected, indicator: 'invalid.class'});
            return false;
        }
        // check parent
        if (inspected.parent) {
            this._clazz(inspected.parent, null, true);
        }

        const full = this._full(target.name, path);
        if (full) {
            this.$set(target, full);
            this.logger.debug('registered', {kind: 'class', full});

            // instance-members
            if (this._isEffectiveTarget(target.name, target.prototype)) {
                this._clazzMembers(target.prototype, full, 'instance');
            }

            // static-members
            this._clazzMembers(target, full, 'static');

            // call waiting hooks
            this._runHooks(target, full);
        }
    }

    private _runHooks(fn: Func | Obj, name: string): void {
        const callbacks: Array<CommonFqnHook> = [];
        let exists = false;
        const desc = core.footprint.$secure.$getDescriptor<Array<CommonFqnHook>>(fn, FqnSignHook);
        if (desc) {
            exists = true;
            if (Array.isArray(desc.value)) {
                callbacks.push(...desc.value);
            }
        }
        if (exists) {
            callbacks.forEach(lambda => {
                try {
                    lambda(name);
                } catch (e) {
                    this.logger.warn(e, {indicator: 'fqn.hook.run.error', name});
                }
            });
            core.footprint.$secure.$saveDescriptor<Array<CommonFqnHook>>(fn, FqnSignHook, []);
        }
    }


    get(target: any): string {
        if (!target) {
            return null;
        }
        let name: string
        const type = typeof target;
        switch (type) {
            case "string":
                return target;
            case "function":
                name = core.footprint.$secure.$getDescriptor<string>(target, FqnSignName)?.value;
                return name ? name : (target as Func).name;
            case "object":
                name = core.footprint.$secure.$getDescriptor<string>(target, FqnSignName)?.value;
                if (name) {
                    return name;
                }
                if (target.constructor) {
                    return this.get(target.constructor);
                }
                return null;
        }
        return `type:${type}`;
    }
    remove(target: any): boolean {
        if (!target) {
            return false;
        }
        switch (typeof target) {
            case "function":
            case "object":
                return core.footprint.$secure.$removeDescriptor(target, FqnSignName);
        }
        return false;
    }

    exists(target: any): boolean {
        return !!core.footprint.$secure.$getDescriptor<string>(target, FqnSignName);
    }

    detail(target: any): FqnDetail {
        return {
            ...core.footprint.inspect(target),
            full: this.get(target),
        } as FqnDetail;
    }
    onReady(fn: Func|ClassLike|Obj, callback: CommonFqnHook): void {
        const callbacks: Array<CommonFqnHook> = [];
        const desc = core.footprint.$secure.$getDescriptor<Array<CommonFqnHook>>(fn, FqnSignHook);
        if (desc) {
            if (Array.isArray(desc.value)) {
                callbacks.push(...desc.value);
            }
        }
        callbacks.push(callback);
        core.footprint.$secure.$saveDescriptor<Array<CommonFqnHook>>(fn, FqnSignHook, callbacks);
    }

    protected _camelCase(name: string): string {
        if (!name.includes('_')) {
            name = name.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        }
        if (name.includes('_')) {
            name = name.replace(/(_\w)/g, k => k[1].toUpperCase());
        }
        return name[0].toUpperCase() + name.substring(1);
    }

    normalizeName(name: string): string {
        assertion.text(name, {indicator: 'fqn.invalid-name'});
        if (!name) {
            return null;
        }
        if (!name.includes('.')) {
            return this._camelCase(name);
        }
        const parts = name.split('.');
        let arr = [] as Array<string>;
        parts.forEach(part => {
            part = part.trim();
            if (part !== '') {
                arr.push(part);
            }
        });
        switch (arr.length) {
            case 0:
                return null;
            case 1:
                return this._camelCase(arr[0]);
            default:
                const last = this._camelCase(arr.pop());
                arr = arr.map(item => item.toLowerCase());
                arr.push(last);
                return arr.join('.');
        }
    }

    toFullName(name: string): FqnName {
        name = this.normalizeName(name);
        if (!name) {
            return { basic: null, full: null };
        }
        if (!name.includes('.')) {
            return { basic: name, full: name };
        }
        const parts = name.split('.');
        return { basic: parts[parts.length - 1], full: name };
    }
    toPathName(name: string): FqnPath {
        name = this.normalizeName(name);
        if (!name) {
            return { name: null, path: null };
        }
        if (!name.includes('.')) {
            return { name, path: 'leyyo' };
        }
        const parts = name.split('.');
        const basic = parts.pop();
        return { name: basic, path: parts.join('.') };
    }

    clazz(target: Func | ClassLike, path: string): void {
        assertion.func(target, {indicator: 'invalid.class', where: 'fqn'});
        assertion.text(path, {indicator: 'invalid.path', where: 'fqn'});
        this._clazz(target, path, false);
    }

    func(target: Func, path: string): void {
        assertion.func(target, {indicator: 'invalid.class', where: 'fqn'});
        assertion.text(path, {indicator: 'invalid.path', where: 'fqn'});
        this._func(target, path, false);
    }

    decorator(target: Func, path: string): void {
        assertion.func(target, {indicator: 'invalid.class', where: 'fqn'});
        assertion.text(path, {indicator: 'invalid.path', where: 'fqn'});
        this._func(target, path, false, true);
    }

    enumeration(name: string, target: Obj | Record<string, KeyValue>, path: string): void {
        assertion.text(name, {indicator: 'invalid.path', where: 'fqn'});
        assertion.object(target, {indicator: 'invalid.enum', where: 'fqn'});
        assertion.text(path, {indicator: 'invalid.path', where: 'fqn'});
        this._possibleEnum(name, target, path, false, false);
        core.enumeration.$secure.$add(target);
    }

    literal(name: string, target: unknown, path: string): void {
        assertion.text(name, {indicator: 'invalid.path', where: 'fqn'});
        assertion.array(target, {indicator: 'invalid.literal', where: 'fqn'});
        assertion.text(path, {indicator: 'invalid.path', where: 'fqn'});
        this._possibleLiteral(name, target as Array<KeyValue>, path, false, false);
        core.enumeration.$secure.$add(target);
    }

    object(name: string, target: Obj, path: string): void {
        assertion.text(name, {indicator: 'invalid.path', where: 'fqn'});
        assertion.object(target, {indicator: 'invalid.enum', where: 'fqn'});
        assertion.text(path, {indicator: 'invalid.path', where: 'fqn'});
        this._object(name, target, path, false);
    }

    file(name: string, target: Obj, path: string): void {
        assertion.text(path, {indicator: 'invalid.path', where: 'fqn'});
        assertion.text(name, {indicator: 'invalid.name', where: 'fqn'});
        this._group(name, target, 'file', path);
    }

    module(target: Obj, path: string): void {
        assertion.text(path, {indicator: 'invalid.path', where: 'fqn'});
        this._group(null, target, 'module', path);
    }

    namespace(target: Obj, path: string): void {
        assertion.text(path, {indicator: 'invalid.path', where: 'fqn'});
        this._group(null, target, 'namespace', path);
    }

    get $back(): FqnPoolLike {
        return this;
    }

    get $secure(): FqnPoolSecure {
        return this;
    }
    $set(target: any, name: string): boolean {
        return core.footprint.$secure.$saveDescriptor<string>(target, FqnSignName, name);
    }
}