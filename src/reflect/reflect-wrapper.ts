import "reflect-metadata";
import {ReflectOptionLike} from "./types";
import {ArraySome, FuncLike} from "../common";
import {$ly} from "../core";


// noinspection JSUnusedLocalSymbols
/**
 * @skeleton
 * */
export class ReflectWrapper implements ReflectOptionLike {
    constructor() {
        $ly.addFqn(this);
    }
    wrapReflectMetadata(): this {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        Reflect['decorate'] = (decorators: Array<ClassDecorator | PropertyDecorator | MethodDecorator>, clazz: Function|ClassLike, property?: string, descriptor?: PropertyDescriptor): Function | PropertyDescriptor => {
            return undefined;
        }
        // function metadata(metadataKey: any, metadataValue: any);
        // set data of an object or property
        Reflect.defineMetadata = (fn: unknown, value: unknown, clazz: FuncLike, property?: string): void => {
            $ly.emptyFn();
        }
        // check for presence of a metadata key on the prototype chain of an object or property
        Reflect.hasMetadata = (fn: unknown, clazz: FuncLike, property?: string): boolean => {
            return true;
        }
        Reflect.hasOwnMetadata = (fn: unknown, clazz: FuncLike, property?: string): boolean => {
            return true;
        }
        // get metadata value of a metadata key on the prototype chain of an object or property
        Reflect.getMetadata = (fn: unknown, clazz: FuncLike, property?: string): any => {
            return undefined;
        }
        Reflect.getOwnMetadata = (fn: unknown, clazz: FuncLike, property?: string): any => {
            return undefined;
        }
        // get all metadata keys on the prototype chain of an object or property
        Reflect.getMetadataKeys = (clazz: FuncLike, property?: string): ArraySome => {
            return undefined;
        }
        Reflect.getOwnMetadataKeys = (clazz: FuncLike, property?: string): ArraySome => {
            return undefined;
        }
        // delete metadata from an object or property
        Reflect.deleteMetadata = (fn: unknown, clazz: FuncLike, property?: string): boolean => {
            return true;
        }
        return this;
    }
}
// noinspection JSUnusedGlobalSymbols
export const reflectOption = new ReflectWrapper();