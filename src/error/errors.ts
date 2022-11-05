import {ExceptionLike, ExceptionStackLine} from "./types";
import {ClassLike, ClassOrName, ObjectLike, RecKey, RecLike} from "../common";
import {LoggerItem} from "../logger";
import {$ly} from "../core";
import {LY_INT_FQN} from "../internal";

export class Exception extends Error implements ExceptionLike {
    protected _params: RecLike;
    protected _stackTrace: Array<ExceptionStackLine>;
    protected _causes: Array<Error>;
    protected _holder?: ClassOrName;

    constructor(message: string, params?: RecLike) {
        if (global.leyyo_is_testing) {
            message += ` => ${JSON.stringify($ly.json.check(params))}`;
        }
        super(message);
        this.name = $ly.fqn.get(this);
        this._params = params ?? {};
        this._stackTrace = [];
        this._causes = [];
        $ly.error.buildStack(this);
    }

    get params(): RecLike {
        return this._params;
    }
    get stackTrace(): Array<ExceptionStackLine> {
        return this._stackTrace;
    }
    get causes(): Array<Error> {
        return this._causes;
    }
    get holder(): ClassOrName {
        return this._holder;
    }

    setName(name: string): this {
        if (typeof name === 'string') {
            this.name = name;
        }
        return this;
    }

    // noinspection JSUnusedLocalSymbols
    causedBy(e: Error | string): this {
        this._causes.push($ly.error.build(e));
        return this;
    }

    with(identifier: ObjectLike | ClassLike | string): this {
        this._holder = $ly.logger?.checkHolder ? $ly.logger?.checkHolder(identifier) : identifier;
        return this;
    }

    patch(params: RecLike, ignoreExisting?: boolean): this {
        this._params = this._params ?? {};
        try {
            for (const [k, v] of Object.entries(params)) {
                if (!(ignoreExisting && this._params[k] !== undefined)) {
                    this._params[k] = v;
                }
            }
        } catch (e) {
        }
        return this;
    }
    field(field: string|number): this {
        if (typeof field === 'number') {
            field = `#${field}`;
        }
        if (typeof field !== 'string') {
            return this;
        }
        this._params = this._params ?? {};
        if (typeof this._params['$field'] !== 'string') {
            this._params['$field'] = field;
        } else {
            this._params['$field'] += `${field}`;
        }
        return this;
    }
    indicator(value: string, ignoreExisting?: boolean): this {
        return this.patch({_indicator: value}, ignoreExisting);
    }
    ctx(value: unknown, ignoreExisting?: boolean): this {
        return this.patch({_ctx: value}, ignoreExisting);
    }

    log(ctx?: unknown): this {
        if (ctx) {
            this.ctx(ctx, false);
        }
        const params = {};
        const log = {
            severity: 'error',
            message: this,
            params,
            holder: this._holder,
            time: new Date()
        } as LoggerItem;
        if ($ly.error.getSign(this).includes('warn')) {
            log.severity = 'warn';
        }
        $ly.logger.add(log); // todo
        return this;
    }

    raise(throwable = true, ctx?: unknown): this {
        if (!throwable) {
            if (ctx) {
                this.ctx(ctx, false);
            }
            this.log();
            return undefined;
        }
        throw this;
    }

    copyStack(e: Error): void {
        $ly.error.addSign(this, 'built');
        this._stackTrace = e ? e['_stackTrace'] ?? [] : [];
    }


    // region sign
    // endregion sign
    toObject(...omittedFields: Array<string>): RecLike {
        return $ly.error.toObject(this, ...omittedFields);
    }

    toJSON() {
        try {
            return this.toObject();
        } catch (e) {
            return {name: this.name, message: this.message, params: this._params};
        }
    }
}
$ly.addTrigger('error', () => $ly.error.add(Exception, ...LY_INT_FQN));

export class DeveloperException extends Exception {
    constructor(indicator: string, params?: RecLike) {
        super((typeof indicator === 'string') ? indicator.replace(':', '.').split('.').join(' ') : 'developer errpr', params);
        this.indicator(indicator, false);
    }
}
$ly.addTrigger('error', () => $ly.error.add(DeveloperException, ...LY_INT_FQN));

export class MultipleException extends Exception {
    protected _items: Array<ExceptionLike>;

    constructor(...errors: Array<Error>) {
        super("Multiple exceptions are occurred", {});
        this._items = [];
        this.push(...errors);
    }
    static throwAll(list: Array<ExceptionLike>): void {
        if (list.length > 1) {
            throw new MultipleException(...list);
        }
        else if (list.length === 1) {
            throw list[0];
        }
    }
    static append(list: Array<ExceptionLike>, field: RecKey, e: Error) {
        if (e instanceof MultipleException) {
            if (e._items.length > 0) {
                const errors = e._items.map(e2 => {
                    let err = e2 as ExceptionLike;
                    if (!(e2 instanceof Exception)) {
                        err = $ly.error.build(e2);
                    }
                    if (err.params['$field'] === undefined) {
                        err.params['$field'] = field;
                    } else {
                        err.params['$field'] = `${err.params['$field']}.${field}`;
                    }
                    return err;
                });
                list.push(...errors);
            }
        } else {
            let err = e as ExceptionLike;
            if (!(e instanceof Exception)) {
                err = $ly.error.build(e);
            }
            if (err.params['$field'] === undefined) {
                err.params['$field'] = field;
            } else {
                err.params['$field'] = `${err.params['$field']}.${field}`;
            }

            list.push(err);
        }
    }

    push(...errors: Array<Error>): this {
        errors.forEach(e => {
            const err = $ly.error.build(e);
            if (err instanceof MultipleException) {
                this._items.push(...err._items);

            } else {
                this._items.push(err);
            }
        })
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    getItems(): Array<ExceptionLike> {
        return this._items;
    }
}
$ly.addTrigger('error', () => $ly.error.add(MultipleException, ...LY_INT_FQN));

export class NotImplementedException extends Exception {
    constructor(name: unknown, params?: RecLike) {
        params = {...(params ?? {}), name};
        super(`Not implemented feature ${name}`, params);
    }
}
$ly.addTrigger('error', () => $ly.error.add(NotImplementedException, ...LY_INT_FQN));
