import {strict as assert} from "assert";
import {FuncLike, leyyo, LY_TESTING_FQN} from "../../index";
import {MyObject1} from "./generics-3-decorator.inner";

export const generics3DecoratorSimulate = (describe: FuncLike, it: FuncLike) => {
    const short = MyObject1.name;
    const full = [...LY_TESTING_FQN, short].join('.');
    const nickname = 'nicknameObject1';
    describe('generics3DecoratorSimulate', () => {
        describe('isPrimary', () => {
            it('+ function', () => {
                assert.equal(leyyo.generics.isPrimary(MyObject1), true);
            });
            it('+ full name', () => {
                assert.equal(leyyo.generics.isPrimary(full), true);
            });
            it('+ short name', () => {
                assert.equal(leyyo.generics.isPrimary(short), true);
            });
            it('+ nickname', () => {
                assert.equal(leyyo.generics.isPrimary(nickname), true);
            });
        });
        describe('findInstance', () => {
            it('+ function', () => {
                assert.equal(typeof leyyo.generics.findInstance(MyObject1)?.gen, 'function');
            });
            it('+ full name', () => {
                assert.equal(typeof leyyo.generics.findInstance(full)?.gen, 'function');
            });
            it('+ short name', () => {
                assert.equal(typeof leyyo.generics.findInstance(short)?.gen, 'function');
            });
            it('+ nickname', () => {
                assert.equal(typeof leyyo.generics.findInstance(nickname)?.gen, 'function');
            });
        });
        describe('findClass', () => {
            it('+ function', () => {
                assert.equal(leyyo.generics.findClass(MyObject1).name, MyObject1.name);
            });
            it('+ full name', () => {
                assert.equal(leyyo.generics.findClass(full).name, MyObject1.name);
            });
            it('+ short name', () => {
                assert.equal(leyyo.generics.findClass(short).name, MyObject1.name);
            });
            it('+ nickname', () => {
                assert.equal(leyyo.generics.findClass(nickname).name, MyObject1.name);
            });
        });
        describe('run', () => {
            const values: Array<[string, unknown, Record<string, string>, boolean]> = [
                ['+ undefined', undefined, undefined, false],
                ['+ null', null, null, false],
                ['+ empty object', {}, {}, false],
                ['+ undefined item', {a:undefined}, {}, false],
                ['+ null item', {a:null}, {a:null}, false],
                ['+ boolean item', {a:true}, {a:'true'}, false],
                ['+ number item', {a:3}, {a:'3'}, false],
                ['+ array with one item', [{a:3}], {a:'3'}, false],
                ['+ pair item', {a:{id:7.2}}, {a:'7.2'}, false],
                ['+ pair', {id:7.2}, {id:'7.2'}, false],
                ['+ function', () => {return {a:7.2}}, {a:'7.2'}, false],
                ['+ function item', {a:() => {return {id:7.2}}}, {a:'7.2'}, false],
                ['+ map', new Map([['a','1'], ['1','a']]), {a:'1','1':'a'}, false],

                ['- string', 'a', null, true],
                ['- boolean', true, null, true],
                ['- number', 5, null, true],
                ['- empty array', [], null, true],
                ['- array with more than one item', [1,2], null, true],
                ['- function', () => '4', null, true],
            ];
            values.forEach(tuple => {
                it(tuple[0], () => {
                    if (tuple[3]) {
                        assert.throws(() => leyyo.generics.run('MyObject1<MyKey1,MyValue1>', tuple[1]));
                    } else {
                        assert.deepEqual(leyyo.generics.run('MyObject1<MyKey1,MyValue1>', tuple[1]), tuple[2]);
                    }
                });
            });
        });
    });
}