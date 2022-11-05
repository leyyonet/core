// noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected,JSUnusedGlobalSymbols


import {ExceptionLike, MultipleException, NotImplementedException} from "../error";
import {CastDocIn, CastDocOut, CastFilterIn, CastFilterOut, CastGraphQLIn, CastGraphQLOut, CastOption} from "../cast";
import {ClassLike, FuncLike, RecLike} from "../common";
import {FieldType} from "../api";
import {$ly} from "../core";
import {PropertyReflectLike} from "../reflect";
import {GenericsIdentifier, GenericsTreeLike} from "../generics";

let _LOG = $ly.preLog;
// noinspection JSUnusedLocalSymbols
/**
 * @abstract
 * */
export class AbstractDto implements RecLike {
    protected static LOG = $ly.preLog;
    [key: string]: unknown;

    constructor(value?: unknown) {
        $ly.symbol.set(this, 'cast', {});
        const keys: Array<string> = [];
        const errors = [] as Array<ExceptionLike>;
        if ($ly.primitive.isObjectFilled(value)) {
            // console.log('constructor ' + Object.getPrototypeOf(this).constructor.name, value);
            const entries = (value instanceof Map) ? Object.fromEntries(value as Map<unknown, unknown>) : Object.entries(value);
            for (const [k, v] of entries) {
                if (typeof k !== 'symbol') {
                    try {
                        this[k] = v;
                    } catch (e) {
                        MultipleException.append(errors, k, e);
                    }
                    keys.push(k);
                }
            }
        }
        const cRef = $ly.reflect.getClass(this.constructor, false);
        if (cRef) {
            try {
                cRef
                    .listInstancePropertyNames({kind: "field"})
                    .filter(k => !keys.includes(k))
                    .forEach(k => {
                        try {
                            this[k] = undefined;
                        } catch (e) {
                            _LOG.native(e, 'cast.default.property', {clazz: $ly.fqn.get(this.constructor), property: k});
                        }
                    });
            } catch (e) {
                _LOG.native(e, 'cast.default.property', {clazz: $ly.fqn.get(this.constructor)});
            }
        }
        MultipleException.throwAll(errors);
    }

    static {

    }

    static cast<T = unknown>(value: unknown): T {
        return this._cast(this, value);
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

    protected static _cast<T = unknown>(clazz: ClassLike, value: unknown): T {
        if ($ly.not(value)) {
            return value as T;
        }
        return (($ly.primitive.isObject(value) && value instanceof clazz) ? value : new clazz(value)) as T;
    }

    toJSON(): RecLike {
        console.log('------- ' + this?.constructor?.name + ' ----');
        const result = {};
        const keys: Array<string> = [];
        for (const [k, v] of Object.entries(this)) {
            if (typeof k !== 'symbol') {
                result[k] = $ly.primitive.value(v);
                console.log('# ' + this?.constructor?.name + ' => ' + k, result[k]);
                keys.push(k);
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let parent = this;
        while (parent) {
            if (parent?.constructor === AbstractDto) {
                break;
            }
            // const desc = Object.getOwnPropertyDescriptor(parent, 'toJSON');
            const rec = $ly.symbol.get(parent, 'cast', {});
            if ($ly.primitive.isObject(rec)) {
                for (const [k, v] of Object.entries(rec)) {
                    if (typeof k !== 'symbol' && !keys.includes(k)) {
                        result[k] = $ly.primitive.value(v);
                        console.log('$ ' + parent?.constructor?.name + ' => ' + k, result[k]);
                        keys.push(k);
                    }
                }
            }
            parent = Object.getPrototypeOf(parent);
        }
        return result as RecLike;
    }
}
$ly.addFqn(AbstractDto);
$ly.addTrigger('logger', () => {
    _LOG = $ly.logger.assign(AbstractDto);
});

/*
* function AssignCtor<T extends object>() {
    return class {
        constructor(t: T) {
            Object.assign(this, t)
        }
    } as { new(t: T): T }
}

interface CommunityProps {
    prop1: string
    prop2: number
    prop3: boolean
}
class Community extends AssignCtor<CommunityProps>() {

}

const comm = new Community({ prop1: "", prop2: 1, prop3: true });
console.log(comm.prop2.toFixed(1)) // 1.0
*
* */