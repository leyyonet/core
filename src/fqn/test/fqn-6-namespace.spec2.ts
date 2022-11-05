import {strict as assert} from "assert";
import {leyyo} from "../../index";
import {testFqn6Namespace} from "./fqn-6-namespace.simulate";

beforeAll(() => {
    leyyo.emptyFn()
});
describe('testFqn6Namespace', () => {it('started', () => {assert.equal(true, true);});});
testFqn6Namespace(describe, it);