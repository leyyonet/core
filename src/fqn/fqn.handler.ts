import {
    $assert,
    $descriptor,
    $dev,
    $fqn,
    $hook,
    $is,
    $log, $name,
    $sys,
    Arr,
    ClassLike,
    CommonFqnHook,
    FqnDefinedProvider,
    FqnStereoType,
    Func,
    KeyValue,
    LeyyoCommonHook,
    Obj
} from "@leyyo/common";
import {FqnDetail, FqnGroupType, FqnHandlerLike, FqnHandlerSecure, FqnNaming} from "./index.types";
import {FootprintInspected, FootprintKeyword} from "../footprint";
import {core} from "../core";
import {FQN_PCK} from "./internal";
import {$$coreInternalOn} from "../internal";
import {FqnAllSign} from "./index.symbols";


export class FqnHandler implements FqnHandlerLike, FqnHandlerSecure {

    private readonly logger = $log.create(FqnHandler);

    constructor() {
        this._register.bind(this);
        this.get.bind(this);
        this.exists.bind(this);

        $hook.defineProvider(LeyyoCommonHook.fqnPendingRegister, FqnHandler, {
            proper: true,
            name: this.get,
            exists: this.exists,
            register: this._register,
        } as FqnDefinedProvider);
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
                this.logger.deploy.$warning(FQN_PCK, 100, {name, type, message: 'Unknown target type'})
                break;
        }
    }

    private _isEffectiveTarget(name: string, target: Func | ClassLike): boolean {
        return target && ['function', 'object'].includes(typeof target) && !$sys.isSysClass(name);
    }

    private _isValidMethod(target: Func | Obj, key: string): boolean {
        const desc = $descriptor.get(target, key, true);
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
            if (!$is.func(target)) {
                this.logger.deploy.$warning(FQN_PCK, 100, {type: typeof target, message: 'Invalid function'})
                return false;
            }
        }
        // already defined
        if (this.exists(target)) {
            if (isDeco) {
                this._addDecoKeyword(target);
            }
            return true;
        }
        const inspected = core.footprint.inspect(target);
        if (!inspected || inspected.type !== 'function') {
            this.logger.deploy.$warning(FQN_PCK, 100, {type: typeof target, message: 'Invalid function'});
            return false;
        }
        const full = this._full(target.name, path);
        if (full) {
            const naming = {basic: target.name, full, pck: path} as FqnNaming;
            this.$set(target, naming);
            this.logger.debug(`function: ${full}`);
            if (isDeco) {
                this._addDecoKeyword(target);
            }
            // call waiting hooks
            $fqn.$secure.$runHooks(target, full);

            return true;
        }
        return false;
    }

    private _possibleLiteral(name: string, target: Arr, path: string, possible: boolean, inside: boolean): boolean {
        if (inside) {
            if (!Array.isArray(target)) {
                this.logger.deploy.$warning(FQN_PCK, 100, {type: typeof target, name, message: 'Invalid literal array'});
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
            this.logger.deploy.$warning(FQN_PCK, 100, {type: typeof target, name, inspected, message: 'Invalid literal'});
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
            const naming = {basic: name, full, pck: path} as FqnNaming;
            this.$set(target, naming);
            this.logger.debug(`literal: ${full} ${possible ? '#possible' : ''}`);

            // call waiting hooks
            $fqn.$secure.$runHooks(target, full);

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
            $name.set(fn as Func, name);

            core.footprint.$secure.$save(fn, inspected);
        } catch (e) {
            this.logger.warn(e, {name, fn, inspected, issue: 'rename.anonymous'});
            return false;
        }
        return true;
    }

    private _object(name: string, target: Obj, path: string, inside: boolean): boolean {
        if (inside) {
            if (!$is.object(target)) {
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
            this.logger.deploy.$warning(FQN_PCK, 100, {type: typeof target, name, inspected, message: 'Invalid object'});
            return false;
        }
        if (inspected.constructor?.name !== 'Object') {
            // constructor should be an object
            this.logger.deploy.$warning(FQN_PCK, 100, {type: typeof target, name, inspected, message: 'Invalid object construction'});
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
            const naming = {basic: name, full, pck: path} as FqnNaming;
            this.$set(target, naming);
            this.logger.debug(`object: ${full}`);

            // call waiting hooks
            $fqn.$secure.$runHooks(target, full);

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

    private _group(name: string, target: Obj, kind: FqnGroupType, path: string): void {
        $assert.func(target, () => $dev.opt({field: 'target', method: 'group', kind, where: 'leyyo.fqn.FqnHandler'}));
        $assert.text(path, () => $dev.opt({field: 'path', method: 'group', kind, where: 'leyyo.fqn.FqnHandler'}));

        if (kind !== 'file') {
            if (Object.keys(target).length !== 1) {
                this.logger.deploy.$warning(FQN_PCK, 100, {type: typeof target, name, message: 'Group should have only one child'});
                return;
            }
            const [key, item] = Object.entries(target)[0];
            name = key;
            target = item;
        }
        $assert.text(name, () => $dev.opt({field: 'name', method: 'group', kind, where: 'leyyo.fqn.FqnHandler'}));

        for (const [member, item] of Object.entries(target)) {
            this._groupItem(member, item, `${path}.${name}`, kind !== 'file');
        }
    }

    private _possibleEnum(name: string, target: Obj, path: string, possible: boolean, inside: boolean): boolean {
        if (inside) {
            if (!$is.object(target)) {
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
            this.logger.deploy.$warning(FQN_PCK, 100, {type: typeof target, name, message: 'Invalid enum'});
            return false;
        }
        if (inspected.constructor !== Object) {
            // constructor should be an object
            this.logger.deploy.$warning(FQN_PCK, 100, {type: typeof target, name, message: 'Invalid enum constructor'});
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
            const desc = $descriptor.get(target, key, true);
            if (desc) {
                if (typeof desc.get === 'function' || typeof desc.set === 'function') {
                    // property has getter or setter
                    return false;
                }
                if (!$is.typeOf(desc.value, 'string', 'number')) {
                    // property type is not string or number
                    return false;
                }
            }
        }

        const full = this._full(name, path);
        if (full) {
            const naming = {basic: name, full, pck: path} as FqnNaming;
            this.$set(target, naming);
            this.logger.debug(`enum: ${full} ${possible ? '#possible' : ''}`);

            // call waiting hooks
            $fqn.$secure.$runHooks(target, full);

            return true;
        }
        return false;
    }

    private _clazzMembers(holder: Func | Obj, naming: FqnNaming, keyword: FootprintKeyword): void {
        Object.getOwnPropertyNames(holder).forEach(property => {
            if (this._isValidMethod(holder, property)) {
                const inspectedMember = core.footprint.inspect(holder[property]);
                // names should be same, otherwise, another function body can be set on this method
                if (inspectedMember && inspectedMember.name === property) {
                    let changed = false;
                    if (!inspectedMember.keywords) {
                        inspectedMember.keywords = [];
                    }
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
                    const newNaming = {...naming};
                    newNaming.pck = naming.full;
                    newNaming.full = `${newNaming.pck}${keyword === 'instance' ? '.' : '::'}${property}`;
                    newNaming.basic = property;
                    this.$set(holder[property], newNaming);

                }
            }
        });
    }

    private _clazz(target: Func | ClassLike, path: string, inside: boolean): boolean {
        if (inside) {
            if (!$is.func(target)) {
                return false;
            }
        }
        // already defined
        if (this.exists(target)) {
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
            this.logger.deploy.$warning(FQN_PCK, 100, {type: typeof target, message: 'Invalid class'});
            return false;
        }
        // check parent
        if (inspected.parent) {
            this._clazz(inspected.parent, null, true);
        }

        const full = this._full(target.name, path);
        if (full) {
            const naming = {basic: target.name, full, pck: path} as FqnNaming;
            this.$set(target, naming);
            this.logger.debug(`class: ${full}`);

            // instance-members
            if (this._isEffectiveTarget(target.name, target.prototype)) {
                this._clazzMembers(target.prototype, naming, 'instance');
            }

            // static-members
            this._clazzMembers(target, naming, 'static');

            // call waiting hooks
            $fqn.$secure.$runHooks(target, full);
        }
    }


    get(target: any): string {
        if (!target) {
            return null;
        }
        let naming: FqnNaming;
        const type = typeof target;
        switch (type) {
            case "string":
                return target;
            case "function":
                naming = this.$get(target);
                return naming ? naming.full : (target as Func).name;
            case "object":
                naming = this.$get(target);
                if (naming) {
                    return naming.full;
                }
                if (target.constructor) {
                    return this.get(target.constructor);
                }
        }
        return `type:${type}`;
    }

    remove(target: any): boolean {
        if (!target) {
            return false;
        }
        return $is.typeOf(target, 'function', 'object') ? $descriptor.remove(target, FqnAllSign, true) : false;
    }

    exists(target: any): boolean {
        return !!$descriptor.get(target, FqnAllSign);
    }

    detail(target: any): FqnDetail {
        return {
            ...core.footprint.inspect(target),
            full: this.get(target),
        } as FqnDetail;
    }

    onReady(fn: Func | ClassLike | Obj, callback: CommonFqnHook): void {
        $fqn.$secure.$appendHook(fn, callback);
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
        $assert.text(name, () => $dev.opt({field: 'name', where: 'leyyo.fqn.FqnHandler', method: 'normalizeName'}));
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

    copy(source: any, target: any): void {
        if (this.exists(source)) {
            this.$set(target, this.$get(source));
        }
    }
    toNaming(name: string): FqnNaming {
        name = this.normalizeName(name);
        if (!name) {
            return {basic: undefined, full: undefined, pck: undefined};
        }
        if (!name.includes('.')) {
            return {basic: name, full: name, pck: undefined};
        }
        const parts = name.split('.');
        const basic = parts.pop();
        const pck = parts.join('.');
        return {basic, full: `${pck}.${basic}`, pck};
    }

    clazz(target: Func | ClassLike, path: string): void {
        $assert.func(target, () => $dev.opt({field: 'target', where: 'leyyo.fqn.FqnHandler', method: 'clazz'}));
        $assert.text(path, () => $dev.opt({
            field: 'path',
            where: 'leyyo.fqn.FqnHandler',
            method: 'clazz',
            name: target.name
        }));
        this._clazz(target, path, false);
    }

    func(target: Func, path: string): void {
        $assert.func(target, () => $dev.opt({field: 'target', where: 'leyyo.fqn.FqnHandler', method: 'func'}));
        $assert.text(path, () => $dev.opt({
            field: 'path',
            where: 'leyyo.fqn.FqnHandler',
            method: 'func',
            name: target.name
        }));
        this._func(target, path, false);
    }

    decorator(target: Func, path: string): void {
        $assert.func(target, () => $dev.opt({field: 'target', where: 'leyyo.fqn.FqnHandler', method: 'decorator'}));
        $assert.text(path, () => $dev.opt({
            field: 'path',
            where: 'leyyo.fqn.FqnHandler',
            method: 'decorator',
            name: target.name
        }));
        this._func(target, path, false, true);
    }

    enumeration(name: string, target: Obj | Record<string, KeyValue>, path: string): void {
        $assert.text(name, () => $dev.opt({field: 'name', where: 'leyyo.fqn.FqnHandler', method: 'enumeration'}));
        $assert.object(target, () => $dev.opt({
            field: 'target',
            where: 'leyyo.fqn.FqnHandler',
            method: 'enumeration',
            name
        }));
        $assert.text(path, () => $dev.opt({field: 'path', where: 'leyyo.fqn.FqnHandler', method: 'enumeration', name}));
        this._possibleEnum(name, target, path, false, false);
        core.enumPool.$secure.$add(target);
    }

    literal(name: string, target: unknown, path: string): void {
        $assert.text(name, () => $dev.opt({field: 'name', where: 'leyyo.fqn.FqnHandler', method: 'literal'}));
        $assert.array(target, () => $dev.opt({
            field: 'target',
            where: 'leyyo.fqn.FqnHandler',
            method: 'literal',
            name
        }));
        $assert.text(path, () => $dev.opt({field: 'path', where: 'leyyo.fqn.FqnHandler', method: 'literal', name}));
        this._possibleLiteral(name, target as Array<KeyValue>, path, false, false);
        core.enumPool.$secure.$add(target);
    }

    object(name: string, target: Obj, path: string): void {
        $assert.text(name, () => $dev.opt({field: 'name', where: 'leyyo.fqn.FqnHandler', method: 'object'}));
        $assert.object(target, () => $dev.opt({
            field: 'target',
            where: 'leyyo.fqn.FqnHandler',
            method: 'object',
            name
        }));
        $assert.text(path, () => $dev.opt({field: 'path', where: 'leyyo.fqn.FqnHandler', method: 'object', name}));
        this._object(name, target, path, false);
    }

    file(name: string, target: Obj, path: string): void {
        $assert.text(name, () => $dev.opt({field: 'name', where: 'leyyo.fqn.FqnHandler', method: 'file'}));
        $assert.object(target, () => $dev.opt({field: 'target', where: 'leyyo.fqn.FqnHandler', method: 'file', name}));
        $assert.text(path, () => $dev.opt({field: 'path', where: 'leyyo.fqn.FqnHandler', method: 'file', name}));
        this._group(name, target, 'file', path);
    }

    module(target: Obj, path: string): void {
        $assert.object(target, () => $dev.opt({field: 'target', where: 'leyyo.fqn.FqnHandler', method: 'module'}));
        $assert.text(path, () => $dev.opt({field: 'path', where: 'leyyo.fqn.FqnHandler', method: 'module'}));
        this._group(null, target, 'module', path);
    }

    namespace(target: Obj, path: string): void {
        $assert.object(target, () => $dev.opt({field: 'target', where: 'leyyo.fqn.FqnHandler', method: 'namespace'}));
        $assert.text(path, () => $dev.opt({field: 'path', where: 'leyyo.fqn.FqnHandler', method: 'namespace'}));
        this._group(null, target, 'namespace', path);
    }

    get $back(): FqnHandlerLike {
        return this;
    }

    get $secure(): FqnHandlerSecure {
        return this;
    }
    $set(target: any, naming: FqnNaming): boolean {
        switch (typeof target) {
            case "function":
                return $descriptor.save<FqnNaming>(target, FqnAllSign, naming, true);
            case "object":
                break;
        }
        return false;
    }
    $get(target: any): FqnNaming {
        if (['function', 'object'].includes(typeof target)) {
            return $descriptor.getValue<FqnNaming>(target, FqnAllSign);
        }
        return undefined;
    }
}

$$coreInternalOn('class-pool-2', () => {
    core.$secure.$setFqnHandler(new FqnHandler());
});
$$coreInternalOn('class-instance', () => {
    core.fqnHandler.clazz(FqnHandler, FQN_PCK);
});
