import {ClassReflection, ClassReflectionLike} from "../class";
import {ReflectionPoolLike} from "./index-types";
import {DecoFilter, DecoInstanceLike} from "../../decorator";
import {ClassLike, DeveloperException, Func, is, Obj} from "@leyyo/common";
import {core} from "../../core";
import {AbstractCallback, CallbackBase, CallbackName} from "../../callback";

// console.log(__filename);

export class ReflectionPool extends AbstractCallback<ClassReflectionLike, ClassLike> implements ReflectionPoolLike {

    constructor() {
        super('reflection', ins => ins.creator, ins => ins instanceof ClassReflection);
    }

    // region class

    get(value: CallbackName, required?: boolean): CallbackBase<ClassReflectionLike, ClassLike> {
        if (is.object(value)) {
            value = (value as Obj).constructor as ClassLike;
        }
        return super.get(value, required);
    }

    registerClass(value: ClassLike, body?: Obj, currentInstance?: DecoInstanceLike): ClassReflectionLike {
        const base = this.get(value, false);
        if (base) {
            return base.value;
        }
        const reflection = new ClassReflection(value, body, currentInstance);
        this.add(reflection);
        return reflection;
    }

    classesBy(decorator: string | Func, filter?: DecoFilter): Array<ClassReflectionLike> {
        const id = core.decorator.get(decorator, false)?.value;
        if (!id) {
            return [];
        }
        return this.bases
            .filter(base => base.value.hasDecorator(id.fn, filter))
            .map(base => base.value);
    }
    // endregion class
    addProxy(source: ClassReflectionLike|ClassLike, target: ClassReflectionLike|ClassLike, recursive?: boolean): void {
        let targetPointer: ClassLike;
        if (this._isValue(target as ClassReflectionLike)) {
            targetPointer = this._getPointer(target);
        }
        else {
            targetPointer = target as ClassLike;
        }

        const targetAll = core.proxy.getAll(targetPointer);
        if (targetAll[`${this._bucket}:parents`]) {
            throw new DeveloperException('target already extends another class');
        }
        if (targetAll[`${this._bucket}:to`]) {
            throw new DeveloperException('target was already extended by another class');
        }

        let sourcePointer: ClassLike;
        if (this._isValue(source as ClassReflectionLike)) {
            sourcePointer = this._getPointer(source);
        }
        else {
            sourcePointer = source as ClassLike;
        }
        const sourceDesc = core.proxy.getAll(sourcePointer);
        if (sourceDesc[`${this._bucket}:to`]) {
            throw new DeveloperException('source was already extended by another class');
        }
        const oldBase = core.reflection.get(source);

        if (oldBase) {
            // add to class repo
            this.registerClass(targetPointer, oldBase.value.body, null);
        }
        else {
            // add to class repo
            this.registerClass(targetPointer, null, null);
        }

        super.addProxy(source, target, false);

        // clone name and add proxied into the keywords
        core.proxy.copyFootprint(sourcePointer, targetPointer, true);

        // copy class name
        core.proxy.copyBasic(sourcePointer, targetPointer);

        // generate footprint
        core.footprint.inspect(targetPointer);
    }
}