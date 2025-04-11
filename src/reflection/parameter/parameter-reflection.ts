import {AbstractReflection} from "../abstract";
import {ParameterReflectionLike, ParameterReflectionSecure} from "./index-types";
import {PropertyReflectionLike} from "../property";
import {assertion, Dict, Func} from "@leyyo/common";
import {DecoInstanceLike, DecoLike} from "../../decorator";
import {core} from "../../core";

// console.log(__filename);

// noinspection Annotator
export class ParameterReflection extends AbstractReflection implements ParameterReflectionLike, ParameterReflectionSecure {
    // region properties
    protected readonly _property: PropertyReflectionLike;
    protected readonly _index: number;
    protected readonly _hasDefault: boolean = false;
    protected readonly _isVariadic: boolean = false;

    // endregion properties

    constructor(property: PropertyReflectionLike, index: number, type: Func) {
        super(property.currentInstance);
        this._target = 'parameter';
        this._property = property;
        this._index = index;
        this._type = typeof type === 'function' ? type : null;

        const param = property.inspected?.params[index];
        if (param) {
            if (Array.isArray(param)) {
                this._name = param[0];
                if (param[1] === 'default') {
                    this._hasDefault = true;
                } else if (param[1] === 'variadic') {
                    this._isVariadic = true;
                }
            } else {
                this._name = param;
            }
        }
    }

    // region getters
    info(detailed?: boolean): Dict {
        if (!detailed) {
            return {
                index: this._index,
                type: core.fqn.detail(this._type),
            }
        }
        return {
            index: this._index,
            description: this.description,
            property: {'$ref': this._property.description},
            type: core.fqn.detail(this._type),
        }
    }

    get property(): PropertyReflectionLike {
        return this._property;
    }

    get index(): number {
        return this._index;
    }

    get description(): string {
        return `<parameter}>${this._property.clazz.name}.${this._property.name as string}#${this._index} [${this._property.keyword}]`;
    }

    get hasDefault(): boolean {
        return this._hasDefault;
    }

    get isVariadic(): boolean {
        return this._isVariadic;
    }

    // endregion getters

    // region decorator
    decoMap(): Record<string, Array<Dict>> {
        return super.decoMap();
    }

    hasDecorator(decorator: Func | string): boolean {
        return super.hasDecorator(decorator);
    }

    listValues<V extends Dict = Dict>(decorator: Func | string): Array<V> {
        return super.listValues<V>(decorator);
    }

    getValue<V extends Dict = Dict>(decorator: Func | string): V {
        return super.getValue<V>(decorator);
    }

    // endregion decorator

    // region secure
    get $back(): ParameterReflectionLike {
        return this;
    }

    get $secure(): ParameterReflectionSecure {
        return this;
    }

    $setType(type: Func): this {
        assertion.func(type, () => {return {name: this.description}});
        this._type = type;
        return this;
    }

    $filterDecorators(): Map<DecoLike, Array<Dict>> {
        return this._decoratorMap;
    }

    $setCurrentInstance(currentInstance: DecoInstanceLike): this {
        this._currentInstance = currentInstance;
        return this;
    }

    $setForCurrentDecorator<V extends Dict>(value: V): this {
        return this.setValue(this.currentIdentifier?.fn, value);
    }

    // endregion secure

}