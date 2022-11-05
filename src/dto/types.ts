import {DecoLike} from "../deco";
import {ReflectDescribed} from "../reflect";

export interface CoreDtoLike {
    $addFromDeco(deco: DecoLike, described: ReflectDescribed): void;
}