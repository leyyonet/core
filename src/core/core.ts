import dotenv from 'dotenv';

import {LY_INT_FQN, LY_INT_PACKAGE} from "../internal";
import {Func0, FuncLike, ObjectLike, RecLike} from "../common";
import {CoreLike, CoreLike$$$, CoreMember} from "./types";
import {CoreLoggerLike, LoggerLike} from "../logger";
import {CoreContextLike} from "../context";
import {CoreReflectLike} from "../reflect";
import {CoreEnumLike} from "../enum";
import {CoreErrorLike} from "../error";
import {CoreFqnLike} from "../fqn";
import {CoreHookLike} from "../hook";
import {CorePackageLike} from "../package";
import {CorePrimitiveLike} from "../primitive";
import {CoreProcessorLike} from "../processor";
import {CoreRepoLike} from "../repo";
import {CoreSystemLike} from "../system";
import {CoreTestingLike} from "../testing";
import {CoreJsonLike} from "../json";
import {CoreVariableLike} from "../variable";
import {CoreCastLike} from "../cast";
import {CoreGenericsLike} from "../generics";
import {CoreInjectorLike} from "../injector";
import {CoreBinderLike} from "../binder";
import {CoreSymbolLike} from "../symbol";
import {CoreApiLike} from "../api";
import {CorePointerLike} from "../pointer";
import {CoreDecoLike} from "../deco";
import {CoreHandlerLike} from "../handler";
import {EventEmitter} from "events";
import {CoreDtoLike} from "../dto";
import {CoreMixinLike} from "../mixin";

if (global.leyyo_is_testing) {
    dotenv.config({path: __dirname + '/.env-test'});
    ['error', 'warn', 'log', 'info', 'trace', 'debug', 'native'].forEach(k => {
        console[k] = (): void => {
            //
        };
    });
} else {
    dotenv.config();
}

class Core implements CoreLike, CoreLike$$$ {

    private readonly _npmName: string;
    private readonly _npmVersion: string;
    private readonly _pwd: string;
    private readonly _event: EventEmitter;
    private _stagingLog: Array<[string, RecLike]>;

    private readonly _instanceMap = new Map<CoreMember, unknown>;
    private readonly _readySet = new Set<CoreMember>;
    private readonly _stagingSet = new Set<CoreMember>;
    private readonly _triggersMap = new Map<CoreMember, Array<Func0>>;
    private LOG: LoggerLike;
    constructor() {
        this._stagingLog = [];
        if (global.leyyo_is_local === undefined) {
            global.leyyo_is_local = ['1', 'true'].includes(process.env['IS_LOCAL']);
        }
        this._instanceMap = new Map();
        this._readySet = new Set();
        this._stagingSet = new Set();
        this._triggersMap = new Map();
        this._event = new EventEmitter();
        this._stagingSet
            .add('api')
            .add('binder')
            .add('cast')
            .add('context')
            .add('deco')
            .add('dto')
            .add('enum')
            .add('error')
            .add('fqn')
            .add('generics')
            .add('handler')
            .add('hook')
            .add('injector')
            .add('json')
            .add('logger')
            .add('mixin')
            .add('package')
            .add('pointer')
            .add('primitive')
            .add('processor')
            .add('reflect')
            .add('repo')
            .add('symbol')
            .add('system')
            .add('testing')
            .add('variable')
        ;

        this._npmName = process.env?.npm_package_name;
        this._npmVersion = process.env?.npm_package_version;
        this._pwd = process.env?.PWD;

        this.addFqn(this);
        // $ly.addTrigger('pointer', () => {this._cast = new CoreCast()});
        // $ly.addTrigger('pointer', () => {this._generics = new CoreGenerics()});
        this.addTrigger('package', () => this.package.add(LY_INT_PACKAGE));
        this.addTrigger('logger', () => {
            this.LOG = this.logger.assign(this);
            this._stagingLog.forEach(line => {
                this.LOG.debug(line[0], line[1]);
            });
            this._stagingLog = [];
        });
        this.addTrigger('processor', () => {
            this.processor.$run('loading');
            this.processor.add('beforeInjected', () => {
                if (this._triggersMap.size > 0) {
                    throw new Error('Pending triggers');
                }
            }, 'core-trigger-control');
        });
    }
    get event(): EventEmitter {
        return this._event;
    }

    addFqn(obj: ObjectLike): void {
        this.addTrigger('fqn', () => this.fqn.clazz(obj, ...LY_INT_FQN));
    }
    addDeco(fn: FuncLike, cb: Func0): void {
        this.addTrigger('fqn', () => this.fqn.deco(fn, ...LY_INT_FQN));
        if (cb) {
            this.addTrigger('reflect', cb);
        }
    }
    addError(clazz: FuncLike): void {
        this.addTrigger('error', () => this.error.add(clazz, ...LY_INT_FQN));
    }
    addDependency(member: CoreMember, cb: Func0): void {
        this._instanceMap.set(member, cb());
        if (this._triggersMap.has(member)) {
            this._triggersMap.get(member).forEach(f => f());
            this._triggersMap.delete(member);
        }
        this._readySet.add(member);
        if (this.LOG) {
            this.LOG.debug(`Component added`, {member});
        } else {
            this._stagingLog.push([`Component added`, {member}]);
        }
        if (this._stagingSet.has(member)) {
            this._stagingSet.delete(member);
            if (this._stagingSet.size < 1) {
                this.processor.$run('loaded');
            }
        }
    }
    addTrigger(member: CoreMember, cb: Func0): void {
        if (this._readySet.has(member)) {
            cb();
        } else {
            if (!this._triggersMap.has(member)) {
                this._triggersMap.set(member, []);
            }
            this._triggersMap.get(member).push(cb);
        }
    }
    $bindInstance(ins: ObjectLike): void {
        if (!ins || typeof ins !== 'object') {
            return;
        }
        Object.getOwnPropertyNames(ins.constructor.prototype).forEach(property => {
            try {
                const desc = Object.getOwnPropertyDescriptor(ins.constructor.prototype, property);
                if (property !== 'constructor' && desc && typeof desc.value === 'function' && typeof ins[property] === 'function') {
                    ins[property] = ins[property].bind(ins)
                }
            } catch (e) {
                console.log(`${ins.constructor.name}.${property} bind`, e.message);
            }
        });
    }
    $bindStatic(ins: FuncLike): void {
        if (typeof ins !== 'function') {
            return;
        }
        if (!$ly.system) {
            $ly.addTrigger('system', () => this.$bindStatic(ins));
            return;
        }
        Object.getOwnPropertyNames(ins).forEach(property => {
            if ($ly.system.isCustomMethod(property)) {
                try {
                    const desc = Object.getOwnPropertyDescriptor(ins, property);
                    if (desc && typeof desc.value === 'function' && typeof ins[property] === 'function') {
                        ins[property] = ins[property].bind(ins)
                    }
                } catch (e) {
                    console.log(`${ins.constructor.name}.${property} bind`, e.message);
                }
            }
        });
    }
    get preLog(): LoggerLike {
        return console as unknown as LoggerLike;
    }


    get binder(): CoreBinderLike {
        return this._instanceMap.get('binder') as CoreBinderLike;
    }
    get deco(): CoreDecoLike {
        return this._instanceMap.get('deco') as CoreDecoLike;
    }
    get api(): CoreApiLike {
        return this._instanceMap.get('api') as CoreApiLike;
    }
    get context(): CoreContextLike {
        return this._instanceMap.get('context') as CoreContextLike;
    }

    get cast(): CoreCastLike {
        return this._instanceMap.get('cast') as CoreCastLike;
    }
    get injector(): CoreInjectorLike {
        return this._instanceMap.get('injector') as CoreInjectorLike;
    }

    get reflect(): CoreReflectLike {
        return this._instanceMap.get('reflect') as CoreReflectLike;
    }
    get dto(): CoreDtoLike {
        return this._instanceMap.get('dto') as CoreDtoLike;
    }
    get enum(): CoreEnumLike {
        return this._instanceMap.get('enum') as CoreEnumLike;
    }

    get error(): CoreErrorLike {
        return this._instanceMap.get('error') as CoreErrorLike;
    }

    get fqn(): CoreFqnLike {
        return this._instanceMap.get('fqn') as CoreFqnLike;
    }

    get generics(): CoreGenericsLike {
        return this._instanceMap.get('generics') as CoreGenericsLike;
    }
    get handler(): CoreHandlerLike {
        return this._instanceMap.get('handler') as CoreHandlerLike;
    }

    get hook(): CoreHookLike {
        return this._instanceMap.get('hook') as CoreHookLike;
    }

    get logger(): CoreLoggerLike {
        return this._instanceMap.get('logger') as CoreLoggerLike;
    }

    get mixin(): CoreMixinLike {
        return this._instanceMap.get('mixin') as CoreMixinLike;
    }
    get package(): CorePackageLike {
        return this._instanceMap.get('package') as CorePackageLike;
    }
    get pointer(): CorePointerLike {
        return this._instanceMap.get('pointer') as CorePointerLike;
    }

    get primitive(): CorePrimitiveLike {
        return this._instanceMap.get('primitive') as CorePrimitiveLike;
    }

    get processor(): CoreProcessorLike {
        return this._instanceMap.get('processor') as CoreProcessorLike;
    }

    get repo(): CoreRepoLike {
        return this._instanceMap.get('repo') as CoreRepoLike;
    }

    get system(): CoreSystemLike {
        return this._instanceMap.get('system') as CoreSystemLike;
    }
    get symbol(): CoreSymbolLike {
        return this._instanceMap.get('symbol') as CoreSymbolLike;
    }
    get testing(): CoreTestingLike {
        return this._instanceMap.get('testing') as CoreTestingLike;
    }
    get json(): CoreJsonLike {
        return this._instanceMap.get('json') as CoreJsonLike;
    }

    get variable(): CoreVariableLike {
        return this._instanceMap.get('variable') as CoreVariableLike;
    }

    get pwd(): string {
        return this._pwd;
    }

    get npmName(): string {
        return this._npmName;
    }

    get npmVersion(): string {
        return this._npmVersion;
    }
    // noinspection JSUnusedLocalSymbols
    emptyFn(...params: Array<unknown>): void {
        // nothing
    }
    not(value: unknown): boolean {
        return [undefined, null].includes(value);
    }
    filled(value: unknown): boolean {
        return ![undefined, null].includes(value);
    }
    do<T>(value: unknown): T {
        return value as T;
    }
}

export const $ly = new Core();
