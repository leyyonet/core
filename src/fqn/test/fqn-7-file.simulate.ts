// noinspection JSUnusedGlobalSymbols

import assert from "assert";
import {FuncLike, leyyo, LY_TESTING_FQN, LY_TESTING_NS} from "../../index";
import * as foo from "./fqn-7-inner.simulate";
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


export const testFqn7File = (describe: FuncLike, it: FuncLike) => {
    describe('FQN#7 - file', () => {
        it('file should be marked ', () => {
            assert.doesNotThrow(() => {
                leyyo.fqn.file({foo}, ...LY_TESTING_FQN);
            });
        });
        checkFootprint(describe, it, 'foo', foo, `${LY_TESTING_NS}.foo`, 'file');

        testAbstractClass(describe, it, foo.AbstractClass, 'foo');
        testBaseClass(describe, it, foo.BaseClass, 'foo');
        testBaseClassInstance(describe, it, new foo.BaseClass(), 'foo');
        testInheritedClass(describe, it, foo.InheritedClass, 'foo');
        testInheritedClassInstance(describe, it, new foo.InheritedClass(), 'foo');
        testInheritedClassInstance(describe, it, foo.inheritedClass, 'foo');
        testAnonymousClass(describe, it, foo.AnonymousClass, 'foo');
        testAnonymousClassInstance(describe, it, new foo.AnonymousClass(), 'foo');

        checkFootprint(describe, it, 'func1 #regular', foo.func1, `${LY_TESTING_NS}.foo.func1`, 'function', 'function-regular');
        checkFootprint(describe, it, 'func2 #arrow', foo.func2, `${LY_TESTING_NS}.foo.func2`, 'function', 'function-anonymous');
        checkFootprint(describe, it, 'func3 $generator', foo.func3, `${LY_TESTING_NS}.foo.func3`, 'function', 'function-generator');
        checkFootprint(describe, it, 'func4 #constructor', foo.Func4, `${LY_TESTING_NS}.foo.Func4`, 'function', 'function-regular');
        checkFootprint(describe, it, 'func4 #instance', foo.func4, `${LY_TESTING_NS}.foo.Func4`, 'function', 'function-regular');

        checkFootprint(describe, it, 'Enum1', foo.Enum1, `${LY_TESTING_NS}.foo.Enum1`, 'enum', 'enum-anonymous');
        checkFootprint(describe, it, 'possibleEnum2', foo.possibleEnum2, `${LY_TESTING_NS}.foo.possibleEnum2`, 'enum', 'enum-anonymous');

        checkFootprint(describe, it, 'obj', foo.obj, `${LY_TESTING_NS}.foo.obj`, 'object');
        checkFootprint(describe, it, 'arr', foo.arr, `${LY_TESTING_NS}.foo.arr`, 'object');
        checkFootprint(describe, it, 'map', foo.map, `${LY_TESTING_NS}.foo.map`, 'object');
        checkFootprint(describe, it, 'set', foo.set, `${LY_TESTING_NS}.foo.set`, 'object');
        checkFootprint(describe, it, 'weakSet', foo.weakSet, `${LY_TESTING_NS}.foo.weakSet`, 'object');
        checkFootprint(describe, it, 'weakMap', foo.weakMap, `${LY_TESTING_NS}.foo.weakMap`, 'object');

    });
}