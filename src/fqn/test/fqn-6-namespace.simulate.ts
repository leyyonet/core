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

namespace fqn6Ns1 {
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
    // region sub-namespace
    export namespace sub {
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
    // endregion sub-namespace
}


// printDetailed('fqn6-namespace', fqn.report(fqn6Ns1));
export const testFqn6Namespace = (describe: FuncLike, it: FuncLike) => {
    describe('FQN#6 - namespace', () => {
        it('sub namespace should be marked ', () => {
            assert.doesNotThrow(() => {
                leyyo.fqn.namespace({sub: fqn6Ns1.sub}, ...LY_TESTING_FQN, 'fqn6Ns1');
            });
        });
        it('namespace should be marked ', () => {
            assert.doesNotThrow(() => {
                leyyo.fqn.namespace({fqn6Ns1}, ...LY_TESTING_FQN);
            });
        });

        checkFootprint(describe, it, 'fqn6Ns1', fqn6Ns1, `${LY_TESTING_NS}.fqn6Ns1`, 'namespace');

        testAbstractClass(describe, it, fqn6Ns1.AbstractClass, 'fqn6Ns1');
        testBaseClass(describe, it, fqn6Ns1.BaseClass, 'fqn6Ns1');
        testBaseClassInstance(describe, it, new fqn6Ns1.BaseClass(), 'fqn6Ns1');
        testInheritedClass(describe, it, fqn6Ns1.InheritedClass, 'fqn6Ns1');
        testInheritedClassInstance(describe, it, new fqn6Ns1.InheritedClass(), 'fqn6Ns1');
        testInheritedClassInstance(describe, it, fqn6Ns1.inheritedClass, 'fqn6Ns1');
        testAnonymousClass(describe, it, fqn6Ns1.AnonymousClass, 'fqn6Ns1');
        testAnonymousClassInstance(describe, it, new fqn6Ns1.AnonymousClass(), 'fqn6Ns1');

        checkFootprint(describe, it, 'func1 #regular', fqn6Ns1.func1, `${LY_TESTING_NS}.fqn6Ns1.func1`, 'function', 'function-regular');
        checkFootprint(describe, it, 'func2 #arrow', fqn6Ns1.func2, `${LY_TESTING_NS}.fqn6Ns1.func2`, 'function', 'function-anonymous');
        checkFootprint(describe, it, 'func3 $generator', fqn6Ns1.func3, `${LY_TESTING_NS}.fqn6Ns1.func3`, 'function', 'function-generator');
        checkFootprint(describe, it, 'func4 #constructor', fqn6Ns1.Func4, `${LY_TESTING_NS}.fqn6Ns1.Func4`, 'function', 'function-regular');
        checkFootprint(describe, it, 'func4 #instance', fqn6Ns1.func4, `${LY_TESTING_NS}.fqn6Ns1.Func4`, 'function', 'function-regular');

        checkFootprint(describe, it, 'Enum1', fqn6Ns1.Enum1, `${LY_TESTING_NS}.fqn6Ns1.Enum1`, 'enum', 'enum-anonymous');
        checkFootprint(describe, it, 'possibleEnum2', fqn6Ns1.possibleEnum2, `${LY_TESTING_NS}.fqn6Ns1.possibleEnum2`, 'enum', 'enum-anonymous');

        checkFootprint(describe, it, 'obj', fqn6Ns1.obj, `${LY_TESTING_NS}.fqn6Ns1.obj`, 'object');
        checkFootprint(describe, it, 'arr', fqn6Ns1.arr, `${LY_TESTING_NS}.fqn6Ns1.arr`, 'object');
        checkFootprint(describe, it, 'map', fqn6Ns1.map, `${LY_TESTING_NS}.fqn6Ns1.map`, 'object');
        checkFootprint(describe, it, 'set', fqn6Ns1.set, `${LY_TESTING_NS}.fqn6Ns1.set`, 'object');
        checkFootprint(describe, it, 'weakSet', fqn6Ns1.weakSet, `${LY_TESTING_NS}.fqn6Ns1.weakSet`, 'object');
        checkFootprint(describe, it, 'weakMap', fqn6Ns1.weakMap, `${LY_TESTING_NS}.fqn6Ns1.weakMap`, 'object');

        // region sub-namespace

        checkFootprint(describe, it, 'fqn6Ns1.sub', fqn6Ns1.sub, `${LY_TESTING_NS}.fqn6Ns1.sub`, 'namespace');

        testAbstractClass(describe, it, fqn6Ns1.sub.AbstractClass, 'fqn6Ns1.sub');
        testBaseClass(describe, it, fqn6Ns1.sub.BaseClass, 'fqn6Ns1.sub');
        testBaseClassInstance(describe, it, new fqn6Ns1.sub.BaseClass(), 'fqn6Ns1.sub');
        testInheritedClass(describe, it, fqn6Ns1.sub.InheritedClass, 'fqn6Ns1.sub');
        testInheritedClassInstance(describe, it, new fqn6Ns1.sub.InheritedClass(), 'fqn6Ns1.sub');
        testInheritedClassInstance(describe, it, fqn6Ns1.sub.inheritedClass, 'fqn6Ns1.sub');
        testAnonymousClass(describe, it, fqn6Ns1.sub.AnonymousClass, 'fqn6Ns1.sub');
        testAnonymousClassInstance(describe, it, new fqn6Ns1.sub.AnonymousClass(), 'fqn6Ns1.sub');

        checkFootprint(describe, it, 'func1 #regular', fqn6Ns1.sub.func1, `${LY_TESTING_NS}.fqn6Ns1.sub.func1`, 'function', 'function-regular');
        checkFootprint(describe, it, 'func2 #arrow', fqn6Ns1.sub.func2, `${LY_TESTING_NS}.fqn6Ns1.sub.func2`, 'function', 'function-anonymous');
        checkFootprint(describe, it, 'func3 $generator', fqn6Ns1.sub.func3, `${LY_TESTING_NS}.fqn6Ns1.sub.func3`, 'function', 'function-generator');
        checkFootprint(describe, it, 'func4 #constructor', fqn6Ns1.sub.Func4, `${LY_TESTING_NS}.fqn6Ns1.sub.Func4`, 'function', 'function-regular');
        checkFootprint(describe, it, 'func4 #instance', fqn6Ns1.sub.func4, `${LY_TESTING_NS}.fqn6Ns1.sub.Func4`, 'function', 'function-regular');

        checkFootprint(describe, it, 'Enum1', fqn6Ns1.sub.Enum1, `${LY_TESTING_NS}.fqn6Ns1.sub.Enum1`, 'enum', 'enum-anonymous');
        checkFootprint(describe, it, 'possibleEnum2', fqn6Ns1.sub.possibleEnum2, `${LY_TESTING_NS}.fqn6Ns1.sub.possibleEnum2`, 'enum', 'enum-anonymous');

        checkFootprint(describe, it, 'obj', fqn6Ns1.sub.obj, `${LY_TESTING_NS}.fqn6Ns1.sub.obj`, 'object');
        checkFootprint(describe, it, 'arr', fqn6Ns1.sub.arr, `${LY_TESTING_NS}.fqn6Ns1.sub.arr`, 'object');
        checkFootprint(describe, it, 'map', fqn6Ns1.sub.map, `${LY_TESTING_NS}.fqn6Ns1.sub.map`, 'object');
        checkFootprint(describe, it, 'set', fqn6Ns1.sub.set, `${LY_TESTING_NS}.fqn6Ns1.sub.set`, 'object');
        checkFootprint(describe, it, 'weakSet', fqn6Ns1.sub.weakSet, `${LY_TESTING_NS}.fqn6Ns1.sub.weakSet`, 'object');
        checkFootprint(describe, it, 'weakMap', fqn6Ns1.sub.weakMap, `${LY_TESTING_NS}.fqn6Ns1.sub.weakMap`, 'object');

        // endregion sub-namespace
    });
}