import "reflect-metadata";
import {ReflectionOptionLike} from "./index-types";
import {Arr, ClassLike, Func} from "@leyyo/common";

// console.log(__filename);

// noinspection JSUnusedLocalSymbols
export class ReflectionOption implements ReflectionOptionLike {
    constructor() {
    }

    wrapReflectMetadata(): this {
        // @ts-ignore
        Reflect['decorate'] = (decorators: Array<ClassDecorator | PropertyDecorator | MethodDecorator>, target: Function | ClassLike, targetKey?: PropertyKey, descriptor?: PropertyDescriptor): Function | PropertyDescriptor => {
            return null;
        }
        // function metadata(metadataKey: any, metadataValue: any);
        // set data of an object or property
        Reflect.defineMetadata = (decoId: unknown, decoValue: unknown, clazz: ClassLike | Func, propertyKey?: PropertyKey): void => {
        }
        // check for presence of a metadata key on the prototype chain of an object or property
        Reflect.hasMetadata = (decoId: unknown, clazz: ClassLike | Func, propertyKey?: PropertyKey): boolean => {
            return true;
        }
        Reflect.hasOwnMetadata = (decoId: unknown, clazz: ClassLike | Func, propertyKey?: PropertyKey): boolean => {
            return true;
        }
        // get metadata value of a metadata key on the prototype chain of an object or property
        Reflect.getMetadata = (decoId: unknown, clazz: ClassLike | Func, propertyKey?: PropertyKey): any => {
            return null;
        }
        Reflect.getOwnMetadata = (decoId: unknown, clazz: ClassLike | Func, propertyKey?: PropertyKey): any => {
            return null;
        }
        // get all metadata keys on the prototype chain of an object or property
        Reflect.getMetadataKeys = (clazz: ClassLike | Func, propertyKey?: PropertyKey): Arr => {
            return null;
        }
        Reflect.getOwnMetadataKeys = (clazz: ClassLike | Func, propertyKey?: PropertyKey): Arr => {
            return null;
        }
        // delete metadata from an object or property
        Reflect.deleteMetadata = (decoId: unknown, clazz: ClassLike | Func, propertyKey?: PropertyKey): boolean => {
            return true;
        }
        return this;
    }
}

// noinspection JSUnusedGlobalSymbols
export const reflectOption = new ReflectionOption();