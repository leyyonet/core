import {$descriptor, $dev, $is, $log, ClassLike, Func, Obj} from "@leyyo/common";
import {ClassReflection, ClassReflectionLike} from "../class";
import {ReflectionPoolLike} from "./index.types";
import {DecoFilter} from "../../decorator";
import {core} from "../../core";
import {NamedDepotItem, NamedDepotLike, NamedDepotName, NamedDepotSecure} from "../../named";
import {FQN_PCK} from "../internal";
import {$$coreInternalOn} from "../../internal";
import {ProxySign} from "../../proxy";


export class ReflectionPool implements ReflectionPoolLike {
    protected readonly _depot: NamedDepotLike<ClassReflectionLike, ClassLike>;
    protected readonly _secure: NamedDepotSecure<ClassReflectionLike, ClassLike>;
    private readonly logger = $log.create(ReflectionPool);

    constructor() {
        this._depot = core.namedPool.assign<ClassReflectionLike, ClassLike>(
            FQN_PCK, 'pool.classes',
            ins => ins.creator,
            ins => ins instanceof ClassReflection);

        this._secure = this._depot.$secure;
    }

    // region class
    classes(): Array<ClassReflectionLike> {
        return this._secure.$bases.map(base => base.value);
    }

    getBase(value: NamedDepotName, required?: boolean): NamedDepotItem<ClassReflectionLike, ClassLike> {
        if ($is.object(value)) {
            value = (value as Obj).constructor as ClassLike;
        }
        return this._depot.get(value, required);
    }

    get(value: NamedDepotName, required?: boolean): ClassReflectionLike {
        return this.getBase(value, required)?.value;
    }

    registerClass(value: ClassLike, prototype?: Obj): ClassReflectionLike {
        const base = this.getBase(value, false);
        if (base) {
            return base.value;
        }
        const ref = new ClassReflection(value, prototype);
        const [, lookup] = this._secure.$add(ref);
        this.logger.debug(`${lookup.basic} is reflected`);
        return ref;
    }

    classesBy(decorator: string | Func, filter?: DecoFilter): Array<ClassReflectionLike> {
        const id = core.decoratorPool.get(decorator, false);
        if (!id) {
            return [];
        }
        return this._depot.bases
            .filter(base => base.value.hasDecorator(id.fn, filter))
            .map(base => base.value);
    }

    // endregion class
    addProxy(source: ClassReflectionLike | ClassLike, target: ClassReflectionLike | ClassLike, recursive?: boolean): void {
        let targetPointer: ClassLike;
        if (this._secure.$isLambda(target as ClassReflectionLike)) {
            targetPointer = this._depot.$secure.$getPointer(target);
        } else {
            targetPointer = target as ClassLike;
        }

        const targetAll = core.proxyHandler.getAll(targetPointer);
        if (targetAll.has(this._secure.$proxyInherits)) {
            throw $dev.developerError({
                issue: 'target.already.extends.another.class',
                where: 'leyyo.reflection.ReflectionPool'
            });
        }
        if (targetAll.has(this._secure.$proxyInheritedBy)) {
            throw $dev.developerError({
                issue: 'target.already.extended.by.another.class',
                where: 'leyyo.reflection.ReflectionPool'
            });
        }

        let sourcePointer: ClassLike;
        if (this._secure.$isLambda(source as ClassReflectionLike)) {
            sourcePointer = this._secure.$getPointer(source);
        } else {
            sourcePointer = source as ClassLike;
        }
        const sourceAll = core.proxyHandler.getAll(sourcePointer);
        if (sourceAll.has(this._secure.$proxyInheritedBy)) {
            throw $dev.developerError({
                issue: 'source.already.extended.by.another.class',
                where: 'leyyo.reflection.ReflectionPool'
            });
        }
        const oldBase = this._depot.get(source);

        if (oldBase) {
            // add to class repo
            this.registerClass(targetPointer, oldBase.value.body);
        } else {
            // add to class repo
            this.registerClass(targetPointer, null);
        }
        core.nameHandler.copy(sourcePointer, targetPointer);
        core.fqnHandler.copy(sourcePointer, targetPointer);
        core.footprint.copy(sourcePointer, targetPointer);
        this._depot.addProxy(source, target, false);

        // clone name and add proxied into the keywords
        core.footprint.appendKeyword(sourcePointer, ProxySign);
    }

    toJSON(): any {
        return {
            __: ReflectionPool.name,
            bases: this._secure.$bases,
        };
    }

}

$$coreInternalOn('class-pool-3', () => {
    core.$secure.$setReflectionPool(new ReflectionPool());
});
$$coreInternalOn('class-instance', () => {
    core.fqnHandler.clazz(ReflectionPool, FQN_PCK);
});
