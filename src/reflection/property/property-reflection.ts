import "reflect-metadata";
import {AbstractReflection} from "../abstract";
import {ParameterReflection, ParameterReflectionLike} from "../parameter";
import {PropertyReflectionLike, PropertyReflectionSecure} from "./index-types";
import {ClassReflectionLike} from "../class";
import {assertion, Dict, Func, is, to} from "@leyyo/common";
import {
    DecoFilterBelongs,
    DecoFilterKeyword,
    DecoFilterKind,
    DecoInstanceLike,
    DecoKeyword,
    DecoKind,
    DecoLike
} from "../../decorator";
import {core} from "../../core";
import {FootprintInspected} from "../../footprint";

// console.log(__filename);

// noinspection Annotator
export class PropertyReflection extends AbstractReflection implements PropertyReflectionLike, PropertyReflectionSecure {
    // region properties
    protected readonly _clazz: ClassReflectionLike;
    protected _callable: Func;
    protected readonly _parameters: Array<ParameterReflectionLike>;
    protected readonly _keyword: DecoKeyword;
    protected readonly _kind: DecoKind;
    protected readonly _proto: PropertyReflectionLike;
    protected readonly _inspected: FootprintInspected;
    // endregion properties
    // region methods
    constructor(clazz: ClassReflectionLike, name: PropertyKey, keyword: DecoKeyword, kind: DecoKind, callable?: Func) {
        super(clazz.currentInstance);
        this._parameters = [];
        this._clazz = clazz;
        this._name = name as string;
        this._keyword = keyword;
        this._proto = null;
        if (kind === 'method') {
            this._kind = kind;
            this._callable = typeof callable === 'function' ? callable : null;
            this._target = 'method';
            let paramsListed = false;
            if (this._clazz.body) {
                if (!this._callable) {
                    this._callable = this._clazz.body[this._name];
                }
                this._inspected = core.footprint.inspect(this._callable) ?? core.footprint.inspect(this._clazz.body[this._name]);
                this._type = Reflect.getMetadata('design:returntype', this._clazz.body, this._name as string) as Func;
                const params = Reflect.getMetadata('design:paramtypes', this._clazz.body, this._name as string) as Array<Func>;
                if (is.array(params)) {
                    paramsListed = true;
                    params.forEach((param, i) => {
                        this._parameters.push(new ParameterReflection(this, i, param));
                    });
                }
            }
            else if (this._clazz.creator[this._name]) {
                if (!this._callable) {
                    this._callable = this._clazz.creator[this._name];
                }
                this._inspected = core.footprint.inspect(this._callable) ?? core.footprint.inspect(this._clazz.creator[this._name]);
                this._type = Reflect.getMetadata('design:returntype', this._clazz.creator, this._name as string) as Func;
                const params = Reflect.getMetadata('design:paramtypes', this._clazz.creator, this._name as string) as Array<Func>;
                if (is.array(params)) {
                    paramsListed = true;
                    params.forEach((param, i) => {
                        this._parameters.push(new ParameterReflection(this, i, param));
                    });
                }
            }
            if (!paramsListed && this._callable) {
                for (let i = 0; i < this._callable.length; i++) {
                    this._parameters.push(new ParameterReflection(this, i, null));
                }
            }
        } else {
            this._kind = 'field';
            this._callable = null;
            this._target = 'field';
            if (this._clazz.body) {
                this._type = Reflect.getMetadata('design:type', this._clazz.body, this._name as string) as Func;
            }
            else {
                this._type = Reflect.getMetadata('design:type', this._clazz.creator, this._name as string) as Func;
            }
        }
        if (this._clazz?.parent) {
            this._proto = (this._keyword === 'instance') ? this._clazz.parent.getInstanceProperty(name) : this._clazz.parent.getStaticProperty(name);
        }
    }

    // endregion methods
    // region getters
    info(detailed?: boolean): Dict {
        let rec = {
            name: this._name,
            description: this.description,
            clazz: {'$ref': this._clazz.description}
        } as Dict;
        if (detailed) {
            rec = {
                ...rec,
                type: core.fqn.detail(this._type),
                keyword: this._keyword,
                kind: this._kind
            };
        }
        if (detailed && this._kind === "method") {
            rec['callable'] = core.fqn.detail(this._callable);
            rec['parameters'] = this._parameters.map(p => p.info(detailed));
        }
        if (this._proto) {
            rec['proto'] = {'$ref': this._proto.description};
        }
        return rec;
    }

    get description(): string {
        return `<${this._kind}>${this._clazz.name}.${this._name as string} [${this._keyword}]`;
    }

    get clazz(): ClassReflectionLike {
        return this._clazz;
    }

    get proto(): PropertyReflectionLike {
        return this._proto;
    }

    get hasProto(): boolean {
        return !!this._proto;
    }

    get callable(): Func {
        return this._callable;
    }

    get keyword(): DecoKeyword {
        return this._keyword;
    }

    get kind(): DecoKind {
        return this._kind;
    }
    get inspected(): FootprintInspected {
        return this._inspected;
    }

    // endregion getters
    // region parameters
    listParameters(): Array<ParameterReflectionLike> {
        return [...this._parameters]; // cloned
    }

    hasParameter(index: number): boolean {
        return this._parameters[index] !== undefined;
    }

    getParameter(index: number): ParameterReflectionLike {
        return this._parameters[index] ?? null;
    }

    parametersBy(decorator: Func | string): Array<ParameterReflectionLike> {
        const id = core.decorator.get(decorator, false)?.value;
        if (!id) {
            return [];
        }
        return [...this._parameters.filter(param => param.filterByBelongs(id.fn))]; //cloned
    }

    // endregion parameters
    // region filter-by
    filterByKeyword(filter?: DecoFilterKeyword): boolean {
        switch (filter?.keyword) {
            case "instance":
                return this._keyword === "instance";
            case "static":
                return this._keyword === "static";
            default:
                return true;
        }
    }

    filterByKind(filter?: DecoFilterKind): boolean {
        switch (filter?.kind) {
            case "field":
                return this._kind === 'field';
            case "method":
                return this._kind === 'method';
            default:
                return true;
        }
    }

    // endregion filter-by
    // region secure
    get $secure(): PropertyReflectionSecure {
        return this;
    }

    get $back(): PropertyReflectionLike {
        return this;
    }

    $setFieldType(type: Func): this {
        assertion.func(type, {name: this.description});
        if (this._target !== 'field') {
            assertion.raise('Only property type can be set', {name: this.description});
        }
        this._type = type;
        return this;
    }

    $setMethodCallable(callable: Func): this {
        assertion.func(callable, {name: this.description});
        if (this._target !== 'method') {
            assertion.raise('Only method callable can be set', {name: this.description});
        }
        this._callable = callable;
        return this;
    }

    $filterDecorators(filter?: DecoFilterBelongs): Map<DecoLike, Array<Dict>> {
        switch (filter?.belongs) {
            case "self":
                return this._decoratorMap;
            case "parent":
                if (this._proto) {
                    return this._proto.$secure.$filterDecorators(filter);
                } else {
                    return this._emptyDecoMap;
                }
            default:
                if (this._proto) {
                    return new Map<DecoLike, Array<Dict>>([...this._decoratorMap, ...this._proto.$secure.$filterDecorators(filter)]);
                } else {
                    return this._decoratorMap;
                }
        }
    }

    $setCurrentInstance<V extends Dict = Dict>(currentInstance: DecoInstanceLike<V>): this {
        this._currentInstance = currentInstance;
        return this;
    }

    $setForCurrentDecorator<V extends Dict>(value: V): this {
        return this.setValue(this.currentIdentifier?.fn, value);
    }

    // endregion secure
}