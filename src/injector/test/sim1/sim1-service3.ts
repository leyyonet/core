import {Component, Fqn, LazyWired, leyyo, LY_TESTING_FQN} from "../../../index";
import {Sim1Service1} from "./sim1-service1";

@Component()
@Fqn(...LY_TESTING_FQN)
export class Sim1Service3 {
    constructor() {
        console.log(`${leyyo.fqn.get(this)} created ==> ${Sim1Service3.name}`);
    }

    @LazyWired('Sim1Service1')
    service1: unknown;
    get s1(): unknown {
        return leyyo.fqn.get(this.service1);
    }
}