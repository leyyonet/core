// x_console.log(`## ${__filename}`, {i: 'loading'});


import {CorePointerLike, PointerLike, PointerNicknameLambda, PointerValue} from "./types";
import {DeveloperException} from "../error";
import {$ly} from "../core";
import {FuncLike} from "../common";


/**
 * @core
 * */
export class CorePointer implements CorePointerLike {
    // region properties
    protected _bucketMap: Map<string, PointerLike<PointerValue>>;
    private _nicknameList: Array<PointerNicknameLambda>;

    // endregion properties
    constructor() {
        $ly.addFqn(this);
        $ly.addTrigger('repo', () => {
            this._bucketMap = $ly.repo.newMap<string, PointerLike<PointerValue>>(this, '_bucketMap');
            this._nicknameList = $ly.repo.newArray<PointerNicknameLambda>(this, '_nicknameList');
        });
    }
    static {
        $ly.addDependency('pointer', () => new CorePointer());
    }

    // noinspection JSUnusedGlobalSymbols
    getBucketMap(): Map<string, PointerLike<PointerValue>> {
        return this._bucketMap;
    }

    // noinspection JSUnusedGlobalSymbols
    getBucket<V extends PointerValue>(bucket: string, throwable?: boolean): PointerLike<V> {
        bucket = $ly.primitive.check(this, 'bucket', bucket, $ly.primitive.textFilled);
        if (this._bucketMap.has(bucket)) {
            return this._bucketMap.get(bucket) as PointerLike<V>;
        }
        if (throwable) {
            throw new DeveloperException('pointer:absent.bucket', {bucket}).with(this);
        }
        return undefined;
    }
    registerNickname(fn: PointerNicknameLambda): void {
        this._nicknameList.push(fn);
    }
    appendNicknames(clazz: FuncLike, nicknames: Array<string>): void {
        this._nicknameList.forEach(f => f(clazz, nicknames))
    }
}