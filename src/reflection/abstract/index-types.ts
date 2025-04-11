import {Dict, Func} from "@leyyo/common";
import {DecoFilterBelongs, DecoInstanceLike, DecoLike, Target} from "../../decorator";

export interface CoreReflectionLike {
    // region getters
    info(detailed?: boolean): Dict;

    get name(): string;
    get target(): Target;
    get type(): Func;

    get description(): string;

    get currentIdentifier(): DecoLike;

    get currentInstance(): DecoInstanceLike;

    // endregion getters
    // region decorator
    setValue<V extends Dict>(decorator: Func | string, value: V): this;

    decorators(filter?: DecoFilterBelongs): Array<DecoLike>;
    decoMap(filter?: DecoFilterBelongs): Record<string, Array<Dict>>;

    hasDecorator(decorator: Func | string, filter?: DecoFilterBelongs): boolean;

    listValues<V extends Dict = Dict>(decorator: Func | string, filter?: DecoFilterBelongs): Array<V>;

    getValue<V extends Dict = Dict>(decorator: Func | string, filter?: DecoFilterBelongs): V;

    // endregion decorator
    // region filter-by
    filterByBelongs(decorator: Func|string, filter?: DecoFilterBelongs): boolean;

    filterByTarget(...targets: Array<Target>): boolean;

    // endregion filter-by
}