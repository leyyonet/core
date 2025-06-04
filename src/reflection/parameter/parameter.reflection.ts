import {$dev, Func} from "@leyyo/common";
import {AbstractReflection} from "../abstract";
import {ParameterReflectionLike, ParameterReflectionSecure} from "./index.types";
import {PropertyReflectionLike} from "../property";
import {core} from "../../core";
import {$$coreInternalOn} from "../../internal";
import {FQN_PCK} from "../internal";
import {fqnHandler} from "../../index";


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
        const ins = new ParameterReflection();
        ins._target = 'parameter';
        ins._property = property;
        ins._index = index;
        ins._type = typeof type === 'function' ? type : undefined;

        const inspected = property.inspected;
        let refName: string;
        if (inspected?.params && inspected?.params[index]) {
            const param = inspected.params[index];
            if (param) {
                if (Array.isArray(param)) {
                    refName = param[0];
                    if (param[1] === 'default') {
                        ins._hasDefault = true;
                    } else if (param[1] === 'variadic') {
                        ins._isVariadic = true;
                    }
                } else {
                    refName = param;
                }
            }
        }
        ins._name = name ?? refName;
        return ins;
    }
    static copy(property: PropertyReflectionLike, source: ParameterReflectionLike): ParameterReflection {
        const ins = new ParameterReflection();
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
            const rec = {index: this._index, method: this._property.toJSON(true)};
            if (this._name) {
                rec['name'] = this._name;
            }
            return rec;
        }
        const rec = {index: this._index, method: this._property.toJSON(true), ...super.toJSON()};
        if (this._name) {
            rec['name'] = this._name;
        }
        if (this._type) {
            rec['type'] = fqnHandler.get(this._type);
        }
        if (this._hasDefault) {
            rec['hasDefault'] = true;
        }
        if (this._isVariadic) {
            rec['isVariadic'] = true;
        }
        if (this._proto) {
            rec['proto'] = this._proto.toJSON(true);
        }
        if (this._clones) {
            rec['clones'] = this._clones.map(p => p.toJSON(true));
        }
        return rec;
    }

}

$$coreInternalOn('class-instance', () => {
    core.fqnHandler.clazz(ParameterReflection, FQN_PCK);
});
