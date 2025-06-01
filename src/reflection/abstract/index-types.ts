import {Dict, Func} from "@leyyo/common";
import {
    DecoDoc,
    DecoDocExtended,
    DecoFilterBelongs,
    DecoIdLike,
    DecoInstanceLike,
    DecoLike,
    Target
} from "../../decorator";

export type ReflectionTag = string|symbol;
export type ReflectionMeta = Record<ReflectionTag, any>;
export interface CoreReflectionLike {
    // region getters
    info(detailed?: boolean): Dict;

    get name(): string;

    get target(): Target;

    get type(): Func;

    get description(): string;

    get code(): string;

    // endregion getters

    appendKeyword(tag: ReflectionTag): this;
    removeKeyword(tag: ReflectionTag): this;
    listKeywords(): Array<ReflectionTag>;
    deleteMetaKey(key: ReflectionTag): this;
    setMetaKey(key: ReflectionTag, value: any): this;
    hasMetaKey(key: ReflectionTag): boolean;
    getMetaKey<T = any>(key: ReflectionTag): T;
    getMetadata<R extends ReflectionMeta = ReflectionMeta>(): R;

    // region decorator
    setValue<V extends Dict>(ins: DecoInstanceLike, value: V): this;
    copyValue<V extends Dict>(ins: DecoInstanceLike, value: V): this;
    sortValues(): this;
    clearValue(ins: DecoInstanceLike): this;

    decorators(filter?: DecoFilterBelongs): Array<DecoIdLike>;

    hasDecorator(fn: Func, filter?: DecoFilterBelongs): boolean;

    hasDecorator(name: string, filter?: DecoFilterBelongs): boolean;

    hasDecorator(decorator: DecoLike, filter?: DecoFilterBelongs): boolean;

    hasDecorator(given: Func | string | DecoLike, filter?: DecoFilterBelongs): boolean;

    // endregion decorator

    // region value
    /**
     * Return list of reflection's decorated documents as [instance (bound to decorator), inherited, value and metadata]
     * */
    listDocsByDeco<V = Dict, M = Dict>(fn: Func, filter?: DecoFilterBelongs, onlyOne?: boolean): Array<DecoDocExtended<V, M>>;

    listDocsByDeco<V = Dict, M = Dict>(name: string, filter?: DecoFilterBelongs, onlyOne?: boolean): Array<DecoDocExtended<V, M>>;

    listDocsByDeco<V = Dict, M = Dict>(decorator: DecoLike, filter?: DecoFilterBelongs, onlyOne?: boolean): Array<DecoDocExtended<V, M>>;

    listDocsByDeco<V = Dict, M = Dict>(given: DecoLike | Func | string, filter?: DecoFilterBelongs, onlyOne?: boolean): Array<DecoDocExtended<V, M>>;

    /**
     * Return reflection's final decorated document as [instance (bound to decorator), inherited, value and metadata]
     * */
    getDocByDeco<V = Dict, M = Dict>(fn: Func, filter?: DecoFilterBelongs): DecoDocExtended<V, M>;

    getDocByDeco<V = Dict, M = Dict>(name: string, filter?: DecoFilterBelongs): DecoDocExtended<V, M>;

    getDocByDeco<V = Dict, M = Dict>(decorator: DecoLike, filter?: DecoFilterBelongs): DecoDocExtended<V, M>;

    getDocByDeco<V = Dict, M = Dict>(given: Func | string | DecoLike, filter?: DecoFilterBelongs): DecoDocExtended<V, M>;


    /**
     * Return list of reflection's decorated values
     * */
    listValuesByDeco<V = Dict>(fn: Func, filter?: DecoFilterBelongs, onlyOne?: boolean): Array<V>;

    listValuesByDeco<V = Dict>(name: string, filter?: DecoFilterBelongs, onlyOne?: boolean): Array<V>;

    listValuesByDeco<V = Dict>(decorator: DecoLike, filter?: DecoFilterBelongs, onlyOne?: boolean): Array<V>;

    listValuesByDeco<V = Dict>(given: DecoLike | Func | string, filter?: DecoFilterBelongs, onlyOne?: boolean): Array<V>;

    /**
     * Return reflection's final decorated value
     * */
    getValueByDeco<V = Dict>(fn: Func, filter?: DecoFilterBelongs): V;

    getValueByDeco<V = Dict>(name: string, filter?: DecoFilterBelongs): V;

    getValueByDeco<V = Dict>(decorator: DecoLike, filter?: DecoFilterBelongs): V;

    getValueByDeco<V = Dict>(given: Func | string | DecoLike, filter?: DecoFilterBelongs): V;

    // endregion value

    // region filter-by
    filterByBelongs(decorator: Func | string, filter?: DecoFilterBelongs): boolean;

    filterByTarget(...targets: Array<Target>): boolean;

    docsByFilter<V = Dict>(filter?: DecoFilterBelongs): Array<DecoDoc<V>>;

    docsAll<V = Dict>(): Array<DecoDoc<V>>;

    // endregion filter-by

    toJSON(simple?: boolean): any;
}
