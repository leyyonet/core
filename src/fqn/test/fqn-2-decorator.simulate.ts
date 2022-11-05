// noinspection JSUnusedGlobalSymbols

import {Fqn, FuncLike, LY_TESTING_FQN} from "../../index";
import {
    testAbstractClass,
    testBaseClass,
    testBaseClassInstance,
    testInheritedClass,
    testInheritedClassInstance
} from "./fqn-helper.simulate";

@Fqn(...LY_TESTING_FQN)
class AbstractClass {
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

@Fqn(...LY_TESTING_FQN)
class BaseClass extends AbstractClass {
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

@Fqn(...LY_TESTING_FQN)
class InheritedClass extends BaseClass {
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


export const testFqn2Decorator = (describe: FuncLike, it: FuncLike) => {
    describe('FQN#2 - decorator', () => {
        testAbstractClass(describe, it, AbstractClass, undefined);
        testBaseClass(describe, it, BaseClass, undefined);
        testBaseClassInstance(describe, it, new BaseClass(), undefined);
        testInheritedClass(describe, it, InheritedClass, undefined);
        testInheritedClassInstance(describe, it, new InheritedClass(), undefined);
    });
}