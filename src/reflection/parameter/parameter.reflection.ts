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
    private _property: PropertyReflectionLike;
    private _proto: ParameterReflectionLike;
    private _index: number;
    private _hasDefault: boolean = false;
    private _isVariadic: boolean = false;
    private _description: string;
    private _clones: Array<ParameterReflectionLike>;

    // endregion properties

    static create(property: PropertyReflectionLike, index: number, type: Func, name?: string): ParameterReflection {
        if (property.hasParameter(index)) {
            throw $dev.developerError2(FQN_PCK, 100, {
                message: 'Index was already defined',
                property: property.description,
                index,
            });
        }
        const ins = new ParameterReflection(property.code, index);
        ins._target = 'parameter';
        ins._property = property;
        ins._index = index;
        ins._type = typeof type === 'function' ? type : undefined;

        if (!name) {
            if (property.inspected?.params && property.inspected?.params[index]) {
                const param = property.inspected.params[index];
                if (param) {
                    if (Array.isArray(param)) {
                        ins._name = param[0];
                        if (param[1] === 'default') {
                            ins._hasDefault = true;
                        } else if (param[1] === 'variadic') {
                            ins._isVariadic = true;
                        }
                    } else {
                        ins._name = param;
                    }
                }
            }
        }
        else {
            ins._name = name;
        }
        return ins;
    }
    static copy(property: PropertyReflectionLike, source: ParameterReflectionLike): ParameterReflection {
        const ins = new ParameterReflection(source.code);
        ins._target = source.target;
        ins._property = property;

        ins._index = source.index;
        ins._type = source.type;
        ins._name = source.name;
        ins._hasDefault = source.hasDefault;
        ins._isVariadic = source.isVariadic;

        ins.copyDecorators(source);
        source.$secure.$appendCopied(ins);
        return ins;

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
    get proto(): ParameterReflectionLike {
        return this._proto;
    }
    get hasProto(): boolean {
        return !!this._proto;
    }
    get clones(): Array<ParameterReflectionLike> {
        return this._clones ? [...this._clones] : [];
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

    copyDecorators(source: ParameterReflectionLike): void {
        this._copyDecorators(source, this);
    }
    // region secure
    get $back(): ParameterReflectionLike {
        return this;
    }

    get $secure(): ParameterReflectionSecure {
        return this;
    }

    $appendCopied(child: ParameterReflectionLike): void {
        if (!this._clones) {
            this._clones = [];
        }
        this._clones.push(child);
    }
    $setType(type: Func): this {
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
