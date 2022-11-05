import {CastStatic} from "./cast-static";
import {CoreCast} from "./core-cast";
import {CastAssign} from "./cast-assign";
import {CastAlias} from "./cast-alias";
import {Cast} from "./cast";
import {CastKeyof} from "./cast-keyof";
import {CastTypeof} from "./cast-typeof";
import {Strict} from "./strict";

export const $mdl_cast = [CastStatic, CoreCast,
    CastAssign, Cast, CastAlias, CastKeyof, CastTypeof, Strict];