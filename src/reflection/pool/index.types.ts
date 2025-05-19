import {ClassLike, Func, Obj} from "@leyyo/common";
import {DecoFilter} from "../../decorator";
import {ClassReflectionLike} from "../class";
import {NamedDepotItem, NamedDepotName} from "../../named";

export interface ReflectionPoolLike {

    // region class
    classes(): Array<ClassReflectionLike>;

    getBase(value: NamedDepotName, required?: boolean): NamedDepotItem<ClassReflectionLike, ClassLike>;

    get(value: NamedDepotName, required?: boolean): ClassReflectionLike;

    registerClass(clazz: ClassLike, prototype?: Obj): ClassReflectionLike;

    classesBy(decorator: string | Func, filter?: DecoFilter): Array<ClassReflectionLike>;

    addProxy(source: ClassReflectionLike | ClassLike, target: ClassReflectionLike | ClassLike, recursive?: boolean): void;

    // endregion class
}
