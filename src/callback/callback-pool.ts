import {
    CallbackAssignResponse,
    CallbackBase,
    CallbackBaseName,
    CallbackFinder,
    CallbackPoolLike, CallbackValue
} from "./index-type";
import {assertion, commonLog, DeveloperException, Dict, storage} from "@leyyo/common";

/**
 * Callback pool
 * */
export class CallbackPool implements CallbackPoolLike {
    protected readonly _bases: Map<string, Array<CallbackBase<CallbackValue, CallbackValue>>>;
    protected readonly _aliases: Map<string, Map<string, CallbackBase<CallbackValue, CallbackValue>>>;
    private readonly logger = commonLog.create(CallbackPool);

    /**
     * Constructor
     * */
    constructor() {
        this._bases = storage.newMap('CallbackPool.bases');
        this._aliases = storage.newMap('CallbackPool.aliases');
    }

    assign<V extends CallbackValue, W extends CallbackValue>(bucket: string, pointer: CallbackFinder<V, W>): CallbackAssignResponse<V, W> {
        assertion.text(bucket, {indicator: 'callback.bucket.invalid', value: bucket});
        assertion.notEmpty(bucket, {indicator: 'callback.bucket.empty', value: bucket});
        assertion.func(pointer, {indicator: 'callback.pointer.empty', bucket, value: pointer});

        if (this._bases.has(bucket)) {
            throw new DeveloperException('callback.duplicated-bucket', { bucket }).with(this);
        }
        this._bases.set(bucket, []);
        this._aliases.set(bucket, new Map());
        this.logger.info('assigned', { bucket });
        return {
            bucket,
            bases: this._bases.get(bucket) as Array<CallbackBase<V, W>>,
            aliases: this._aliases.get(bucket) as Map<string, CallbackBaseName<V, W>>,
        };
    }

    get info(): Dict<Array<CallbackBase<CallbackValue, CallbackValue>>> {
        const items = {};
        for (const [bucket, base] of this._bases.entries()) {
            items[bucket] = base;
        }
        return items;
    }
}