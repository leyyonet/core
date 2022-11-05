import assert from "assert";
import {FuncLike, leyyo, RecLike} from "../../index";
import {AnyType, ArrayType, BooleanType, FloatType, IntegerType, ObjectType, StringType} from "./dto-0.shared";
import {Dto0Class3} from "./dto-0-class-3";
import {Dto0ClassTag, Dto0ClassTagLike} from "./dto-0-class-tag";

export const dto2ExtendedSimulate = (describe: FuncLike, it: FuncLike) => {
    const fakeModule = [StringType, IntegerType, FloatType, BooleanType, ObjectType, ArrayType, AnyType];
    describe('dto2ExtendedSimulate', () => {
        /*
        describe('Dto0Class1', () => {
            const a1 = new Dto0Class1();
            a1.firstName = leyyo.do<string>(1);
            a1.lastName = leyyo.do<string>(() => true);

            it('a1.firstName ', () => {
                assert.equal('1', a1.firstName);
            });
            it('a1.lastName ', () => {
                assert.equal('true', a1.lastName);
            });
            it('a1 full', () => {
                assert.deepEqual({firstName:'1', lastName: 'true', address: null}, a1.toJSON());
            });

            const b1 = new Dto0Class1();
            b1.firstName = 'foo';
            b1.lastName = leyyo.do<string>({id: 'bar'});
            b1.address = 5;

            it('b1.firstName ', () => {
                assert.equal('foo', b1.firstName);
            });
            it('b1.lastName ', () => {
                assert.equal('bar', b1.lastName);
            });
            it('b1 full', () => {
                assert.deepEqual({firstName:'foo', lastName: 'bar', address: 5}, b1.toJSON());
            });

        });
        describe('Dto0Class2', () => {
            const a1 = new Dto0Class2();
            a1.firstName = 'alias';
            a1.lastName = 'bbb';
            a1.address = leyyo.do<RecLike<string>>({first:5});
            a1.tags = leyyo.do<ArraySome>('a');

            it('a1.lastName ', () => {
                assert.equal('bbb', a1.lastName);
            });
            it('a1.address ', () => {
                assert.deepEqual({first:'5'}, a1.address);
            });
            it('a1.tags ', () => {
                assert.deepEqual(['a'], a1.tags);
            });
            it('a1 full', () => {
                assert.deepEqual({firstName:'alias', lastName: 'bbb', address: {first:'5'}, tags: ['a']}, a1.toJSON());
            });

        });
         */
        describe('Dto0Class3', () => {
            const a1 = new Dto0Class3();
            a1.firstName = 'alias';
            a1.lastName = 'bbb';
            a1.address = leyyo.do<RecLike<string>>({first:5});
            a1.tags = leyyo.do<Array<Dto0ClassTagLike>>([{id:5, name:'alias'}, {id:'6', name:5}]);

            const b1 = new Dto0Class3();
            b1.firstName = 'xxxx';
            b1.lastName = 'yyyyy';
            b1.address = leyyo.do<RecLike<string>>({first:'aaaaa'});
            b1.tags = leyyo.do<Array<Dto0ClassTagLike>>([{id:'666', name:'7777'}, {id:'888', name:'9999'}]);
            console.log('b1', JSON.stringify(b1));

            it('a1.address ', () => {
                assert.deepEqual({first:'5'}, a1.address);
            });
            it('a1.tags ', () => {
                assert.deepEqual([{id:5, name:'alias'}, {id:'6', name:5}], leyyo.primitive.value(a1.tags));
            });
            it('a1.address fqn ', () => {
                assert.equal('Object', leyyo.fqn.get(a1.address));
            });
            it('a1.tags[0] fqn ', () => {
                assert.equal(leyyo.fqn.get(Dto0ClassTag), leyyo.fqn.get(a1.tags[0]));
            });

        });

    });
}