import {strict as assert} from "assert";
import {CastLike, FuncLike, leyyo, LY_TESTING_FQN} from "../../index";
import {myStr, MyStr, noCastStr, NoCastStr} from "./cast-1-string.inner";

export const cast1StringSimulate = (describe: FuncLike, it: FuncLike) => {
    const short = MyStr.name;
    const full = [...LY_TESTING_FQN, short].join('.');
    const nickname = 'ThisString';
    const nonName = 'NoNameString';
    const fakeNoCast = noCastStr as unknown as CastLike;
    describe('cast1StringSimulate', () => {
        describe('add', () => {
            it('+ success', () => {
                assert.doesNotThrow(() => leyyo.cast.add(MyStr, myStr, nickname));
            });
            it('- duplicated #err', () => {
                assert.throws(() => leyyo.cast.add(MyStr, myStr));
            });
            it('- empty function #err', () => {
                assert.throws(() => leyyo.cast.add(undefined, myStr));
            });
            it('- empty instance #err', () => {
                assert.throws(() => leyyo.cast.add(MyStr, undefined));
            });
            it('- invalid #err', () => {
                assert.throws(() => leyyo.cast.add(NoCastStr, fakeNoCast));
            });
        });

        describe('isClass', () => {
            it('+ function', () => {
                assert.equal(leyyo.cast.isClass(MyStr), true);
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
                assert.notEqual(leyyo.cast.isClass(NoCastStr), true);
            });
            it('- nickname', () => {
                assert.notEqual(leyyo.cast.isClass(nonName), true);
            });
        });
        describe('isInstance', () => {
            it('+ instance', () => {
                assert.equal(leyyo.cast.isInstance(myStr), true);
            });
            it('- instance', () => {
                assert.notEqual(leyyo.cast.isInstance(fakeNoCast), true);
            });
        });
        describe('findInstance', () => {
            it('+ function', () => {
                assert.equal(typeof leyyo.cast.findInstance(MyStr)?.cast, 'function');
            });
            it('+ instance', () => {
                assert.equal(typeof leyyo.cast.findInstance(myStr)?.cast, 'function');
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
                assert.notEqual(typeof leyyo.cast.findInstance(NoCastStr, false)?.cast, 'function');
            });
            it('- function #err', () => {
                assert.throws(() => leyyo.cast.findInstance(NoCastStr, true));
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
                assert.equal(leyyo.cast.findClass(MyStr).name, MyStr.name);
            });
            it('+ instance', () => {
                assert.equal(leyyo.cast.findClass(myStr).name, MyStr.name);
            });
            it('+ full name', () => {
                assert.equal(leyyo.cast.findClass(full).name, MyStr.name);
            });
            it('+ short name', () => {
                assert.equal(leyyo.cast.findClass(short).name, MyStr.name);
            });
            it('+ nickname', () => {
                assert.equal(leyyo.cast.findClass(nickname).name, MyStr.name);
            });
            it('- function', () => {
                assert.notEqual(leyyo.cast.findClass(NoCastStr, false)?.name, MyStr.name);
            });
            it('- function #err', () => {
                assert.throws(() => leyyo.cast.findClass(NoCastStr, true));
            });
            it('- instance', () => {
                assert.notEqual(leyyo.cast.findClass(fakeNoCast, false)?.name, MyStr.name);
            });
            it('- instance #err', () => {
                assert.throws(() => leyyo.cast.findClass(fakeNoCast, true));
            });
            it('- nickname', () => {
                assert.notEqual(leyyo.cast.findClass(nonName, false)?.name, MyStr.name);
            });
            it('- instance #err', () => {
                assert.throws(() => leyyo.cast.findClass(nonName, true));
            });
        });
        describe('run', () => {
            const values: Array<[string, unknown, string]> = [
                ['+ trim', ' a ', 'a'],
                ['+ empty', '', null],
                ['+ boolean', true, 'true'],
                ['+ number', 3, '3'],
                ['+ array', [1], '1'],
                ['+ pair', {id:5}, '5'],
                ['+ function', () => 7.2, '7.2'],
                ['+ object', {}, null]
            ];
            values.forEach(tuple => {
                it(tuple[0], () => {
                    assert.equal(leyyo.cast.run(MyStr, tuple[1]), tuple[2]);
                });
            });
        });
    });
}