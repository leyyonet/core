import {Cast, Fqn, LY_TESTING_FQN} from "../../index";
import {Dto0Class2} from "./dto-0-class-2";
import {Dto0ClassTagLike} from "./dto-0-class-tag";

@Fqn(...LY_TESTING_FQN)
export class Dto0Class3 extends Dto0Class2 {
    @Cast("string")
    lastName: string;
    @Cast("string")
    city: string;
    @Cast("Array<Dto0ClassTag>")
    tags: Array<Dto0ClassTagLike>;
}