import {CastAlias, CastAssign, CastLike, CastOption, Fqn, leyyo, LY_TESTING_FQN, Nickname} from "../../index";

@CastAlias(Number)
@CastAssign("instance")
@Nickname('nicknameFloat')
@Fqn(...LY_TESTING_FQN)
export class MyFloat implements CastLike<number> {
    cast(value: unknown | number, opt?: CastOption): number {
        return leyyo.primitive.float(value);
    }
}