// noinspection JSUnusedGlobalSymbols

import assert from "assert";
import {FuncLike, leyyo, LY_TESTING_FQN, LY_TESTING_NS} from "../../index";
import {
    checkFootprint,
    testAbstractClass,
    testAnonymousClass,
    testAnonymousClassInstance,
    testBaseClass,
    testBaseClassInstance,
    testInheritedClass,
    testInheritedClassInstance
} from "./fqn-helper.simulate";

module fqn5Module1 {
    // region class
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
        constructor() {leyyo.emptyFn();}
        static staticMethod5 (): number {return 5;}
        instanceMethod5 (): number {return 5;}
        static staticArrow5 = () => 5;
        instanceArrow5 = () => 5;
        static get staticGet5(): number {return 5;}
        get instanceGet5(): number {return 5;}
    };
    export const inheritedClass = new InheritedClass();
    // endregion class
    // region function
    export function func1() {
        leyyo.emptyFn();
    }
    export const func2 = () => {
        leyyo.emptyFn();
    }
    export function *func3(i) {
        yield i;
        yield i + 10;
    }
    export function Func4() {
        this.property = 'foo bar';
    }
    export const func4 = new Func4();
    // endregion function
    // region enum
    export enum Enum1 {
        KEY1 = 'key1'
    }
    export const possibleEnum2 = {
        key1: 1,
        key2: 2,
    }
    // endregion enum
    // region object
    export const obj = {
        fnc1() {
            leyyo.emptyFn();
        },
        property: 5,
        arr: [],
    }
    export const arr = [1,2,3];
    export const map = new Map();
    export const set = new Set();
    export const weakSet = new WeakSet();
    export const weakMap = new WeakMap();
    // endregion object
}

export const testFqn5Module = (describe: FuncLike, it: FuncLike) => {
    describe('FQN#5 - module', () => {
        it('module should be marked ', () => {
            assert.doesNotThrow(() => {
                leyyo.fqn.module({fqn5Module1}, ...LY_TESTING_FQN);
            });
        });
        checkFootprint(describe, it, 'fqn5Module1', fqn5Module1, `${LY_TESTING_NS}.fqn5Module1`, 'module');

        testAbstractClass(describe, it, fqn5Module1.AbstractClass, 'fqn5Module1');
        testBaseClass(describe, it, fqn5Module1.BaseClass, 'fqn5Module1');
        testBaseClassInstance(describe, it, new fqn5Module1.BaseClass(), 'fqn5Module1');
        testInheritedClass(describe, it, fqn5Module1.InheritedClass, 'fqn5Module1');
        testInheritedClassInstance(describe, it, new fqn5Module1.InheritedClass(), 'fqn5Module1');
        testInheritedClassInstance(describe, it, fqn5Module1.inheritedClass, 'fqn5Module1');
        testAnonymousClass(describe, it, fqn5Module1.AnonymousClass, 'fqn5Module1');
        testAnonymousClassInstance(describe, it, new fqn5Module1.AnonymousClass(), 'fqn5Module1');

        checkFootprint(describe, it, 'func1 #regular', fqn5Module1.func1, `${LY_TESTING_NS}.fqn5Module1.func1`, 'function', 'function-regular');
        checkFootprint(describe, it, 'func2 #arrow', fqn5Module1.func2, `${LY_TESTING_NS}.fqn5Module1.func2`, 'function', 'function-anonymous');
        checkFootprint(describe, it, 'func3 $generator', fqn5Module1.func3, `${LY_TESTING_NS}.fqn5Module1.func3`, 'function', 'function-generator');
        checkFootprint(describe, it, 'func4 #constructor', fqn5Module1.Func4, `${LY_TESTING_NS}.fqn5Module1.Func4`, 'function', 'function-regular');
        checkFootprint(describe, it, 'func4 #instance', fqn5Module1.func4, `${LY_TESTING_NS}.fqn5Module1.Func4`, 'function', 'function-regular');

        checkFootprint(describe, it, 'Enum1', fqn5Module1.Enum1, `${LY_TESTING_NS}.fqn5Module1.Enum1`, 'enum', 'enum-anonymous');
        checkFootprint(describe, it, 'possibleEnum2', fqn5Module1.possibleEnum2, `${LY_TESTING_NS}.fqn5Module1.possibleEnum2`, 'enum', 'enum-anonymous');

        checkFootprint(describe, it, 'obj', fqn5Module1.obj, `${LY_TESTING_NS}.fqn5Module1.obj`, 'object');
        checkFootprint(describe, it, 'arr', fqn5Module1.arr, `${LY_TESTING_NS}.fqn5Module1.arr`, 'object');
        checkFootprint(describe, it, 'map', fqn5Module1.map, `${LY_TESTING_NS}.fqn5Module1.map`, 'object');
        checkFootprint(describe, it, 'set', fqn5Module1.set, `${LY_TESTING_NS}.fqn5Module1.set`, 'object');
        checkFootprint(describe, it, 'weakSet', fqn5Module1.weakSet, `${LY_TESTING_NS}.fqn5Module1.weakSet`, 'object');
        checkFootprint(describe, it, 'weakMap', fqn5Module1.weakMap, `${LY_TESTING_NS}.fqn5Module1.weakMap`, 'object');

    });
}