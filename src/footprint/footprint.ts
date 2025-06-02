import {$descriptor, $dev, $log, Arr, Func} from "@leyyo/common";
import {
    FootprintInspected,
    FootprintKeyword,
    FootprintLike,
    FootprintParamNameExtended,
    FootprintPrepared,
    FootprintSecure
} from "./index.types";
import {FQN_PCK} from "./internal";
import {core} from "../core";
import {$$coreInternalOn} from "../internal";
import {FootprintSign} from "./index.symbols";
import {FinalClassSign} from "../reflection/index.symbols";


export class Footprint implements FootprintLike, FootprintSecure {
    private readonly arrayFields = ['keywords', 'params'];
    private readonly primitiveFields = ['proto', 'constructor', 'parent'];

    private readonly logger = $log.create(Footprint);

    // region internal
    private _read(callback: Func, toStr = false): string | Func {
        try {
            const val = callback();
            if (!val) {
                return null;
            }
            return toStr ? val.toString().substring(0, 100) : val;
        } catch (e) {
            return null;
        }
    }

    private _parseFuncPart(rec: FootprintPrepared, prefix: string, keywords: Array<FootprintKeyword>): boolean {
        if (!rec.func.startsWith(prefix)) {
            return false;
        }
        rec.keywords.push(...keywords);
        rec.paramLine = rec.func.substring(prefix.length - 1).trim();
        return true;
    }

    private _removeStackItem(stack: Array<string>, prefix: string): boolean {
        const current = stack[stack.length - 1];
        if (current.startsWith(prefix)) {
            // console.log(`${current} finished`);
            stack.pop();
            return true;
        } else if (stack.length < 1) {
            return false;
        }
        // console.log(`${current} by-passed`);
        stack.pop();
        return this._removeStackItem(stack, prefix);
    }

    private _parseParamNames(fullPath: string): Array<string> {
        // console.log(`Start[${fullPath}]`);
        // console.log(`-----------------------`);
        let i = 0;
        let other = 0;
        const arr = [];
        if (fullPath[0] === '(') {
            i++;
            let collected = '';
            const stack = [];
            stack.push('in-param');
            // console.log(`Init[${fullPath[i]}]`);
            // console.log(`-----------------------`);
            while (i < fullPath.length) {
                const current = stack[stack.length - 1];
                const chr = fullPath[i];
                i++;
                switch (chr) {
                    case "/":
                        if (current.startsWith('other-/')) {
                            continue;
                        }
                        if (fullPath[i] === '*') {
                            i++;
                            other++;
                            // console.log(`>> Next[${i}]: ${chr} ==> other-*-${other}`);
                            stack.push(`other-*-${other}`);
                        } else if (fullPath[i] === '/') {
                            i++;
                            other++;
                            // console.log(`>> Next[${i}]: ${chr} ==> other-/-${other}`);
                            stack.push(`other-/-${other}`);
                        }
                        continue;
                    case '*':
                        if (fullPath[i] === '/') {
                            i++;
                            if (current.startsWith('other-*')) {
                                // console.log(`<< Back[${i}]: ${chr} ==> ${current}`);
                                stack.pop();
                            } else {
                                throw new Error(`Error, index: ${i}, which: ${stack.join(',')}`)
                            }
                        }
                        continue;
                    case '\n':
                    case '\r':
                        if (current.startsWith('other-/')) {
                            // console.log(`<< Back[${i}]: ${chr} ==> ${current}`);
                            stack.pop();
                        }
                        continue;
                    case '.':
                        if (current.startsWith('other-/') || current.startsWith('other-*')) {
                            continue;
                        }
                        if (current === 'in-param') {
                            if (fullPath[i] === '.' && fullPath[i + 1] === '.') {
                                i++;
                                i++;
                                collected += '...';
                            } else {
                                throw new Error(`Error, index: ${i}, which: ${stack.join(',')}`)
                            }
                        }
                        continue;
                    case ',':
                        if (current.startsWith('other-/') || current.startsWith('other-*')) {
                            continue;
                        }
                        if (current === 'in-param') {
                            if (collected !== '') {
                                arr.push(collected);
                                collected = '';
                            }
                        } else if (current.startsWith('other-def')) {
                            // console.log(`<< Back[${i}]: ${chr} ==> ${current}`);
                            stack.pop();
                        }
                        continue;
                    case ')':
                        if (current.startsWith('other-/') || current.startsWith('other-*')) {
                            continue;
                        }
                        if (current === 'in-param') {
                            if (collected !== '') {
                                arr.push(collected);
                                collected = '';
                            }
                            return arr;
                        } else {
                            if (current.startsWith('other-def') || current.startsWith('other-(')) {
                                // console.log(`<< Back[${i}]: ${chr} ==> ${current}`);
                                stack.pop();
                                if (stack[stack.length - 1] === 'in-param') {
                                    return arr;
                                }
                            } else {
                                const found = this._removeStackItem(stack, 'other-(');
                                if (!found) {
                                    throw new Error(`Error, index: ${i}, which: ${stack.join(',')}`)
                                }
                            }
                        }
                        continue;
                    case '=':
                        if (current.startsWith('other-/') || current.startsWith('other-*')) {
                            continue;
                        }
                        if (current === 'in-param') {
                            if (collected !== '') {
                                collected += '==';
                                arr.push(collected);
                                collected = '';
                            }
                            other++;
                            // console.log(`>> Next[${i}]: ${chr} ==> other-def-${other}`);
                            stack.push(`other-def-${other}`);
                        }
                        continue;
                    case "(":
                        if (current.startsWith('other-/') || current.startsWith('other-*')) {
                            continue;
                        }
                        other++;
                        // console.log(`>> Next[${i}]: ${chr} ==> other-(-${other}`);
                        stack.push(`other-(-${other}`);
                        continue;
                    case "[":
                        if (current.startsWith('other-/') || current.startsWith('other-*')) {
                            continue;
                        }
                        other++;
                        // console.log(`>> Next[${i}]: ${chr} ==> other-[-${other}`);
                        stack.push(`other-[-${other}`);
                        continue;
                    case ']':
                        if (current.startsWith('other-/') || current.startsWith('other-*')) {
                            continue;
                        }
                        if (current.startsWith('other-def') || current.startsWith('other-[')) {
                            // console.log(`<< Back[${i}]: ${chr} ==> ${current}`);
                            stack.pop();
                        } else {
                            const found = this._removeStackItem(stack, 'other-[');
                            if (!found) {
                                throw new Error(`Error, index: ${i}, which: ${stack.join(',')}`)
                            }
                        }
                        continue;
                    case "{":
                        if (current.startsWith('other-/') || current.startsWith('other-*')) {
                            continue;
                        }
                        other++;
                        // console.log(`>> Next[${i}]: ${chr} ==> other-{-${other}`);
                        stack.push(`other-{-${other}`);
                        continue;
                    case '}':
                        if (current.startsWith('other-/') || current.startsWith('other-*')) {
                            continue;
                        }
                        if (current.startsWith('other-def') || current.startsWith('other-{')) {
                            // console.log(`<< Back[${i}]: ${chr} ==> ${current}`);
                            stack.pop();
                        } else {
                            const found = this._removeStackItem(stack, 'other-{');
                            if (!found) {
                                throw new Error(`Error, index: ${i}, which: ${stack.join(',')}`)
                            }
                        }
                        continue;
                    default:
                        if (current.startsWith('other-/') || current.startsWith('other-*')) {
                            continue;
                        }
                        if (current === 'in-param') {
                            collected += chr;
                        }
                        break;
                }
            }
            if (collected !== '') {
                arr.push(collected);
            }
        }
        // console.log(`-----------------------`);
        // console.log(`found`, arr);
        return arr;
    }

    private _prepare(target: unknown): FootprintPrepared {
        const fn = target as Func;
        const prepared = {
            type: typeof target,
            name: this._read(() => fn.name),
            object: this._read(() => Object.prototype.toString.call(fn)),
            proto: this._read(() => fn.prototype),
            constructor: this._read(() => fn.constructor),
            func: this._read(() => Function.prototype.toString.call(fn)),
            parent: this._read(() => Object.getPrototypeOf(fn)),
            keywords: [],
            paramLine: null,
        } as FootprintPrepared;
        if (prepared.proto) {
            const protoStr = prepared.proto.toString();
            if (protoStr.startsWith('[object ')) {
                prepared.proto = protoStr.substring(8, protoStr.indexOf(']')).trim();
                if (prepared.proto === 'Object') {
                    prepared.proto = null;
                }
            }
        }
        return prepared;
    }

    private _forObject(prepared: FootprintPrepared, inspected: FootprintInspected): void {
        if (prepared.parent) {
            if (prepared.constructor) {
                if (prepared.constructor.name) {
                    inspected.constructor = prepared.constructor;
                } else {
                    inspected.constructor = {name: prepared.object.substring(7, prepared.object.indexOf(']')).trim()} as Func;
                }
            }
        } else if (prepared.constructor) {
            inspected.constructor = prepared.constructor;
        } else if (prepared.object) {
            inspected.constructor = {name: prepared.object.substring(7, prepared.func.indexOf(']')).trim()} as Func;
        }
    }

    private _forClass(prepared: FootprintPrepared, inspected: FootprintInspected): void {
        inspected.type = 'class';
        const className = prepared.func.substring(5, prepared.func.indexOf('{')).trim();
        if (className === '') {
            inspected.keywords.push('anonymous');
        } else if (className.startsWith('extends ')) {
            inspected.keywords.push('anonymous', 'inherited');
            inspected.parent = prepared.parent;
        } else if (className.includes(' extends ')) {
            inspected.keywords.push('inherited');
            inspected.parent = prepared.parent;
        }
        if (inspected.parent && $descriptor.has(inspected.parent, FinalClassSign)) {
            throw $dev.developerError({
                issue: 'final.class.is.inherited',
                clazz: inspected.parent.name,
                where: 'leyyo.footprint.Footprint'
            });
        }
    }

    private _forFunction(prepared: FootprintPrepared, inspected: FootprintInspected): void {
        if (prepared.func.substring(0, prepared.func.indexOf('(')).trim() === '') {
            prepared.keywords.push('arrow');
            if (prepared.func.startsWith('async ')) {
                prepared.keywords.push('async');
                prepared.paramLine = prepared.func.substring(6, prepared.func.indexOf('=>')).trim();
            } else {
                prepared.paramLine = prepared.func.substring(0, prepared.func.indexOf('=>')).trim();
            }
        } else if (
            !this._parseFuncPart(prepared, 'async(', ['arrow', 'async']) &&
            !this._parseFuncPart(prepared, `async function ${prepared.name}(`, ['func', 'async']) &&
            !this._parseFuncPart(prepared, `async function*${prepared.name}(`, ['func', 'async', 'generator']) &&
            !this._parseFuncPart(prepared, 'async function(', ['func', 'async']) &&
            !this._parseFuncPart(prepared, 'async function*(', ['func', 'async', 'generator']) &&
            !this._parseFuncPart(prepared, `async ${prepared.name}(`, ['method', 'async']) &&
            !this._parseFuncPart(prepared, `async*${prepared.name}(`, ['method', 'async', 'generator']) &&
            !this._parseFuncPart(prepared, `function ${prepared.name}(`, ['func']) &&
            !this._parseFuncPart(prepared, `function*${prepared.name}(`, ['func', 'generator']) &&
            !this._parseFuncPart(prepared, 'function(', ['func']) &&
            !this._parseFuncPart(prepared, 'function*(', ['func', 'generator']) &&
            !this._parseFuncPart(prepared, `${prepared.name}(`, ['method']) &&
            !this._parseFuncPart(prepared, `*${prepared.name}(`, ['method', 'generator'])) {
            // not found
        }
        if (!prepared.name) {
            prepared.keywords.push('lambda');
        }
        if (prepared.paramLine) {
            if (!prepared.paramLine.startsWith('(')) {
                prepared.paramLine = `(${prepared.paramLine})`;
            }

        }
        const paramNames = this._parseParamNames(prepared.paramLine);
        const params = paramNames
            .map((p: string) => p.trim())
            .map((p: string) => {
                if (p.startsWith('...')) {
                    return [p.replace((/\./g), '').trim(), 'variadic'] as FootprintParamNameExtended;
                } else if (p.endsWith('=')) {
                    return [p.replace(/=/g, '').trim(), 'default'] as FootprintParamNameExtended;
                }
                return p;
            });
        if (prepared.proto) {
            prepared.keywords.push('system');
        }
        inspected.keywords.push(...prepared.keywords);
        inspected.params.push(...params);
    }

    private _forOthers(prepared: FootprintPrepared, inspected: FootprintInspected): void {
        if (prepared.constructor?.name) {
            inspected.constructor = prepared.constructor;
        }
    }

    private _initialize(prepared: FootprintPrepared): FootprintInspected {
        return {
            type: prepared.type,
            name: prepared.name,
            proto: prepared.proto,
            keywords: [],
            params: []
        } as FootprintInspected;
    }

    // endregion internal

    // region regular
    get(target: unknown, inspectWhenAbsent?: boolean): FootprintInspected {
        let inspected = $descriptor.getValue<FootprintInspected>(target, FootprintSign);
        if (inspected) {
            return {...inspected}; // response cloned
        }
        if (inspectWhenAbsent) {
            inspected = this.inspect(target);
            if (inspected) {
                return {...inspected};
            }
        }
        return null;
    }

    isClass(target: unknown, volatile?: boolean): boolean {
        const inspect = this.inspect(target, volatile);
        return inspect?.type === 'class';
    }

    isAsync(target: unknown, volatile?: boolean): boolean {
        const inspect = this.inspect(target, volatile);
        return inspect?.keywords.includes('async');
    }

    copy(source: unknown, target: unknown): boolean {
        const inspected = core.footprint.inspect(source);
        if (inspected) {
            core.footprint.$secure.$save(target, inspected);
            return true;
        }
        return false;
    }

    appendKeyword(target: unknown, keyword: symbol): void {
        const inspect = this.inspect(target, false);
        if (inspect) {
            if (!Array.isArray(inspect.keywords)) {
                inspect.keywords = [];
            }
            if (!inspect.keywords.includes(keyword)) {
                inspect.keywords.push(keyword);
            }
        }
    }
    hasKeyword(target: unknown, keyword: FootprintKeyword|symbol): boolean {
        const inspect = this.inspect(target, false);
        if (inspect) {
            return Array.isArray(inspect.keywords) && inspect.keywords.includes(keyword);
        }
        return false;
    }

    inspect(target: unknown, volatile?: boolean): FootprintInspected {
        const existed = this.get(target);
        if (existed) {
            return existed;
        }
        try {
            const prepared = this._prepare(target);
            const inspected = this._initialize(prepared);

            if (prepared.type === 'object') {
                this._forObject(prepared, inspected);
            } else if (prepared.func?.startsWith('class')) {
                this._forClass(prepared, inspected);
            } else if (prepared.type === 'function') {
                this._forFunction(prepared, inspected);
            } else {
                this._forOthers(prepared, inspected);
            }
            this.arrayFields.forEach(f => {
                if (Array.isArray(inspected[f]) && (inspected[f] as Arr).length < 1) {
                    delete inspected[f];
                }
            });
            this.primitiveFields.forEach(f => {
                if (!inspected[f]) {
                    delete inspected[f];
                }
            });

            if (!volatile) {
                this.$save(target, inspected);
                if (inspected.type === 'class') {
                    if (inspected.keywords) {
                        this.logger.debug(`${inspected.name} is inspected as ${inspected.type}`, {
                            keywords: inspected.keywords
                        });
                    } else {
                        this.logger.debug(`${inspected.name} is inspected as ${inspected.type}`);
                    }
                }
            }
            return inspected;
        } catch (e) {
            this.logger.warn(e, {issue: 'footprint.inspect.error'});
            return null;
        }
    }


    // endregion regular

    // region secure

    $save(target: unknown, value: FootprintInspected): boolean {
        return $descriptor.save(target, FootprintSign, value);
    }

    get $back(): FootprintLike {
        return this;
    }

    get $secure(): FootprintSecure {
        return this;
    }

    // endregion secure

}

$$coreInternalOn('class-pool-2', () => {
    core.$secure.$setFootprint(new Footprint());
});
$$coreInternalOn('class-instance', () => {
    core.fqnHandler.clazz(Footprint, FQN_PCK);
});
