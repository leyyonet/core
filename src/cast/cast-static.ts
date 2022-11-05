import {NotImplementedException} from "../error";
import {
    CastDocIn,
    CastDocOut,
    CastFilterIn,
    CastFilterOut,
    CastGraphQLIn,
    CastGraphQLOut,
    CastLike2, CastLikeInner,
    CastOption
} from "./types";
import {$ly} from "../core";
import {FuncLike} from "../common";
import { PropertyReflectLike } from "../reflect";

// noinspection JSUnusedLocalSymbols,JSUnusedGlobalSymbols
/**
 * @static
 * */
export class CastStatic {
    static cast<V = unknown>(value: unknown, opt?: CastOption): V {
        throw new NotImplementedException('Cast.cast', {value});
    }
    static $validate?<V = unknown>(value: V): V {
        throw new NotImplementedException('Cast.$validate', {value});
    }
    static $castDoc?(ref: PropertyReflectLike, openApi: CastDocIn): unknown {
        throw new NotImplementedException('Cast.$castDoc', {target: ref.description});
    }
    static $castGraphQL?(ref: PropertyReflectLike, gql: CastGraphQLIn): unknown {
        throw new NotImplementedException('Cast.$castGraphQL', {target: ref.description});
    }
    static $castFilter?(ref: PropertyReflectLike, filter: CastFilterIn): unknown {
        throw new NotImplementedException('Cast.$castFilter', {target: ref.description});
    }

    static {
        $ly.addFqn(this);
        $ly.addTrigger('binder', () => $ly.binder.bindAll(this));
    }
}