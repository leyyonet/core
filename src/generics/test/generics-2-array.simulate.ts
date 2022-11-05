import {strict as assert} from "assert";
import {FuncLike, GenericsLike, leyyo, LY_TESTING_FQN} from "../../index";
import {myArray, MyArray, noGenericsArray, NoGenericsArray} from "./generics-2-array.inner";
import {myStr, MyStr} from "../../cast/test/cast-1-string.inner";

export const generics2ArraySimulate = (describe: FuncLike, it: FuncLike) => {
    const short = MyArray.name;
    const full = [...LY_TESTING_FQN, short].join('.');
    const nonName = 'NoNameArray';
    const fakeNoCast = noGenericsArray as unknown as GenericsLike;
    leyyo.cast.add(MyStr, myStr);
    describe('generics2StringSimulate', () => {
        describe('add', () => {
            it('+ success', () => {
                assert.doesNotThrow(() => leyyo.generics.add(MyArray, myArray));
            });
            it('- duplicated #err', () => {
                assert.throws(() => leyyo.generics.add(MyArray, myArray));
            });
            it('- empty function #err', () => {
                assert.throws(() => leyyo.generics.add(null, myArray));
            });
            it('- empty instance #err', () => {
                assert.throws(() => leyyo.generics.add(MyArray, null));
            });
            it('- invalid #err', () => {
                assert.throws(() => leyyo.generics.add(NoGenericsArray, fakeNoCast));
            });
        });

        describe('isPrimary', () => {
            it('+ function', () => {
                assert.equal(leyyo.generics.isPrimary(MyArray), true);
            });
            it('+ full name', () => {
                assert.equal(leyyo.generics.isPrimary(full), true);
            });
            it('+ short name', () => {
                assert.equal(leyyo.generics.isPrimary(short), true);
            });
            it('- function', () => {
                assert.notEqual(leyyo.generics.isPrimary(NoGenericsArray), true);
            });
        });
        describe('isValue', () => {
            it('+ instance', () => {
                assert.equal(leyyo.generics.isValue(myArray), true);
            });
            it('- instance', () => {
                assert.notEqual(leyyo.generics.isValue(fakeNoCast), true);
            });
        });
        describe('findInstance', () => {
            it('+ function', () => {
                assert.equal(typeof leyyo.generics.findInstance(MyArray)?.cast, 'function');
            });
            it('+ instance', () => {
                assert.equal(typeof leyyo.generics.findInstance(myArray)?.cast, 'function');
            });
            it('+ full name', () => {
                assert.equal(typeof leyyo.generics.findInstance(full)?.cast, 'function');
            });
            it('+ short name', () => {
                assert.equal(typeof leyyo.generics.findInstance(short)?.cast, 'function');
            });
            it('- function', () => {
                assert.notEqual(typeof leyyo.generics.findInstance(NoGenericsArray, false)?.cast, 'function');
            });
            it('- function #err', () => {
                assert.throws(() => leyyo.generics.findInstance(NoGenericsArray, true));
            });
            it('- instance', () => {
                assert.notEqual(typeof leyyo.generics.findInstance(fakeNoCast, false)?.cast, 'function');
            });
            it('- instance #err', () => {
                assert.throws(() => leyyo.generics.findInstance(fakeNoCast, true));
            });
            it('- nonName', () => {
                assert.notEqual(typeof leyyo.generics.findInstance(nonName, false)?.cast, 'function');
            });
            it('- instance #err', () => {
                assert.throws(() => leyyo.generics.findInstance(nonName, true));
            });
        });
        describe('findClass', () => {
            it('+ function', () => {
                assert.equal(leyyo.generics.findClass(MyArray).name, MyArray.name);
            });
            it('+ instance', () => {
                assert.equal(leyyo.generics.findClass(myArray).name, MyArray.name);
            });
            it('+ full name', () => {
                assert.equal(leyyo.generics.findClass(full).name, MyArray.name);
            });
            it('+ short name', () => {
                assert.equal(leyyo.generics.findClass(short).name, MyArray.name);
            });
            it('- function', () => {
                assert.notEqual(leyyo.generics.findClass(NoGenericsArray, false)?.name, MyArray.name);
            });
            it('- function #err', () => {
                assert.throws(() => leyyo.generics.findClass(NoGenericsArray, true));
            });
            it('- instance', () => {
                assert.notEqual(leyyo.generics.findClass(fakeNoCast, false)?.name, MyArray.name);
            });
            it('- instance #err', () => {
                assert.throws(() => leyyo.generics.findClass(fakeNoCast, true));
            });
            it('- instance #err', () => {
                assert.throws(() => leyyo.generics.findClass(nonName, true));
            });
        });
        describe('run', () => {
            const values: Array<[string, unknown, Array<string>, boolean]> = [
                ['+ undefined', undefined, undefined, false],
                ['+ null', null, null, false],
                ['+ empty object', [], [], false],
                ['+ plain string', 'a', ['a'], false],
                ['+ plain boolean', true, ['true'], false],
                ['+ plain number', 5, ['5'], false],
                ['+ plain function', () => '4', ['4'], false],
                ['+ object', {}, [], false],
                ['+ array', [' a ', 3, true, () => 7.2], ['a','3','true','7.2'], false],
                ['+ set', [new Set([' a ', 3, true, () => 7.2])], ['a','3','true','7.2'], false],
            ];
            values.forEach(tuple => {
                it(tuple[0], () => {
                    assert.deepEqual(leyyo.generics.run('MyArray<MyStr>', tuple[1]), tuple[2]);
                });
            });
        });
    });
}