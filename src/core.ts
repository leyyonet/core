import {
    CoreBaseLike,
    CoreComponentLike,
    CoreDecoLike,
    CoreEnumerationLike,
    CoreEventLike,
    CoreIsLike,
    CoreLike,
    CoreOptionLike,
    CorePrimitiveLike,
    CoreProcessorLike,
    CoreRepoLike,
    CoreSystemLike,
    CoreVariableLike,
    ExceptionImplLike,
    FqnPoolLike,
    HookLike,
    LoggerLike,
    LoggerRepoLike,
    RepoClassKey,
    RepoValuePool
} from "./index-types";
import {CoreLogger} from "./core/logger";
import {CoreRepo} from "./core/repo";
import {ClassLike, ClassOrName, RecLike} from "./index-aliases";
import {CoreComponent} from "./core/component";
import {CoreEnumeration} from "./core/enumeration";
import {CoreEvent} from "./core/event";
import {ExceptionImpl} from "./core/exception";
import {CoreHook} from "./core/hook";
import {CoreLoggerInstance, CoreOptionBuilder} from "./instance";
import {CoreProcessor} from "./core/processor";
import {CoreSystem} from "./core/system";
import {CoreVariable} from "./core/variable";
import {setForAnnotations} from "./index-annotations";
import {setForExceptions} from "./index-errors";
import {setForFunctions} from "./index-functions";
import {CoreDecoPool} from "./core/deco-pool";
import {Environment, HttpMethod, ProcessorKey, Severity} from "./index-enums";
import {CoreFqnPool} from "./core/fqn-pool";
import {FQN_NAME} from "./internal-component";
import {CorePrimitive} from "./core/primitive";
import {CoreIs} from "./core/is";

class Core implements CoreLike {
    private _repoPool: Array<RepoValuePool>;
    constructor() {
        this._repoPool = [];
        const classes = [CoreLoggerInstance, CoreOptionBuilder];
        classes.forEach(clazz => clazz.setLyy(this));

        const enumerations = {Environment, Severity, HttpMethod, ProcessorKey};

        const cores = {} as RecLike<ClassLike>;
        cores['_is'] = CoreIs;
        cores['_primitive'] = CorePrimitive;
        cores['_repo'] = CoreRepo;
        cores['_event'] = CoreEvent;
        cores['_logger'] = CoreLogger;
        cores['_component'] = CoreComponent;
        cores['_enumeration'] = CoreEnumeration;
        cores['_exception'] = ExceptionImpl;
        cores['_fqnPool'] = CoreFqnPool;
        cores['_hook'] = CoreHook;
        cores['_processor'] = CoreProcessor;
        cores['_system'] = CoreSystem;
        cores['_variable'] = CoreVariable;
        cores['_decoPool'] = CoreDecoPool;
        for (const [property, clazz] of Object.entries(cores)) {
            this[property] = new clazz(this);
        }
        const files = [setForFunctions, setForAnnotations, setForExceptions];
        files.forEach(file => file(this));

        for (const property of Object.keys(cores)) {
            const fn = this[property] as CoreBaseLike;
            if (typeof fn?.ly_init === 'function') {
                fn.ly_init();
            }
        }
        this._LOG = CoreLoggerInstance.fake(this);
        this._logger.ly_post();

        classes.forEach(clazz => this._fqnPool.clazz(clazz, ...FQN_NAME));
        Object.values(cores).forEach(clazz => this._fqnPool.clazz(clazz, ...FQN_NAME));
        for (const [name, map] of Object.entries(enumerations)) {
            this.enumeration.add(name, map, ...FQN_NAME);
        }
    }
    initialize() {

    }
    ly_log(clazz: ClassOrName): LoggerLike {
        return CoreLoggerInstance.fake(clazz);
    }
    ly_array<V = unknown>(ins: RepoClassKey, member: string): Array<V> {
        if (this._repo) {
            return this._repo.newArray(ins, member);
        }
        const rec: RepoValuePool = {ins, member, type: 'array', values: []};
        this._repoPool.push(rec);
        return rec.values as Array<V>;
    }
    ly_map<K = unknown, V = unknown>(ins: RepoClassKey, member: string, overwrite?: boolean): Map<K, V> {
        if (this._repo) {
            return this._repo.newMap(ins, member);
        }
        const rec: RepoValuePool = {ins, member, type: 'map', values: new Map<K, V>()};
        this._repoPool.push(rec);
        return rec.values as Map<K, V>;
    }
    ly_repoLoaded(): void {
        this._repoPool.forEach(item => {
            switch (item.type) {
                case "array":
                    const arr = this._repo.newArray(item.ins, item.member);
                    arr.push(...item.values);
                    item.values = [];
                    break;
                case "map":
                    const map = this._repo.newMap(item.ins, item.member);
                    for (const [k, v] of item.values.entries()) {
                        map.set(k, v);
                    }
                    (item.values as Map<unknown, unknown>).clear();
                    break;
                case "set":
                    const rec = this._repo.newSet(item.ins, item.member);
                    for (const [v] of item.values.entries()) {
                        rec.add(v)
                    }
                    (item.values as Set<unknown>).clear();
                    break;
            }
        });
        this._repoPool = [];
    }
    protected _logger: LoggerRepoLike;
    get logger(): LoggerRepoLike {return this._logger;}
    protected _repo: CoreRepoLike;
    get repo(): CoreRepoLike {return this._repo;}
    protected _component: CoreComponentLike;
    get component(): CoreComponentLike {return this._component;}
    protected _enumeration: CoreEnumerationLike;
    get enumeration(): CoreEnumerationLike {return this._enumeration;}
    protected _event: CoreEventLike;
    get event(): CoreEventLike {return this._event;}
    protected _exception: ExceptionImplLike;
    get exception(): ExceptionImplLike {return this._exception;}
    protected _fqnPool: FqnPoolLike;
    get fqnPool(): FqnPoolLike {return this._fqnPool;}
    protected _hook: HookLike;
    get hook(): HookLike {return this._hook;}
    protected _processor: CoreProcessorLike;
    get processor(): CoreProcessorLike {return this._processor;}
    protected _system: CoreSystemLike;
    get system(): CoreSystemLike {return this._system;}
    protected _variable: CoreVariableLike;
    get variable(): CoreVariableLike {return this._variable;}
    protected _is: CoreIsLike;
    get is(): CoreIsLike {return this._is;}
    protected _primitive: CorePrimitiveLike;
    get primitive(): CorePrimitiveLike {return this._primitive;}
    protected _decoPool: CoreDecoLike;
    get decoPool(): CoreDecoLike {return this._decoPool;}
    protected _LOG: LoggerLike;
    get LOG(): LoggerLike {return this._LOG;}
    opt(opt?: RecLike): CoreOptionLike {
        return new CoreOptionBuilder(opt);
    }
}
export const leyyo: CoreLike = new Core();