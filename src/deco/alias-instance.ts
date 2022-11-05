import {DecoAliasLike, DecoFilter, DecoOnAssignedCb, DecoOnChangedCb} from "./types";
import {FuncLike, RecLike} from "../common";
import {DecoLike, DecoOption} from "./index";
import {$ly} from "../core";
import {
    ClassReflectLike,
    ParameterReflectLike,
    PropertyReflectLike,
    ReflectDescribed,
    ReflectLike,
    TargetLike
} from "../reflect";

let _LOG = $ly.preLog;

/**
 * @instance
 * */
export class AliasInstance<V extends RecLike = RecLike> implements DecoAliasLike<V> {
    private readonly _fn: FuncLike;
    private readonly _deco: DecoLike<V>;
    private readonly _options: DecoOption;

    static {
        $ly.addFqn(this);
        $ly.addTrigger('logger', () => {
            _LOG = $ly.logger.assign(this);
        });
    }
    constructor(alias: FuncLike, deco: DecoLike<V>, opt?: DecoOption) {
        this._fn = alias;
        this._deco = deco;
        opt = $ly.primitive.object(opt) as DecoOption;
        if (opt) {
            $ly.deco.BOOL_FIELDS.forEach(f => {opt[f] = $ly.primitive.boolean(opt[f])});
            if (!opt.clazz && !opt.method && !opt.field && !opt.parameter) {
                opt.clazz = true;
                opt.method = true;
                opt.field = true;
                opt.parameter = true;
            }
            opt.purposes = $ly.primitive.array(opt.purposes, $ly.primitive.string) ?? [];
        } else {
            opt = this._deco.options;
        }
        this._options = opt;
    }
    info(): RecLike {
        return {
            name: this.name,
            deco: this._deco.description,
        }
    }
    get description(): string {
        return `<alias>${this.name}`;
    }
    get name(): string {return $ly.fqn.get(this._fn);}
    get fn(): FuncLike {return this._fn;}
    get deco(): DecoLike<V> {return this._deco;}

    assign<R extends ReflectLike = ReflectLike>(described: ReflectDescribed, value?: V): R {
        return this._deco.assign<R>(described, value);
    }

    get forClass(): boolean {return this._options.clazz;}
    get forMethod(): boolean {return this._options.method;}
    get forField(): boolean {return this._options.field;}
    get forParameter(): boolean {return this._options.parameter;}
    get onlyForInstance(): boolean {return this._options.onlyForInstance;}
    get onlyForStatic(): boolean {return this._options.onlyForStatic;}
    get temporary(): boolean {return this._options.temporary;}
    get multiple(): boolean {return this._options.multiple;}
    get isFinal(): boolean {return this._options.isFinal;}
    get purposes(): Array<string> {return this._options.purposes;}
    get options(): DecoOption {return this._options;}

    hasPurposes(...purposes: Array<string>): boolean {
        purposes = $ly.primitive.array(purposes, $ly.primitive.string);
        if (!purposes || purposes.length < 1) {
            return true;
        }
        return this._options.purposes.filter(purpose => purposes.includes(purpose)).length > 0
    }

    get isPrimary(): boolean {
        return false;
    }

    get targets(): Array<TargetLike> {
        const result = [] as Array<TargetLike>;
        if (this._options.clazz) {
            result.push('class');
        }
        if (this._options.method) {
            result.push('method');
        }
        if (this._options.field) {
            result.push('field');
        }
        if (this._options.parameter) {
            result.push('parameter');
        }
        return result;
    }


    // region class
    assignedClasses(filter?: DecoFilter): Array<ClassReflectLike> {
        return this._deco.assignedClasses(filter);
    }
    valueByClass(identifier: FuncLike | string, filter?: DecoFilter): V {
        return this._deco.valueByClass(identifier as FuncLike, filter);
    }
    valuesByClass(identifier: FuncLike | string, filter?: DecoFilter): Array<V> {
        return this._deco.valuesByClass(identifier as FuncLike, filter);
    }
    // endregion class
    // region property
    assignedProperties(filter?: DecoFilter): Array<PropertyReflectLike> {
        return this._deco.assignedProperties(filter);
    }
    valueByProperty(identifier: FuncLike | string, property: string, filter?: DecoFilter): V {
        return this._deco.valueByProperty(identifier as FuncLike, property, filter);
    }
    valuesByProperty(identifier: FuncLike | string, property: string, filter?: DecoFilter): Array<V> {
        return this._deco.valuesByProperty(identifier as FuncLike, property, filter);
    }
    // endregion property
    // region parameter
    assignedParameters(filter?: DecoFilter): Array<ParameterReflectLike> {
        return this._deco.assignedParameters(filter);
    }
    valueByParameter(identifier: FuncLike | string, property: string, index: number, filter?: DecoFilter): V {
        return this._deco.valueByParameter(identifier as FuncLike, property, index, filter);
    }
    valuesByParameter(identifier: FuncLike | string, property: string, index: number, filter?: DecoFilter): Array<V> {
        return this._deco.valuesByParameter(identifier as FuncLike, property, index, filter);
    }
    // endregion parameter

    // region events
    onAssigned(cb: DecoOnAssignedCb): void {
        this._deco.onAssigned(cb);
    }
    clearOnAssigned(): number {
        return this._deco.clearOnAssigned();
    }
    onChanged(cb: DecoOnChangedCb): void {
        this._deco.onChanged(cb);
    }
    clearOnChanged(): number {
        return this._deco.clearOnChanged();
    }
    // endregion events
    $onChanged(assigned: ReflectLike): void {
        this._deco.$onChanged(assigned);
    }

}


