import assert from "assert";
import {FuncLike, leyyo} from "../../index";
import {Sim1Controller} from "./sim1/sim1-controller";
import {Sim1Service1} from "./sim1/sim1-service1";
import {Sim1Service2} from "./sim1/sim1-service2";
import {Sim1Service3} from "./sim1/sim1-service3";
import {Sim1Module} from "./sim1/sim1-module";

export function injector1AutowiredSimulate(describe: FuncLike, it: FuncLike): void {
    describe('autowiredSimulate', () => {
        leyyo.processor.$runAsync('injecting').then(c => {
            console.log('create');
        }).catch(e => {
            console.log('failed', e);
        })
        it('Sim1Module1.service1 ', () => {
            assert.equal(leyyo.injector.get<Sim1Module>(Sim1Module), undefined);
        });
        /*
        it('Sim1Controller.service1 ', () => {
            assert.equal(leyyo.injector.get<Sim1Controller>(Sim1Controller).s1, leyyo.fqn.get(Sim1Service1));
        });
        it('Sim1Controller.service2', () => {
            assert.equal(leyyo.injector.get<Sim1Controller>(Sim1Controller).s2, leyyo.fqn.get(Sim1Service2));
        });
        it('Sim1Service1.service2', () => {
            assert.equal(leyyo.injector.get<Sim1Service1>(Sim1Service1).s2, leyyo.fqn.get(Sim1Service2));
        });
        it('Sim1Service1.service3', () => {
            assert.equal(leyyo.injector.get<Sim1Service1>(Sim1Service1).s3, leyyo.fqn.get(Sim1Service3));
        });
        it('Sim1Service2.service3', () => {
            assert.equal(leyyo.injector.get<Sim1Service2>(Sim1Service2).s3, leyyo.fqn.get(Sim1Service3));
        });
        it('Sim1Service3.service1', () => {
            assert.equal(leyyo.injector.get<Sim1Service3>(Sim1Service3).s1, leyyo.fqn.get(Sim1Service1));
        });
         */
    });
}