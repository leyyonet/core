import {$ly} from "../core";
import {ClassLike, RecKey, RecLike} from "../common";
import {ExceptionLike, MultipleException, NotImplementedException} from "../error";
import {PropertyReflectLike} from "../reflect";
import {CastDocIn, CastFilterIn, CastGraphQLIn} from "../cast";
import {FieldType} from "../api";
import {GenericsIdentifier, GenericsTreeLike} from "../generics";

/**
 * @abstract
 * */
export class AbstractMap<K extends RecKey = string, V = unknown> extends Map<K, V> {
    constructor(value?: unknown) {
        super();
        if ($ly.primitive.isObjectFilled(value)) {
            const cloned = (value instanceof Map) ? {...(Object.fromEntries(value as Map<unknown, unknown>))} : {...(value as RecLike)};
            const errors = [] as Array<ExceptionLike>;
            Object.keys(cloned).forEach((key) => {
                try {
                    this.set(key as K, (cloned[key] !== undefined) ? cloned[key] : undefined);
                } catch (e) {
                    MultipleException.append(errors, key, e);
                }
            });
            MultipleException.throwAll(errors);
        }
    }

    protected _castItem(item?: V|unknown): V {
        throw new NotImplementedException('_castItem', {item}).with(this);
    }
    protected static _cast<T extends RecLike>(clazz: ClassLike, value: unknown): T {
        if ($ly.not(value)) {
            return undefined;
        }
        return (($ly.primitive.isObject(value) && value instanceof clazz) ? value : new clazz(value)) as unknown as T;
    }

    static cast(value: unknown): unknown {
        return this._cast(this, value);
    }

    set(key: K, value: V|unknown): this {
        return super.set(key, this._castItem(value));
    }

    static $validate?<T = unknown>(value: T): T {
        throw new NotImplementedException('Dto.$validate', {value});
    }
    static $castDoc?(ref: PropertyReflectLike, openApi: CastDocIn): unknown {
        return {type: FieldType.OBJECT}; // todo
    }
    static $castGraphQL?(ref: PropertyReflectLike, gql: CastGraphQLIn): unknown {
        throw new NotImplementedException('Dto.$castGraphQL', {target: ref.description});
    }
    static $castFilter?(ref: PropertyReflectLike, filter: CastFilterIn): unknown {
        throw new NotImplementedException('Dto.$castFilter', {target: ref.description});
    }
    static gen<V = unknown>(identifier: GenericsIdentifier, value: unknown): V {
        throw new NotImplementedException('Generics.gen', {identifier, value});
    }
    static $genDoc?(tree: GenericsTreeLike, ref: PropertyReflectLike, openApi: CastDocIn): unknown {
        throw new NotImplementedException('Generics.$genDoc', {target: ref.description, tree});
    }
    static $genGraphQL?(tree: GenericsTreeLike, ref: PropertyReflectLike, gql: CastGraphQLIn): unknown {
        throw new NotImplementedException('Generics.$genGraphQL', {target: ref.description, tree});
    }
    static $genFilter?(tree: GenericsTreeLike, ref: PropertyReflectLike, filter: CastFilterIn): unknown {
        throw new NotImplementedException('Generics.$genFilter', {target: ref.description, tree});
    }
    static $genBuild?(...children: Array<GenericsIdentifier>): GenericsTreeLike {
        throw new NotImplementedException('Generics.$genBuild', {children});
    }

}
$ly.addFqn(AbstractMap);
let _LOG = $ly.preLog;
$ly.addTrigger('logger', () => {
    _LOG = $ly.logger.assign(AbstractMap);
});