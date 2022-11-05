import {Cast, CastAssign, Fqn, LY_TESTING_FQN} from "../../index";
import {Dto0ClassId, Dto0ClassIdLike} from "./dto-0-class-id";

export interface Dto0ClassTagLike extends Dto0ClassIdLike {
    name?: string;
}

@CastAssign('static')
@Fqn(...LY_TESTING_FQN)
export class Dto0ClassTag extends Dto0ClassId implements Dto0ClassTagLike {
    @Cast("string")
    name: string;

}