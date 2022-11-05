import {Func0, FuncLike, ObjectLike} from "../common";
import {CoreCastLike} from "../cast";
import {CoreGenericsLike} from "../generics";
import {CoreContextLike} from "../context";
import {CoreReflectLike} from "../reflect";
import {CoreEnumLike} from "../enum";
import {CoreErrorLike} from "../error";
import {CoreFqnLike} from "../fqn";
import {CoreHookLike} from "../hook";
import {CoreLoggerLike, LoggerLike} from "../logger";
import {CorePackageLike} from "../package";
import {CorePrimitiveLike} from "../primitive";
import {CoreProcessorLike} from "../processor";
import {CoreRepoLike} from "../repo";
import {CoreSystemLike} from "../system";
import {CoreTestingLike} from "../testing";
import {CoreJsonLike} from "../json";
import {CoreVariableLike} from "../variable";
import {CoreInjectorLike} from "../injector";
import {CoreBinderLike} from "../binder";
import {CoreSymbolLike} from "../symbol";
import {CoreApiLike} from "../api";
import {CorePointerLike} from "../pointer";
import {CoreDecoLike} from "../deco";
import {CoreHandlerLike} from "../handler";
import {CoreDtoLike} from "../dto";
import {CoreMixinLike} from "../mixin";


export type CoreMember =
    'api'
    | 'binder'
    | 'cast'
    | 'context'
    | 'deco'
    | 'dto'
    | 'enum'
    | 'error'
    | 'fqn'
    | 'generics'
    | 'handler'
    | 'hook'
    | 'injector'
    | 'json'
    | 'logger'
    | 'mixin'
    | 'package'
    | 'pointer'
    | 'primitive'
    | 'processor'
    | 'reflect'
    | 'repo'
    | 'symbol'
    | 'system'
    | 'testing'
    | 'variable';

export interface CoreLike$$$ {
    addFqn(obj: ObjectLike): void;
    addDeco(fn: FuncLike, cb: Func0): void;
    addError(clazz: FuncLike): void;
    addDependency(member: CoreMember, cb: Func0): void;
    addTrigger(member: CoreMember, cb: Func0): void;
    $bindInstance(ins: ObjectLike): void;
    $bindStatic(ins: FuncLike): void;
    get preLog(): LoggerLike;
}
const a: FuncLike = () => null;
export interface CoreLike {
    get npmName(): string;

    get npmVersion(): string;

    get pwd(): string;
    emptyFn(...params: Array<unknown>): void;
    not(value: unknown): boolean;
    do<T>(value: unknown): T;

    get api(): CoreApiLike;
    get context(): CoreContextLike;
    get binder(): CoreBinderLike;
    get deco(): CoreDecoLike;
    get dto(): CoreDtoLike;

    get reflect(): CoreReflectLike;
    get injector(): CoreInjectorLike;
    get enum(): CoreEnumLike;

    get error(): CoreErrorLike;

    get fqn(): CoreFqnLike;

    get hook(): CoreHookLike;

    get logger(): CoreLoggerLike;
    get mixin(): CoreMixinLike;
    get package(): CorePackageLike;
    get pointer(): CorePointerLike;

    get primitive(): CorePrimitiveLike;

    get processor(): CoreProcessorLike;

    get repo(): CoreRepoLike;

    get system(): CoreSystemLike;
    get symbol(): CoreSymbolLike;
    get testing(): CoreTestingLike;
    get json(): CoreJsonLike;

    get variable(): CoreVariableLike;

    get cast(): CoreCastLike;

    get generics(): CoreGenericsLike;
    get handler(): CoreHandlerLike;
}