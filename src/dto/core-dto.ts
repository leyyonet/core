import {CoreDtoLike} from "./types";
import {$ly} from "../core";
import {DecoLike} from "../deco";
import {ReflectDescribed} from "../reflect";
import {CastAssign} from "../cast";

export class CoreDto implements CoreDtoLike {
    protected LOG = $ly.preLog;
    constructor() {
        $ly.addFqn(this);
        $ly.addTrigger('logger', () => {this.LOG = $ly.logger.assign(this)});
    }

    static {
        $ly.addDependency('dto', () => new CoreDto());
    }
    $addFromDeco(deco: DecoLike, described: ReflectDescribed): void {
        $ly.cast.$addFromDeco($ly.deco.getDecorator(CastAssign), described, 'static');
        deco.assign(described);
    }

}