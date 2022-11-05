import {DeveloperException} from "../error";
import {$ly} from "../core";
import {PointerLike} from "../pointer";
import {CoreDecoLike, DecoAliasLike, DecoFilter, DecoLike, DecoOption} from "./types";
import {ReflectFilterType} from "../reflect";
import {FuncLike, RecLike} from "../common";
import {DecoInstance} from "./deco-instance";
import {AliasInstance} from "./alias-instance";
import {PointerInstance} from "../pointer/pointer-instance";

/**
 * @core
 * */
export class CoreDeco implements CoreDecoLike {
    // region properties
    protected LOG = $ly.preLog;
    private _primaryPointer: PointerLike<DecoLike>;
    private _aliasPointer: PointerLike<DecoAliasLike>;
    private _LITERALS: Record<ReflectFilterType, Array<string>>;
    readonly BOOL_FIELDS = ['clazz', 'method', 'field', 'parameter',
        'onlyForInstance', 'onlyForStatic',
        'temporary', 'multiple', 'isFinal'];

    // endregion properties
    constructor() {
        this.$init();
        $ly.addFqn(this);
        $ly.addTrigger('logger', () => {this.LOG = $ly.logger.assign(this)});
        $ly.addTrigger('pointer', () => {
            this._primaryPointer = new PointerInstance('decorator', {alias: true}, (v) => v instanceof DecoInstance);
            this._aliasPointer = new PointerInstance('decorator-alias', {}, (v) => v instanceof AliasInstance);
        });
    }

    static {
        $ly.addDependency('deco', () => new CoreDeco());
    }

    // region private
    protected $init() {
        this._LITERALS = {
            belongs: ['self', 'parent'],
            scope: ['owned', 'inherited'],
            kind: ['field', 'method'],
            keyword: ['static', 'instance'],
        };
    }
    // endregion private



    // region self
    get description(): string {
        return `<deco-pool>`;
    }
    info(detailed?: boolean): RecLike {
        return {
            decorators: this._primaryPointer.listValues().map(deco => deco.info(detailed)),
            aliases: this._aliasPointer.listValues().map(alias => alias.info(detailed)),
        };
    }
    // endregion self

    // region deco
    buildFilter<T = DecoFilter>(filter: T, ...conditions: Array<ReflectFilterType>): T {
        filter = ($ly.primitive.object(filter) ?? {}) as T;
        conditions.forEach(condition => {
            if (filter[condition] !== undefined && this._LITERALS[condition] !== undefined) {
                if (!this._LITERALS[condition].includes(filter[condition])) {
                    delete filter[condition];
                }
            }
        });
        return filter;
    }

    addDecorator<V extends RecLike = RecLike>(fn: FuncLike, options?: DecoOption): DecoLike<V> {
        let deco = this._primaryPointer.findValue(fn, false);
        if (deco) {
            throw new DeveloperException('reflect:duplicated.deco', {deco: deco.name}).with(this);
        }
        deco = new DecoInstance<V>(fn, options);
        this._primaryPointer.addPrimary(fn, deco);
        this.LOG.debug('Decorator added', {name: deco.name});
        return deco as DecoLike<V>;
    }
    upsertDecorator<V extends RecLike = RecLike>(fn: FuncLike, options?: DecoOption): DecoLike<V> {
        const deco = this._primaryPointer.findValue(fn, false) as DecoLike<V>;
        if (deco) {
            return deco;
        }
        return this.addDecorator(fn, options);

    }
    addAlias<V extends RecLike = RecLike>(aliasFn: FuncLike, decoFn: FuncLike, options?: DecoOption): DecoAliasLike<V> {
        let alias = this._aliasPointer.findValue(aliasFn, false) as DecoAliasLike<V>;
        if (!alias) {
            const deco = this._primaryPointer.findValue(decoFn) as DecoLike<V>;
            alias = new AliasInstance<V>(aliasFn, deco, options);
            this._aliasPointer.addPrimary(aliasFn, alias);
            this.LOG.debug('Alias created', {alias: alias.name});
        }
        this._primaryPointer.addAlias(aliasFn, decoFn);
        return alias;
    }
    upsertAlias<V extends RecLike = RecLike>(aliasFn: FuncLike, decoFn: FuncLike, options?: DecoOption): DecoAliasLike<V> {
        const alias = this._aliasPointer.findValue(aliasFn, false) as DecoAliasLike<V>;
        if (alias) {
            return alias;
        }
        return this.addAlias(aliasFn, decoFn, options);
    }
    is(identifier: FuncLike|string): boolean {
        return this._primaryPointer.isAny(identifier as FuncLike);
    }

    isDecorator(identifier: FuncLike|string): boolean {
        return this._primaryPointer.isPrimary(identifier as FuncLike);
    }
    getDecorator<V extends RecLike = RecLike>(identifier: DecoLike | DecoAliasLike | FuncLike | string, throwable?: boolean): DecoLike<V> {
        if ($ly.primitive.isObject(identifier)) {
            if (identifier instanceof DecoInstance) {
                return identifier;
            } else if (identifier instanceof AliasInstance) {
                return identifier.deco;
            }
        }
        return this._primaryPointer.findValue(identifier as string, throwable) as DecoLike<V>;
    }
    decorators(): Array<DecoLike> {
        return this._primaryPointer.listValues();
    }
    aliases(): Array<DecoAliasLike> {
        return this._aliasPointer.listValues();
    }
    getAlias<V extends RecLike = RecLike>(identifier: DecoAliasLike | FuncLike | string, throwable?: boolean): DecoAliasLike<V> {
        if ($ly.primitive.isObject(identifier) && identifier instanceof AliasInstance) {
            return identifier;
        }
        return this._aliasPointer.findValue(identifier as string, throwable) as DecoAliasLike<V>;
    }
    isAlias(fn: FuncLike): boolean {
        return this._aliasPointer.isPrimary(fn);
    }
    // endregion deco
}
