// x_console.log(`## ${__filename}`, {i: 'loading'});

import {CastDocIn, CastDocOut, CastFilterIn, CastFilterOut, CastGraphQLIn, CastGraphQLOut, CastStatic} from "../cast";
import {GenericsAnyIdentifier, GenericsIdentifier, GenericsOption, GenericsTreeLike} from "./types";
import {NotImplementedException} from "../error";
import {$ly} from "../core";
import {PropertyReflectLike} from "../reflect";

// noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
/**
 * @static
 * */
export class GenericsStatic extends CastStatic {
    static readonly genMin: number = 0;
    static readonly genMax: number = 10;

    static {
        $ly.$bindStatic(this);
        $ly.addFqn(this);
        $ly.addTrigger('binder', () => $ly.binder.bindAll(this));
    }

    static gen<V = unknown>(identifier: GenericsIdentifier, value: unknown): V {
        throw new NotImplementedException('Generics.gen', {identifier, value});
    }
    static $genDoc?(tree: GenericsTreeLike, ref: PropertyReflectLike, openApi: CastDocIn): unknown {
        throw new NotImplementedException('Generics.$genDoc', {target: ref.description, tree});
    }
    static $genGraphQL?(tree: GenericsTreeLike, ref: PropertyReflectLike, gql: CastGraphQLIn): unknown {
        throw new NotImplementedException('Generics.$genGraphQL', {target: ref.description, tree});
    }
    static $genFilter?(tree: GenericsTreeLike, ref: PropertyReflectLike, filter: CastFilterIn): unknown {
        throw new NotImplementedException('Generics.$genFilter', {target: ref.description, tree});
    }
    static $genBuild?(...children: Array<GenericsIdentifier>): GenericsTreeLike {
        throw new NotImplementedException('Generics.$genBuild', {children});
    }
}