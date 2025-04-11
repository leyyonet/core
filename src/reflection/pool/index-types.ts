import {ClassLike, Func, Obj} from "@leyyo/common";
import {DecoFilter, DecoInstanceLike} from "../../decorator";
import {ClassReflectionLike} from "../class";
import {CallbackLike} from "../../callback";

export interface ReflectionPoolLike extends CallbackLike<ClassReflectionLike, ClassLike> {
    // region class
    registerClass(clazz: ClassLike, body?: Obj, currentInstance?: DecoInstanceLike): ClassReflectionLike;

    classesBy(decorator: string | Func, filter?: DecoFilter): Array<ClassReflectionLike>;

    // endregion class
}