import {strict as assert} from "assert";
import {leyyo} from "../../index";
import {testFqn2Decorator} from "./fqn-2-decorator.simulate";

beforeAll(() => {
    leyyo.emptyFn();
});
describe('testFqn2Decorator', () => {it('started', () => {assert.equal(true, true);});});
testFqn2Decorator(describe, it);