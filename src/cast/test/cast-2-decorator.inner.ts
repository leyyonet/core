import {CastAssign, CastLike, CastOption, Fqn, leyyo, LY_TESTING_FQN, Nickname} from "../../index";

@CastAssign("instance")
@Nickname('nicknameInteger')
@Fqn(...LY_TESTING_FQN)
export class MyInt implements CastLike<number> {
    cast(value: unknown | number, opt?: CastOption): number {
        return leyyo.primitive.integer(value);
    }
}


@Fqn(...LY_TESTING_FQN)
export class NoCastInt {
    noCast(value: unknown): number {
        return leyyo.primitive.integer(value);
    }
}
export const noCastInt = new NoCastInt();