import {ClassLike, Fnc, Func, Obj} from "@leyyo/common";
import {DecoFilter} from "../../decorator";
import {ClassReflectionCopyLambda, ClassReflectionLike} from "../class";
import {NamedDepotItem, NamedDepotName} from "../../named";

export interface ReflectionPoolLike {

    // region class
    classes(): Array<ClassReflectionLike>;

    getBase(value: NamedDepotName, required?: boolean): NamedDepotItem<ClassReflectionLike, ClassLike>;

    get(value: NamedDepotName, required?: boolean): ClassReflectionLike;

    registerClass(clazz: ClassLike, prototype?: Obj, instances?: ClassReflectionCopyLambda, statics?: ClassReflectionCopyLambda): ClassReflectionLike;
    isRegistered(clazz: ClassLike): boolean;

    classesBy(decorator: string | Func, filter?: DecoFilter): Array<ClassReflectionLike>;

    addProxy(source: ClassReflectionLike | ClassLike, target: ClassReflectionLike | ClassLike, recursive?: boolean): void;

    // endregion class
}
