import {strict as assert} from "assert";
import {leyyo} from "../../index";
import {testFqn7File} from "./fqn-7-file.simulate";

beforeAll(() => {
    leyyo.emptyFn()
});
describe('testFqn7File', () => {it('started', () => {assert.equal(true, true);});});
testFqn7File(describe, it);