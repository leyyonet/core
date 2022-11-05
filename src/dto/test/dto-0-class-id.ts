import {AbstractDto, Cast, CastAssign, Fqn, LY_TESTING_FQN} from "../../index";

export interface Dto0ClassIdLike {
    id?: string;
}
// @ts-ignore
@CastAssign('static')
@Fqn(...LY_TESTING_FQN)
export class Dto0ClassId extends AbstractDto implements Dto0ClassIdLike {
    @Cast("string")
    id: string;

}