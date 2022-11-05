import assert from "assert";
import {FuncLike, leyyo, LY_TESTING_FQN, LY_TESTING_NS} from "../../index";
import {checkFootprint} from "./fqn-helper.simulate";

function fqn4Func1() {
    leyyo.emptyFn();
}
const fqn4Func2 = () => {
    leyyo.emptyFn();
}
function *fqn4Func3(i) {
    yield i;
    yield i + 10;
}
function fqn4Func4() {
    this.property = 'foo bar';
}
const func4 = new fqn4Func4();

export const testFqn4Function = (describe: FuncLike, it: FuncLike) => {
    describe('testFqn4Function', () => {
        it('function should be marked ', () => {
            assert.doesNotThrow(() => {
                leyyo.fqn.func(fqn4Func1, ...LY_TESTING_FQN);
                leyyo.fqn.func(fqn4Func2, ...LY_TESTING_FQN);
                leyyo.fqn.func(fqn4Func3, ...LY_TESTING_FQN);
                leyyo.fqn.func(fqn4Func4, ...LY_TESTING_FQN);
            });
        });
        checkFootprint(describe, it, 'fqn4Func1 #regular', fqn4Func1, `${LY_TESTING_NS}.fqn4Func1`, 'function', 'function-regular');
        checkFootprint(describe, it, 'fqn4Func2 #arrow', fqn4Func2, `${LY_TESTING_NS}.fqn4Func2`, 'function', 'function-anonymous');
        checkFootprint(describe, it, 'fqn4Func3 $generator', fqn4Func3, `${LY_TESTING_NS}.fqn4Func3`, 'function', 'function-generator');
        checkFootprint(describe, it, 'func4 #constructor', fqn4Func4, `${LY_TESTING_NS}.fqn4Func4`, 'function', 'function-regular');
        checkFootprint(describe, it, 'func4 #instance', func4, `${LY_TESTING_NS}.fqn4Func4`, 'function', 'function-regular');
    });
}
