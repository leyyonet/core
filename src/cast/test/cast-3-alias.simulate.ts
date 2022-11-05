import {strict as assert} from "assert";
import {FuncLike, leyyo} from "../../index";
import {MyFloat} from "./cast-3-alias.inner";

export const cast3AliasSimulate = (describe: FuncLike, it: FuncLike) => {
    const instance = leyyo.cast.findClass(MyFloat);
    describe('cast3AliasSimulate', () => {
        describe('isAlias', () => {
            it('+ function', () => {
                assert.equal(leyyo.cast.isAlias(Number), true);
            });
        });
        describe('isClass', () => {
            it('+ function', () => {
                assert.equal(leyyo.cast.isClass(Number), false);
            });
        });
        describe('findInstance', () => {
            it('+ function, cast', () => {
                assert.equal(typeof leyyo.cast.findInstance(Number)?.cast, 'function');
            });
            it('+ function, instance', () => {
                assert.equal(leyyo.cast.findInstance(Number), instance);
            });
            it('+ name, cast', () => {
                assert.equal(typeof leyyo.cast.findInstance(Number.name)?.cast, 'function');
            });
            it('+ name, instance', () => {
                assert.equal(leyyo.cast.findInstance(Number.name), instance);
            });
        });
        describe('findClass', () => {
            it('+ function, name', () => {
                assert.equal(leyyo.cast.findClass(Number).name, MyFloat.name);
            });
            it('+ function, class', () => {
                assert.equal(leyyo.cast.findClass(Number), MyFloat);
            });
            it('+ name, name', () => {
                assert.equal(leyyo.cast.findClass(Number.name).name, MyFloat.name);
            });
            it('+ name, class', () => {
                assert.equal(leyyo.cast.findClass(Number.name), MyFloat);
            });
        });
        describe('run', () => {
            const values: Array<[string, unknown, number]> = [
                ['+ empty', undefined, null],
                ['+ boolean', true, 1],
                ['+ number', '3.333', 3.333],
                ['+ array', [1], 1],
                ['+ pair', {id:'5'}, 5],
                ['+ function', () => 7.2, 7.2],
                ['+ object', {}, null]
            ];
            values.forEach(tuple => {
                it(tuple[0], () => {
                    assert.equal(leyyo.cast.run(Number, tuple[1]), tuple[2]);
                });
            });
        });
    });
}