// noinspection JSUnusedGlobalSymbols

import assert from "assert";
import {FuncLike, leyyo, LY_TESTING_FQN} from "../../index";
import {
    testAbstractClass,
    testAnonymousClass,
    testAnonymousClassInstance,
    testBaseClass,
    testBaseClassInstance,
    testInheritedClass,
    testInheritedClassInstance
} from "./fqn-helper.simulate";

export class AbstractClass {
    static staticMethod1 (): number {return 1;}
    instanceMethod1 (): number {return 1;}
    static staticArrow1 = () => 1;
    instanceArrow1 = () => 1;
    static get staticGet1(): number {return 1;}
    get instanceGet1(): number {return 1;}

    static staticMethod2 (): number {return 2;}
    instanceMethod2 (): number {return 2;}
    static staticArrow2 = () => 2;
    instanceArrow2 = () => 2;
    static get staticGet2(): number {return 2;}
    get instanceGet2(): number {return 2;}
}
export class BaseClass extends AbstractClass {
    static staticMethod2 (): number {return 2;}
    instanceMethod2 (): number {return 2;}
    static staticArrow2 = () => 2;
    instanceArrow2 = () => 2;
    static get staticGet2(): number {return 2;}
    get instanceGet2(): number {return 2;}

    static staticMethod3 (): number {return 3;}
    instanceMethod3 (): number {return 3;}
    static staticArrow3 = () => 3;
    instanceArrow3 = () => 3;
    static get staticGet3(): number {return 3;}
    get instanceGet3(): number {return 3;}
}
export class InheritedClass extends BaseClass {
    static staticMethod3 (): number {return 3;}
    instanceMethod3 (): number {return 3;}
    static staticArrow3 = () => 3;
    instanceArrow3 = () => 3;
    static get staticGet3(): number {return 3;}
    get instanceGet3(): number {return 3;}

    static staticMethod4 (): number {return 4;}
    instanceMethod4 (): number {return 4;}
    static staticArrow4 = () => 4;
    instanceArrow4 = () => 4;
    static get staticGet4(): number {return 4;}
    get instanceGet4(): number {return 4;}
}
export const AnonymousClass = class {
    constructor() {
        leyyo.emptyFn();
    }
    static staticMethod5 (): number {return 5;}
    instanceMethod5 (): number {return 5;}
    static staticArrow5 = () => 5;
    instanceArrow5 = () => 5;
    static get staticGet5(): number {return 5;}
    get instanceGet5(): number {return 5;}
};



export const testFqn1Class = (describe: FuncLike, it: FuncLike) => {
    describe('FQN#1 - class', () => {
        it('Class should be marked ', () => {
            assert.doesNotThrow(() => {
                leyyo.fqn.clazz(AbstractClass, ...LY_TESTING_FQN);
            });
            assert.doesNotThrow(() => {
                leyyo.fqn.clazz(BaseClass, ...LY_TESTING_FQN);
            });
            assert.doesNotThrow(() => {
                leyyo.fqn.clazz(InheritedClass, ...LY_TESTING_FQN);
            });
            assert.doesNotThrow(() => {
                Object.defineProperty(AnonymousClass, 'name', {
                    value: 'AnonymousClass',
                    configurable: false,
                    writable: false,
                    enumerable: false
                });
                leyyo.fqn.clazz(AnonymousClass, ...LY_TESTING_FQN);
            });
        });
        testAbstractClass(describe, it, AbstractClass, undefined);
        testBaseClass(describe, it, BaseClass, undefined);
        testBaseClassInstance(describe, it, new BaseClass(), undefined);
        testInheritedClass(describe, it, InheritedClass, undefined);
        testInheritedClassInstance(describe, it, new InheritedClass(), undefined);
        testAnonymousClass(describe, it, AnonymousClass, undefined);
        testAnonymousClassInstance(describe, it, new AnonymousClass(), undefined);
    });
}