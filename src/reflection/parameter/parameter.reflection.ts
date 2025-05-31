import {$assert, $dev, Dict, Func} from "@leyyo/common";
import {AbstractReflection} from "../abstract";
import {ParameterReflectionLike, ParameterReflectionSecure} from "./index.types";
import {PropertyReflectionLike} from "../property";
import {core} from "../../core";
import {$$coreInternalOn} from "../../internal";
import {FQN_PCK} from "../internal";
import {DecoArgumentParam} from "../../decorator";


// noinspection Annotator
export class ParameterReflection extends AbstractReflection implements ParameterReflectionLike, ParameterReflectionSecure {
    // region properties
    protected readonly _property: PropertyReflectionLike;
    protected readonly _index: number;
    protected readonly _hasDefault: boolean = false;
    protected readonly _isVariadic: boolean = false;
    protected _description: string;

    // endregion properties

    constructor(property: PropertyReflectionLike, index: number, type: Func) {
        super(property.code, index);
        this._target = 'parameter';
        this._property = property;
        this._index = index;
        this._type = typeof type === 'function' ? type : null;

        if (property.inspected?.params && property.inspected?.params[index]) {
            const param = property.inspected.params[index];
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
                type: core.fqnHandler.detail(this._type),
            }
        }
        return {
            index: this._index,
            description: this.description,
            property: {'$ref': this._property.description},
            type: core.fqnHandler.detail(this._type),
            name: this._name,
            ...(super.info()),
        }
    }

    get property(): PropertyReflectionLike {
        return this._property;
    }

    get index(): number {
        return this._index;
    }

    get description(): string {
        if (!this._description) {
            this._description = `<parameter}>${this._property.clazz.name}.${this._property.name as string}#${this._index} [${this._property.keyword}]`;
        }
        return this._description;
    }

    get hasDefault(): boolean {
        return this._hasDefault;
    }

    get isVariadic(): boolean {
        return this._isVariadic;
    }

    // endregion getters

    copyDecorators(source: ParameterReflectionLike, args: DecoArgumentParam): void {
        this._copyDecorators(source, this, args);
    }
    // region secure
    get $back(): ParameterReflectionLike {
        return this;
    }

    get $secure(): ParameterReflectionSecure {
        return this;
    }

    $setType(type: Func): this {
        $assert.func(type, () => $dev.opt({
            field: 'type',
            name: this.description,
            where: 'leyyo.reflection.ParameterReflection'
        }));
        if (this._type && this._type !== type) {
            let index = 0;
            while (this.hasMetaKey(`$type-${index}`)) {
                index++;
            }
            this.setMetaKey(`$type-${index}`, this._type);
        }
        this._type = type;
        return this;
    }

    // endregion secure

    toJSON(simple?: boolean) {
        if (simple) {
            return {
                ...{
                    index: this._index,
                    name: this._name,
                    type: this._type?.name,
                }, ...super.toJSON()
            };
        }
        return {
            ...{
                __: ParameterReflection.name,
                method: this._property.description,
                index: this._index,
                name: this._name,
                type: this._type?.name,
            }, ...super.toJSON()
        };
    }

}

$$coreInternalOn('class-instance', () => {
    core.fqnHandler.clazz(ParameterReflection, FQN_PCK);
});
