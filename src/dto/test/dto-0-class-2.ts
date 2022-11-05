import {ArraySome, Cast, Fqn, LY_TESTING_FQN, RecLike} from "../../index";
import {Dto0Class1} from "./dto-0-class-1";

@Fqn(...LY_TESTING_FQN)
export class Dto0Class2 extends Dto0Class1 {
    @Cast("string")
    lastName: string;
    @Cast("Object<string, string>")
    address: RecLike<string>;
    @Cast("Array<unknown>")
    tags: ArraySome;
}