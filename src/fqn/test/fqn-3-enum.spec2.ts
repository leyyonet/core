import {strict as assert} from "assert";
import {leyyo} from "../../index";
import {testFqn3Enum} from "./fqn-3-enum.simulate";

beforeAll(() => {
    leyyo.emptyFn()
});
describe('testFqn3Enum', () => {it('started', () => {assert.equal(true, true);});});
testFqn3Enum(describe, it);