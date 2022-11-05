import {CastLike, CastOption, Fqn, leyyo, LY_TESTING_FQN} from "../../index";

@Fqn(...LY_TESTING_FQN)
export class MyStr implements CastLike<string> {
    cast(value: unknown | string, opt?: CastOption): string {
        return leyyo.primitive.text(value);
    }
}
export const myStr = new MyStr();

@Fqn(...LY_TESTING_FQN)
export class NoCastStr {
    noCast(value: unknown): string {
        return leyyo.primitive.text(value);
    }
}
export const noCastStr = new NoCastStr();