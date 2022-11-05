import {strict as assert} from "assert";
import {leyyo} from "../../index";
import {testFqn4Function} from "./fqn-4-function.simulate";

beforeAll(() => {
    leyyo.fqn;
});
describe('testFqn4Function', () => {it('started', () => {assert.equal(true, true);});});
testFqn4Function(describe, it);