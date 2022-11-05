import assert from "assert";
import {leyyo, LY_TESTING_FQN} from "../../index";
import {AbstractClass, AnonymousClass, BaseClass, InheritedClass} from "./fqn-1-class.simulate";
import {
    testAbstractClass,
    testAnonymousClass,
    testAnonymousClassInstance,
    testBaseClass,
    testBaseClassInstance,
    testInheritedClass,
    testInheritedClassInstance
} from "./fqn-helper.simulate";

beforeAll(() => {
    leyyo.emptyFn()
});
// testFqn1Class(describe, it);
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