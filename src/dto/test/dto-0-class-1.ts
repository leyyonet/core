import {AbstractDto, Cast, Fqn, LY_TESTING_FQN, RecLike} from "../../index";

@Fqn(...LY_TESTING_FQN)
export class Dto0Class1 extends AbstractDto {
    @Cast("string")
    firstName: string;
    @Cast("string")
    lastName: string;
    @Cast("unknown")
    address: unknown;
}