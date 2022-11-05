import {AbstractReflect} from "./abstract-reflect";
import {FuncLike, RecLike} from "../common";
import {DecoLike} from "../deco";
import {ParameterReflectLike, PropertyReflectLike, ReflectParameterDescribed} from "./types";
import {$ly} from "../core";
import {DeveloperException} from "../error";

let _LOG = $ly.preLog;

/**
 * @instance
 * */
export class ParameterReflect extends AbstractReflect implements ParameterReflectLike {
    // region properties
    private readonly _property: PropertyReflectLike;
    private readonly _index: number;
    private _name: string;
    private _typeFn: FuncLike;
    private _namedType: string;
    // endregion properties

    static {
        $ly.addFqn(this);
        $ly.addTrigger('logger', () => {
            _LOG = $ly.logger.assign(this);
        });
    }
    getDescribed(): ReflectParameterDescribed {
        return {
            ...this._property.getDescribed(),
            target: 'parameter',
            index: this._index,
        } as ReflectParameterDescribed;
    }

    constructor(property: PropertyReflectLike, index: number, typeFn: FuncLike) {
        super();
        this._target = 'parameter';
        this._property = property;
        this._index = index;
        this._typeFn = typeof typeFn === 'function' ? typeFn : undefined;
    }

    // region getters
    info(detailed?: boolean): RecLike {
        if (!detailed) {
            return {
                index: this._index,
                name: this._name,
                typeFn: this._typeFn ? $ly.fqn.get(this._typeFn) : undefined,
            }
        }
        return {
            index: this._index,
            name: this._name,
            description: this.description,
            property: this._property.description,
            typeFn: this._typeFn ? $ly.fqn.getFootprint(this._typeFn) : undefined,
        }
    }
    get property(): PropertyReflectLike {
        return this._property;
    }
    get index(): number {
        return this._index;
    }
    get typeFn(): FuncLike {
        return this._typeFn;
    }
    $setTypeFn(fn: FuncLike): void {
        if (typeof fn !== "function") {
            throw new DeveloperException('reflect:parameter.typeFn.not.function').with(this);
        }
        this._typeFn = fn; // todo
    }
    get namedType(): string {
        return this._namedType;
    }
    $setNamedType(namedType: string): void {
        this._namedType = $ly.primitive.check(this, 'namedType', namedType, $ly.primitive.textFilled, {parameter: this.description});
    }
    get name(): string {
        return this._name ?? `#${this._index}`;
    }
    $setName(name: string): void {
        if (this._name) {
            return;
        }
        if (!name) {
            return;
        }
        this._name = $ly.primitive.check(this, 'name', name, $ly.primitive.textFilled, {parameter: this.getDescribed()});
    }
    get description(): string {
        const prop = this._property;
        const sign = (prop.keyword === 'instance') ? '->' : '::';
        return `<parameter>${prop.clazz.name}${sign}${prop.name as string}#${this._index}` + (this._name ? ` (${this._name})` : '');
    }
    get shortDescription(): string {
        const prop = this._property;
        const sign = (prop.keyword === 'instance') ? '->' : '::';
        return `<P>${prop.clazz.baseName}${sign}${prop.name as string}#${this._index}` + (this._name ? ` (${this._name})` : '');

    }
    // endregion getters

    // region decorator
    decorators(): Array<FuncLike> {
        return super.decorators();
    }
    hasDecorator(identifier: DecoLike | FuncLike | string): boolean {
        return super.hasDecorator(identifier);
    }
    listValues<V extends RecLike = RecLike>(identifier: DecoLike | FuncLike | string): Array<V> {
        return super.listValues<V>(identifier);
    }
    getValue<V extends RecLike = RecLike>(identifier: DecoLike | FuncLike | string): V {
        return super.getValue<V>(identifier);
    }
    // endregion decorator

}
