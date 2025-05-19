import {ClassLike, Dict, Func, Obj, ShiftMain, ShiftSecure} from "@leyyo/common";
import {CoreReflectionLike} from "../abstract";
import {DecoCLearType, DecoFilter, DecoFilterKind, DecoKeyword, DecoKind, DecoLike} from "../../decorator";
import {PropertyReflectionLike} from "../property";
import {FootprintInspected} from "../../footprint";

export interface ClassReflectionLike extends CoreReflectionLike, ShiftSecure<ClassReflectionSecure> {
    // region getters
    info(detailed?: boolean): Dict;

    get parent(): ClassReflectionLike;

    get creator(): ClassLike;

    get body(): Obj;

    get inspected(): FootprintInspected;

    // endregion getters
    // region methods
    create<C>(...params: Array<unknown>): C;

    // endregion methods
    // region instance-properties
    listInstancePropertyNames(filter?: DecoFilterKind): Array<string>;

    listInstanceProperties(filter?: DecoFilterKind): Array<PropertyReflectionLike>;

    getInstanceProperty(name: PropertyKey, filter?: DecoFilterKind): PropertyReflectionLike;

    hasInstanceProperty(name: PropertyKey, filter?: DecoFilterKind): boolean

    // endregion instance-properties
    // region static-properties
    listStaticPropertyNames(filter?: DecoFilterKind): Array<string>;

    listStaticProperties(filter?: DecoFilterKind): Array<PropertyReflectionLike>;

    getStaticProperty(name: PropertyKey, filter?: DecoFilterKind): PropertyReflectionLike;

    hasStaticProperty(name: PropertyKey, filter?: DecoFilterKind): boolean

    // endregion static-properties
    // region any-properties
    listAnyProperties(filter?: DecoFilter, decorator?: Func): Array<PropertyReflectionLike>;

    listAnyProperties(filter?: DecoFilter, decorator?: string): Array<PropertyReflectionLike>;

    getAnyProperty(name: PropertyKey, filter?: DecoFilter): PropertyReflectionLike;

    hasAnyProperty(name: PropertyKey, filter?: DecoFilter): boolean;

    // endregion any-properties
}

export interface ClassReflectionSecure extends CoreReflectionLike, ShiftMain<ClassReflectionLike> {
    $registerProperty(name: PropertyKey, keyword: DecoKeyword, kind: DecoKind, callable?: Func): PropertyReflectionLike;

    $clearValues(type: DecoCLearType, ...decorators: Array<Func | DecoLike | string>): this;

    $usePrototypeAsBody(): void;
}
