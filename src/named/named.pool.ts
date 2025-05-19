import {$assert, $descriptor, $dev, $repo, Dict} from "@leyyo/common";
import {
    NamedDepotEqualsLambda,
    NamedDepotFinderLambda,
    NamedDepotInfo,
    NamedDepotLike,
    NamedDepotValue,
    NamedPoolLike,
    NamedPoolNewDoc
} from "./index.types";
import {FQN_PCK} from "./internal";
import {NamedDepot} from "./named.depot";
import {$$coreInternalOn} from "../internal";
import {core} from "../core";

/**
 * Callback pool
 * */
export class NamedPool implements NamedPoolLike {
    protected readonly _items: Map<symbol, NamedDepotLike<NamedDepotValue, NamedDepotValue>>;

    /**
     * Constructor
     * */
    constructor() {
        this._items = $repo.newMap(FQN_PCK, 'pool.items');
    }

    assign<V extends NamedDepotValue, P extends NamedDepotValue>(pack: string, name: string, pointerFinderLambda: NamedDepotFinderLambda<V, P>, equalsLambda?: NamedDepotEqualsLambda<V>): NamedDepotLike<V, P> {
        const doc = {pack, name, equalsLambda, pointerFinderLambda} as NamedPoolNewDoc<V, P>;
        $assert.text(doc.pack, () => $dev.opt({
            field: 'package',
            where: 'leyyo.named.NamedPool',
            method: 'assign',
            name: doc.name
        }));
        $assert.text(doc.name, () => $dev.opt({
            field: 'name',
            where: 'leyyo.named.NamedPool',
            method: 'assign',
            pack: doc.pack
        }));
        doc.bucket = pack.split('.').pop();
        $assert.func(doc.pointerFinderLambda, () => $dev.opt({
            field: 'pointer',
            where: 'leyyo.named.NamedPool',
            method: 'assign',
            bucket: doc.bucket
        }));
        const ins = new NamedDepot(doc);
        this._items.set($descriptor.sym(doc.pack, doc.name), ins);

        return ins;
    }

    get info(): Dict<Array<NamedDepotInfo>> {
        const items = {};
        let duplicated = 0;
        for (const [bucket, base] of this._items.entries()) {
            if (items[bucket.description] === undefined) {
                items[bucket.description] = base.info;
            } else {
                duplicated++;
                items[`${bucket.description}#${duplicated}`] = base.info;
            }
        }
        return items;
    }
}

$$coreInternalOn('class-pool-1', () => {
    core.$secure.$setNamedPool(new NamedPool());
});
$$coreInternalOn('class-instance', () => {
    core.fqnHandler.clazz(NamedPool, FQN_PCK);
});
