import {strict as assert} from "assert";
import {MyInt, NoCastInt, noCastInt} from "./cast-2-decorator.inner";
import {CastLike, FuncLike, leyyo, LY_TESTING_FQN} from "../../index";

export const cast2DecoratorSimulate = (describe: FuncLike, it: FuncLike) => {
    const short = MyInt.name;
    const full = [...LY_TESTING_FQN, short].join('.');
    const nickname = 'nicknameInteger';
    const nonName = 'notFound.NoCastInt';
    const fakeNoCast = noCastInt as unknown as CastLike;
    describe('cast2DecoratorSimulate', () => {
        describe('isClass', () => {
            it('+ function', () => {
                assert.equal(leyyo.cast.isClass(MyInt), true);
            });
            it('+ full name', () => {
                assert.equal(leyyo.cast.isClass(full), true);
            });
            it('+ short name', () => {
                assert.equal(leyyo.cast.isClass(short), true);
            });
            it('+ nickname', () => {
                assert.equal(leyyo.cast.isClass(nickname), true);
            });
            it('- function', () => {
                assert.notEqual(leyyo.cast.isClass(NoCastInt), true);
            });
            it('- nickname', () => {
                assert.notEqual(leyyo.cast.isClass(nonName), true);
            });
        });
        describe('findInstance', () => {
            it('+ function', () => {
                assert.equal(typeof leyyo.cast.findInstance(MyInt)?.cast, 'function');
            });
            it('+ full name', () => {
                assert.equal(typeof leyyo.cast.findInstance(full)?.cast, 'function');
            });
            it('+ short name', () => {
                assert.equal(typeof leyyo.cast.findInstance(short)?.cast, 'function');
            });
            it('+ nickname', () => {
                assert.equal(typeof leyyo.cast.findInstance(nickname)?.cast, 'function');
            });
            it('- function', () => {
                assert.notEqual(typeof leyyo.cast.findInstance(NoCastInt, false)?.cast, 'function');
            });
            it('- function #err', () => {
                assert.throws(() => leyyo.cast.findInstance(NoCastInt, true));
            });
            it('- instance', () => {
                assert.notEqual(typeof leyyo.cast.findInstance(fakeNoCast, false)?.cast, 'function');
            });
            it('- instance #err', () => {
                assert.throws(() => leyyo.cast.findInstance(fakeNoCast, true));
            });
            it('- nickname', () => {
                assert.notEqual(typeof leyyo.cast.findInstance(nonName, false)?.cast, 'function');
            });
            it('- instance #err', () => {
                assert.throws(() => leyyo.cast.findInstance(nonName, true));
            });
        });
        describe('findClass', () => {
            it('+ function', () => {
                assert.equal(leyyo.cast.findClass(MyInt).name, MyInt.name);
            });
            it('+ full name', () => {
                assert.equal(leyyo.cast.findClass(full).name, MyInt.name);
            });
            it('+ short name', () => {
                assert.equal(leyyo.cast.findClass(short).name, MyInt.name);
            });
            it('+ nickname', () => {
                assert.equal(leyyo.cast.findClass(nickname).name, MyInt.name);
            });
            it('- function', () => {
                assert.notEqual(leyyo.cast.findClass(NoCastInt, false)?.name, MyInt.name);
            });
            it('- function #err', () => {
                assert.throws(() => leyyo.cast.findClass(NoCastInt, true));
            });
            it('- instance', () => {
                assert.notEqual(leyyo.cast.findClass(fakeNoCast, false)?.name, MyInt.name);
            });
            it('- instance #err', () => {
                assert.throws(() => leyyo.cast.findClass(fakeNoCast, true));
            });
            it('- nickname', () => {
                assert.notEqual(leyyo.cast.findClass(nonName, false)?.name, MyInt.name);
            });
            it('- instance #err', () => {
                assert.throws(() => leyyo.cast.findClass(nonName, true));
            });
        });
        describe('run', () => {
            const values: Array<[string, unknown, number]> = [
                ['+ empty', undefined, null],
                ['+ boolean', true, 1],
                ['+ number', '3', 3],
                ['+ array', [1], 1],
                ['+ pair', {id:'5'}, 5],
                ['+ function', () => 7.2, 7],
                ['+ object', {}, null]
            ];
            values.forEach(tuple => {
                it(tuple[0], () => {
                    assert.equal(leyyo.cast.run(MyInt, tuple[1]), tuple[2]);
                });
            });
        });
    });
}