import {strict as assert} from 'assert';
import {cast2DecoratorSimulate} from "./cast-2-decorator.simulate";

describe('cast2DecoratorSimulate', () => {it('start', () => {assert.equal(true, true)})});
cast2DecoratorSimulate(describe, it);