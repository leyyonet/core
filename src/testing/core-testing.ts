import {CoreTestingLike, TestingError, TestingItem} from "./types";
import {$ly} from "../core";
import {FuncLike, RecLike} from "../common";


/**
 * @core
 * */
export class CoreTesting implements CoreTestingLike {
    protected static _GREEN = 32;
    protected static _RED = 31;
    protected static _MAGENTA = 35;
    protected static _CYAN = 36;
    protected static _YELLOW = 33;
    protected static _SPACE = '   ';

    protected _parent: number;
    protected _ident: number;
    protected _count: number;
    protected _data: Record<number, TestingItem>;

    constructor() {
        this.$init();
        $ly.addFqn(this);
        $ly.$bindInstance(this);
    }
    static {
        $ly.addDependency('testing', () => new CoreTesting());
    }
    $init(): void {
        this._parent = 0;
        this._ident = 0;
        this._count = 0;
        this._data = {};
    }

    protected _pad(ident: number): string {
        let str = '';
        if (ident > 0) {
            for (let i = 0; i < ident; i++) {
                str += CoreTesting._SPACE;
            }
        }
        return str;
    }
    protected _colorize(item: TestingItem): string {
        return this._pad(item.ident) + `\x1b[${item.color}m${item.sign}\x1b[0m \x1b[2m${item.title}\x1b[0m`;
    }
    protected _item(item: Partial<TestingItem>): TestingItem {
        return {
            ...{
                ident: this._ident,
                color: CoreTesting._YELLOW,
                sign: '?',
                title: '??',
                success: 0,
                error: 0,
                params: {},
                children: []
            }, ...item
        } as TestingItem;
    }
    protected _print(item: TestingItem): void {
        console.log(this._colorize(item));
        if (Object.keys(item.params).length > 1) {
            const err = item.params as unknown as TestingError;
            for (const [k, v] of Object.entries(err)) {
                if (['stack'].includes(k)) {
                    continue;
                }
                // !['name', 'message', 'generatedMessage', 'code'].includes(k)
                if (v !== undefined) {
                    switch (k) {
                        case 'message':
                            console.log(this._pad(item.ident + 1) + `\x1b[${CoreTesting._YELLOW}m*\x1b[0m ${k}`, $ly.json.check((v as string).split(':').shift()));
                            break;
                        case 'stackTrace':
                            if (Array.isArray(v) && v.length > 0) {
                                console.log(this._pad(item.ident + 1) + `\x1b[${CoreTesting._YELLOW}m*\x1b[0m ${k}`, `\x1b[${CoreTesting._YELLOW}m\x1b[0m`);
                                v.forEach(line => {
                                    console.log(this._pad(item.ident + 2) + `\x1b[${CoreTesting._YELLOW}m>\x1b[0m`, `${line.method} in ${line.file} #${line.line}`);
                                });
                            } else {
                                console.log(this._pad(item.ident + 1) + `\x1b[${CoreTesting._YELLOW}m*\x1b[0m ${k}`, `\x1b[${CoreTesting._YELLOW}m${JSON.stringify($ly.json.check(v))}\x1b[0m`);
                            }
                            break;
                        default:
                            console.log(this._pad(item.ident + 1) + `\x1b[${CoreTesting._YELLOW}m*\x1b[0m ${k}`, `\x1b[${CoreTesting._YELLOW}m${JSON.stringify($ly.json.check(v))}\x1b[0m`);
                            break;
                    }
                }
            }
        }
        Object.values(item.children).forEach(c => this._print(c));
    }
    protected _error(e: Error): RecLike {
        return $ly.error.toObject(e);
    }
    protected _end(): void {
        if (this._parent !== 0) {
            console.log('test.failed', {reason: 'parent-id', parent: this._parent});
            process.exit(1);
        }
        if (Object.keys(this._data).length > 0) {
            console.log('test.failed', {reason: 'not-empty-pool', parent: this._parent});
            process.exit(1);
        }
    }
    start(): void {
        this._parent = 0;
        this._ident = 0;
        this._count = 0;
        this._data = {};
    }
    describe(title: string, fn: FuncLike): void {
        if (this._parent === 0) {
            this.start();
        }
        const parentId = this._parent;
        this._count++;
        const count = this._count;
        this._parent = count;
        const slf = this._item({title, kind: "describe"});
        this._data[count] = slf;
        this._ident++;
        try {
            fn();
        } catch (e) {
            slf.error++;
            slf.params = this._error(e);
        }
        if (slf.error > 0) {
            if (slf.success === 0) {
                slf.sign = '⥿';
                slf.color = CoreTesting._MAGENTA;
            } else {
                slf.sign = '⇓';
                slf.color = CoreTesting._CYAN;
            }
        } else {
            slf.sign = '▼';
            slf.color = CoreTesting._GREEN;
        }
        let isEnd = false;
        if (parentId === 0) {
            this._print(slf);
            isEnd = true;
            if (slf.error > 0) {
                console.log('test.failed', {title: slf.title, error: slf.error, success: slf.success});
                process.exit(1);
            }
        } else {
            this._data[parentId].children.push(slf);
            this._data[parentId].error += slf.error;
            this._data[parentId].success += slf.success;
        }
        delete this._data[count];
        this._count--;
        this._ident--;
        this._parent = parentId;
        if (isEnd) {
            this._end();
        }
    }

    it(title: string, fn: FuncLike): void {
        this._count++;
        const count = this._count;
        this._data[count] = this._item({title, kind: 'it'});
        const slf = this._data[count];
        let error = false;
        try {
            fn();
            slf.color = CoreTesting._GREEN;
            slf.sign = '✓';
        } catch (e) {
            slf.color = CoreTesting._RED;
            slf.sign = '✖';
            slf.params = this._error(e);
            error = true;
        }
        this._data[this._parent].children.push(slf);
        error ? this._data[this._parent].error++ : this._data[this._parent].success++;
        delete this._data[count];
        this._count--;
    }
}











