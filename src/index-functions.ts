import util from "util";
import {FuncLike, ObjectLike, RecLike} from "./index-aliases";
import {CoreLike, CoreOptionLike} from "./index-types";
import {FQN_NAME} from "./internal-component";

let lyy: CoreLike;

// region general
export function ths<T>(data: T): T {
    return data;
}
export function emptyFn(...params: Array<unknown>): void {}
export function secureJson<E = unknown>(value: unknown): E {
    return _secureJson(value, 0, new WeakSet<ObjectLike>()) as E;
}
function _fnName(fn: FuncLike): string {
    if (typeof lyy?.fqnPool?.name === 'function') {
        return lyy.fqnPool.name(fn);
    }
    return fn?.name ?? null;
}
function _secureJson(value: unknown, level: number, set: WeakSet<ObjectLike>): unknown {
    if ([null, undefined].includes(value)) {
        return null;
    }
    switch (typeof value) {
        case 'object':
            if (set.has(value)) {
                return `<circular>${_fnName(value?.constructor)}`;
            }
            if (level >= 10) {
                return `<max-depth>${_fnName(value?.constructor)}`;
            }
            set.add(value);
            if (Array.isArray(value)) {
                return value.map(item => _secureJson(item, level + 1, set));
            }
            const obj = {};
            if (value instanceof Map) {
                for (const [k, v] of value.entries()) {
                    obj[k] = JSON.parse(JSON.stringify(_secureJson(v, level + 1, set)));
                }
            }
            else if (value instanceof Set) {
                return Array.from(value).map(item => _secureJson(item, level + 1, set));
            }
            else {
                for (const [k, v] of Object.entries(value)) {
                    obj[k] = JSON.parse(JSON.stringify(_secureJson(v, level + 1, set)));
                }
            }
            return obj;
        case 'function':
            return `<function>${_fnName(value)}`;
        case 'symbol':
            return `<symbol>${value.toString()}`;
    }
    return value;
}

export function opt(opt?: RecLike): CoreOptionLike {
    return lyy.opt(opt);
}
export function printDetailed(...params: Array<unknown>) {
    console.log(...params.map(p => p ? util.inspect(secureJson(p), {showHidden: false, depth: 10, colors: true}) : p));
}
// endregion general

// region test
interface TestError {
    name:string;
    message:string;
    generatedMessage:boolean,
    code:string;
    expected?:unknown;
    actual?:unknown;
    operator:string;
}
interface TestItem {
    type: 'describe'|'it';
    ident: number;
    color: number;
    sign: string;
    title: string;
    success: number;
    error: number;
    params: RecLike;
    children: Array<TestItem>;
}
function _pad(ident: number): string {
    let str = '';
    if (ident > 0) {
        for (let i = 0; i < ident; i++) {
            str += SPACE;
        }
    }
    return str;
}
function _colorize(item: TestItem): string {
    return _pad(item.ident) + `\x1b[${item.color}m${item.sign}\x1b[0m \x1b[2m${item.title}\x1b[0m`;
}
function _item(item: Partial<TestItem>): TestItem {
    return {...{ident: IDENT, color: COLOR_YELLOW, sign: '?', title: '??', success: 0, error: 0, params: {}, children: []}, ...item} as TestItem;
}
function _print(item: TestItem): void {
    const message = _colorize(item);
    console.log(message);
    if (Object.keys(item.params).length > 1) {
        const err = item.params as unknown as TestError;
        for (const [k, v] of Object.entries(err)) {
            if (!['name', 'generatedMessage', 'code'].includes(k) && v !== undefined) {
                console.log(_pad(item.ident + 1) + `\x1b[${COLOR_YELLOW}m*\x1b[0m ${k}`, `\x1b[${COLOR_YELLOW}m${JSON.stringify(secureJson(v))}\x1b[0m`);
            }
        }
    }
    Object.values(item.children).forEach(child => _print(child));
}
function _error(e: Error): RecLike {
    const obj = {name: e.name, message: e.message};
    Object.getOwnPropertyNames(e).forEach(key => {
        if (!['name', 'message', 'stack'].includes(key) && typeof e[key] !== 'function') {
            obj[key] = e[key];
        }
    });
    return obj;
}

const COLOR_GREEN = 32;
const COLOR_RED = 31;
const COLOR_MAGENTA = 35;
const COLOR_CYAN = 36;
const COLOR_YELLOW = 33;
const SPACE = '   ';
let PARENT = 0;
let IDENT = 0;
let COUNT = 0;
const ARR = {} as Record<number, TestItem>;

function _start(): void {
    PARENT = 0;
    IDENT = 0;
    COUNT = 0;
    Object.keys(ARR).forEach(key => {
        delete ARR[key];
    })
}
function _end(): void {
    if (PARENT !== 0) {
        console.log('test.failed', {reason: 'parent-id', parent: PARENT});
        process.exit(1);
    }
    if (Object.keys(ARR).length > 0) {
        console.log('test.failed', {reason: 'not-empty-pool', parent: PARENT});
        process.exit(1);
    }
}
export function describe(title: string, fn: FuncLike): void {
    if (PARENT === 0) {
        _start();
    }
    const parentId = PARENT;
    COUNT++;
    const count = COUNT;
    PARENT = count;
    const slf = _item({title, type: "describe"});
    ARR[count] = slf;
    // console.log(`describe-${title}-${count}-${IDENT}`);
    IDENT++;
    try {
        fn();
    } catch (e) {
        slf.error++;
        slf.params = _error(e);
    }
    if (slf.error > 0) {
        if (slf.success === 0) {
            slf.sign = '⥿';
            slf.color = COLOR_MAGENTA;
        } else {
            slf.sign = '⇓';
            slf.color = COLOR_CYAN;
        }
    } else {
        slf.sign = '▼';
        slf.color = COLOR_GREEN;
    }
    let isEnd = false;
    if (parentId === 0) {
        _print(slf);
        isEnd = true;
        if (slf.error > 0) {
            console.log('test.failed', {title: slf.title, error: slf.error, success: slf.success});
            process.exit(1);
        }
    } else {
        ARR[parentId].children.push(slf);
        ARR[parentId].error += slf.error;
        ARR[parentId].success += slf.success;
    }
    delete ARR[count];
    COUNT--;
    IDENT--;
    PARENT = parentId;
    if (isEnd) {
        _end();
    }
}
export function it(title: string, fn: FuncLike): void {
    COUNT++;
    const count = COUNT;
    ARR[count] = _item({title, type: 'it'});
    const slf = ARR[count];
    // console.log(`it-${title}-${count}-${IDENT}`);
    let error = false;
    try {
        fn();
        slf.color = COLOR_GREEN;
        slf.sign = '✓';
    } catch (e) {
        slf.color = COLOR_RED;
        slf.sign = '✖';
        slf.params = _error(e);
        error = true;
    }
    ARR[PARENT].children.push(slf);
    error ? ARR[PARENT].error++ : ARR[PARENT].success++;
    delete ARR[count];
    COUNT--;
}
// endregion test

export function setForFunctions (ins: CoreLike) {
    lyy = ins;
    [ths, emptyFn, opt, printDetailed, describe, it].forEach(fn => {
        lyy.fqnPool.func(fn, ...FQN_NAME);
    });
}
