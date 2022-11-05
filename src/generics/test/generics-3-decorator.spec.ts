import {strict as assert} from 'assert';
import {generics3DecoratorSimulate} from "./generics-3-decorator.simulate";

describe('generics3DecoratorSimulate', () => {it('start', () => {assert.equal(true, true)})});
generics3DecoratorSimulate(describe, it);