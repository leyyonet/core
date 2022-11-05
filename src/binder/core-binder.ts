import {CoreBinderLike} from "./types";
import {ClassLike, FuncLike, ObjectLike, ObjectOrFunction} from "../common";
import {$ly} from "../core";


/**
 * @core
 * */
export class CoreBinder implements CoreBinderLike {
    // region properties
    protected LOG = $ly.preLog;

    // endregion properties
    constructor() {
        $ly.addFqn(this);
        $ly.addTrigger('logger', () => {this.LOG = $ly.logger.assign(this)});
    }
    static {
        $ly.addDependency('binder', () => new CoreBinder());
    }

    // region interval
    setClearBound(fn: FuncLike): boolean {
        const name = fn?.name as string;
        if (name && name.startsWith('bound ')) {
            const parts = name.split(' ');
            parts.shift();
            this.setName(fn, parts.join(' '));
            return true;
        }
        return false;
    }
    bindAll(clazz: ObjectOrFunction): void {
        if (!clazz || !['function', 'object'].includes(typeof clazz)) {
            return;
        }
        const name = (typeof clazz === 'function') ? clazz.name : (clazz as ObjectLike).constructor?.name;
        if (!$ly.system.isCustomClass(name)) {
            return;
        }
        const footprint = $ly.fqn.getFootprint(clazz);
        if (typeof clazz === 'function') {
            if (footprint && !$ly.fqn.is(clazz)) {
                $ly.fqn.clazz(clazz as ClassLike);
            }
            this._bindStaticProperties(clazz as FuncLike, footprint?.name);
        } else {
            if (footprint && !$ly.fqn.is(clazz?.constructor)) {
                $ly.fqn.clazz(clazz?.constructor as ClassLike);
            }
            this._bindInstanceProperties(clazz as ObjectLike, footprint?.name);
        }
    }

    protected _bindStaticProperties(clazz: FuncLike, name?: string): void {
        if (name) {
            Object.getOwnPropertyNames(clazz).forEach(property => {
                switch ($ly.fqn.getSource(clazz, property, false)) {
                    case "function":
                        const old = clazz[property].name;
                        clazz[property] = clazz[property].bind(clazz);
                        $ly.fqn.setFootprint(clazz[property], `${name}.${property}`, 'method', 'static');
                        this.setName(clazz[property], old);
                        break;
                    case "getter":
                        break;
                }
            });
            return;
        }
        Object.getOwnPropertyNames(clazz).forEach(property => {
            const descriptor = $ly.system.propertyDescriptor(clazz, property, false);
            if (typeof descriptor?.value === 'function') {
                const old = clazz[property].name;
                clazz[property] = clazz[property].bind(clazz);
                this.setName(clazz[property], old);
            }
        });
    }
    protected _bindInstanceProperties(clazz: ObjectLike, name?: string): void {
        const proto = clazz?.constructor?.prototype as FuncLike;
        if (!proto) {
            return;
        }
        if (name) {
            Object.getOwnPropertyNames(proto).forEach(property => {
                switch ($ly.fqn.getSource(proto, property, true)) {
                    case "function":
                        const old = proto[property].name;
                        clazz[property] = clazz[property].bind(clazz);
                        $ly.fqn.setFootprint(proto[property], `${name}.${property}`, 'method', 'instance');
                        this.setName(proto[property], old);
                        break;
                    case "getter":
                        break;
                }
            });
            return;
        }
        Object.getOwnPropertyNames(proto).forEach(property => {
            const descriptor = $ly.system.propertyDescriptor(proto, property, true);
            if (typeof descriptor?.value === 'function') {
                const old = proto[property].name;
                proto[property] = proto[property].bind(clazz);
                this.setName(proto[property], old);
            }
        });
    }

    // endregion interval

    // region public
    setName(fn: FuncLike, name: string): void {
        Object.defineProperty(fn, 'name', {
            value: name,
            configurable: true,
            writable: false,
            enumerable: false,
        });
    }
    refreshBoundNames(target: ObjectOrFunction): number {
        if (!target || !['function', 'object'].includes(typeof target)) {
            return 0;
        }
        const name = (typeof target === 'function') ? target.name : (target as ObjectLike).constructor?.name;
        if (!$ly.system.isCustomClass(name)) {
            return 0;
        }
        let size = 0;
        if (typeof target === 'function') {
            Object.getOwnPropertyNames(target).forEach(property => {
                const descriptor = $ly.system.propertyDescriptor(target, property, false);
                if (typeof descriptor?.value === 'function') {
                    if (this.setClearBound(target[property])) {
                        size++;
                    }
                }
            });
        } else {
            const proto = target?.constructor?.prototype as FuncLike;
            if (!proto) {
                return size;
            }
            Object.getOwnPropertyNames(proto).forEach(property => {
                const descriptor = $ly.system.propertyDescriptor(proto, property, true);
                if (typeof descriptor?.value === 'function') {
                    if (this.setClearBound(target[property])) {
                        size++;
                    }
                }
            });
            return size;
        }
    }

    // endregion public
}
