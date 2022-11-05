import "reflect-metadata";
import {
    ClassReflectLike,
    ParameterReflectLike,
    PropertyReflectLike,
    ReflectDecoratorItem,
    ReflectInheritanceFilter,
    ReflectKeyword,
    ReflectKeywordFilter,
    ReflectMethodDescribed,
    ReflectPropertyDescribed,
    ReflectPropertyFilter,
    ReflectPropertyType
} from "./types";
import {$ly} from "../core";
import {AbstractReflect} from "./abstract-reflect";
import {FuncLike, RecLike} from "../common";
import {ParameterReflect} from "./parameter-reflect";
import {DecoAliasLike, DecoFilter, DecoLike} from "../deco";


let _LOG = $ly.preLog;

/**
 * @instance
 * */
export class PropertyReflect extends AbstractReflect implements PropertyReflectLike {
    // region properties
    private readonly _name: string;
    private readonly _clazz: ClassReflectLike;
    private _typeFn: FuncLike;
    private _namedType: string;
    private readonly _methodFn: FuncLike;
    private readonly _methodDescriptor: TypedPropertyDescriptor<FuncLike>;
    private readonly _parameters: Array<ParameterReflectLike>;
    private readonly _keyword: ReflectKeyword;
    private readonly _kind: ReflectPropertyType;
    private readonly _proto: PropertyReflectLike;
    // endregion properties

    static {
        $ly.addFqn(this);
        $ly.addTrigger('logger', () => {
            _LOG = $ly.logger.assign(this);
        });
    }
    getDescribed(): ReflectPropertyDescribed {
        return {
            ...this._clazz.getDescribed(),
            target: this._target,
            keyword: this._keyword,
            property: this._name,
            methodFn: this._methodFn,
            methodDescriptor: this._methodDescriptor,
        } as ReflectPropertyDescribed;
    }

    // region methods
    constructor(clazz: ClassReflectLike, described: ReflectMethodDescribed) {
        super();
        this._parameters = [];
        this._clazz = clazz;
        this._name = described.property;
        this._keyword = described.keyword;
        this._proto = undefined;
        this._target = described.target;
        this._kind = this._target as ReflectPropertyType;
        const classFn = $ly.symbol.findReferenced(clazz.classFn);
        if (this._kind === 'method') {
            this._methodFn = described.methodFn;
            this._methodDescriptor = described.methodDescriptor;
            if (!this._methodFn) {
                if (this._keyword === 'instance') {
                    if (described.classProto) {
                        this._methodFn = described.classProto[this._name];
                    }
                    if (!this._methodFn) {
                        this._methodFn = this._clazz.classFn.prototype[this._name];
                    }
                } else {
                    this._methodFn = this._clazz.classFn[this._name];
                }
            }
            let paramsFetched = false;
            let params: Array<FuncLike>;
            if (this._keyword === 'instance') {
                if (this._name === 'constructor') {
                    this._typeFn = this._clazz.classFn;
                } else {
                    // noinspection SpellCheckingInspection
                    this._typeFn = Reflect.getMetadata('design:returntype', this._clazz.classFn.prototype, this._name as string) as FuncLike;
                }
                // noinspection SpellCheckingInspection
                params = Reflect.getMetadata('design:paramtypes', this._clazz.classFn.prototype, this._name as string) as Array<FuncLike>;
            } else {
                // noinspection SpellCheckingInspection
                this._typeFn = Reflect.getMetadata('design:returntype', this._clazz.classFn, this._name as string) as FuncLike;
                // noinspection SpellCheckingInspection
                params = Reflect.getMetadata('design:paramtypes', this._clazz.classFn, this._name as string) as Array<FuncLike>;
            }
            if (!this._typeFn) {
                this._typeFn = undefined;
            }
            if ($ly.primitive.isArrayFilled(params)) {
                paramsFetched = true;
                params.forEach((param, index) => {
                    this._parameters.push(new ParameterReflect(this, index, param));
                });
            }
            if (!paramsFetched && this._methodFn) {
                for (let i = 0; i < this._methodFn.length; i++) {
                    this._parameters.push(new ParameterReflect(this, i, undefined));
                }
            }
        } else {
            if (this._keyword === 'instance') {
                // noinspection SpellCheckingInspection
                this._typeFn = Reflect.getMetadata('design:type', this._clazz.classFn.prototype, this._name as string) as FuncLike;
            } else {
                // noinspection SpellCheckingInspection
                this._typeFn = Reflect.getMetadata('design:type', this._clazz.classFn, this._name as string) as FuncLike;
            }
            if (!this._typeFn) {
                this._typeFn = undefined;
            }
        }
        if (this._clazz?.parent) {
            this._proto = (this._keyword === 'instance') ? this._clazz.parent.getInstanceProperty(this._name) : this._clazz.parent.getStaticProperty(this._name);
        }
    }
    // endregion methods
    // region getters
    info(detailed?: boolean): RecLike {
        let rec = {
            name: this._name,
            description: this.description,
            clazz: this._clazz.description
        } as RecLike;
        if (detailed) {
            rec = {...rec,
                typeFn: $ly.fqn.getFootprint(this._typeFn),
                keyword: this._keyword,
                kind: this._kind
            };
        }
        if (detailed && this._kind === "method") {
            rec['methodFn'] = $ly.fqn.getFootprint(this._methodFn);
            rec['parameters'] = this._parameters.map(p => p.info(detailed));
        }
        if (this._proto) {
            rec['proto'] = this._proto.description;
        }
        return rec;
    }
    get name(): string {
        return this._name;
    }
    get description(): string {
        const sign = (this._keyword === 'instance') ? '->' : '::';
        if (this._kind === 'method') {
            return `<method>${this._clazz.name}${sign}${this._name as string}`;
        }
        return `<field>${this._clazz.name}${sign}${this._name as string}`;
    }
    get shortDescription(): string {
        const sign = (this._keyword === 'instance') ? '->' : '::';
        if (this._kind === 'method') {
            return `<M>${this._clazz.baseName}${sign}${this._name as string}`;
        }
        return `<F>${this._clazz.baseName}${sign}${this._name as string}`;
    }
    get clazz(): ClassReflectLike {
        return this._clazz;
    }
    get proto(): PropertyReflectLike {
        return this._proto;
    }
    get hasProto(): boolean {
        return !!this._proto;
    }
    get typeFn(): FuncLike {
        return this._typeFn;
    }
    $setTypeFn(fn: FuncLike): void {
        this._typeFn = $ly.primitive.check(this, 'fn', fn, $ly.primitive.funcFilled);
    }
    get namedType(): string {
        return this._namedType;
    }
    $setNamedType(namedType: string): void {
        this._namedType = $ly.primitive.check(this, 'namedType', namedType, $ly.primitive.textFilled, {property: this.description});
    }

    get methodFn(): FuncLike {
        return this._methodFn;
    }
    get keyword(): ReflectKeyword {
        return this._keyword;
    }
    get kind(): ReflectPropertyType {
        return this._kind;
    }
    // endregion getters
    // region parameters
    listParameters(): Array<ParameterReflectLike> {
        return this._parameters;
    }

    hasParameter(index: number): boolean {
        return this._parameters[index] !== undefined;
    }

    getParameter(index: number): ParameterReflectLike {
        return this._parameters[index];
    }

    parametersBy(identifier: DecoLike | DecoAliasLike | FuncLike | string, filter?: DecoFilter): Array<ParameterReflectLike> {
        const deco = $ly.deco.getDecorator(identifier as DecoLike, true);
        if (!deco) {
            return [];
        }
        return this._parameters.filter(param => param.filterByBelongs(deco, filter));
    }
    // endregion parameters
    // region filter-by
    filterByKeyword(filter?: ReflectKeywordFilter): boolean {
        filter = filter ?? {};
        switch (filter?.keyword) {
            case "instance":
                return this._keyword === "instance";
            case "static":
                return this._keyword === "static";
        }
        return true;
    }
    filterByKind(filter?: ReflectPropertyFilter): boolean {
        filter = filter ?? {};
        switch (filter?.kind) {
            case "field":
                return this._kind === 'field';
            case "method":
                return this._kind === 'method';
        }
        return true;
    }
    filterByScope(cRef: ClassReflectLike, filter?: ReflectInheritanceFilter): boolean {
        filter = filter ?? {};
        switch (filter?.scope) {
            case "owned":
                return this._clazz === cRef;
            case "inherited":
                return this._clazz !== cRef;
        }
        return true;
    }
    // endregion filter-by
    // region internal
    decoratorItems(filter?: DecoFilter): Array<ReflectDecoratorItem> {
        filter = filter ?? {};
        switch (filter?.belongs) {
            case "self":
                return super.decoratorItems(filter);
            case "parent":
                if (this._proto) {
                    delete filter.belongs; // fetches all
                    filter.fromChild = true;
                    return this._proto.decoratorItems(filter);
                } else {
                    return [];
                }
        }
        if (filter.fromChild) {
            delete filter.fromChild;
        }
        if (!this._proto) {
            return super.decoratorItems(filter);
        }
        const selfData = super.decoratorItems(filter);
        delete filter.belongs; // fetches all
        filter.fromChild = true;
        return [...selfData, ...this._proto.decoratorItems(filter)];
    }
    // endregion internal
}
