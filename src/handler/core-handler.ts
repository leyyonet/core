import {CoreHandlerLike} from "./types";
import {$ly} from "../core";
import {DecoAliasLike, DecoLike} from "../deco";
import {FuncLike, NewableClass} from "../common";

/**
 * @core
 * */
export class CoreHandler implements CoreHandlerLike {
    // region properties
    protected LOG = $ly.preLog;

    // endregion properties
    constructor() {
        $ly.addFqn(this);
        $ly.addTrigger('logger', () => {this.LOG = $ly.logger.assign(this)});
    }
    static {
        $ly.addDependency('handler', () => new CoreHandler());
    }
    // region public
    ctorAnonymous(deco: DecoLike | DecoAliasLike, clazz: NewableClass, parameters: Array<unknown>, lambda: FuncLike): NewableClass {
        const NewClass = class extends clazz {
            // noinspection JSUnusedLocalSymbols
            constructor(...args: any[]) {
                super(...(parameters ?? args));
                lambda(this);
            }
        }
        $ly.symbol.setReferenced(NewClass, clazz);
        $ly.symbol.push(clazz, 'proxied', deco);
        this.LOG.debug('Proxied', {clazz, deco: deco.name});
        return NewClass;
    }


    // endregion public
}
