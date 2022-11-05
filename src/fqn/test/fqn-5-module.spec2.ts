import {strict as assert} from "assert";
import {leyyo} from "../../index";
import {testFqn5Module} from "./fqn-5-module.simulate";

beforeAll(() => {
    leyyo.emptyFn()
});
describe('testFqn5Module', () => {it('started', () => {assert.equal(true, true);});});
testFqn5Module(describe, it);