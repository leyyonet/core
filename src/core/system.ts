import os from "os";
import {FuncLike, ObjectLike, RecLike} from "../index-aliases";
import {CoreLike, CoreSystemLike, CoreSystemStatus, CoreSystemStatusLambda, IpMap, LoggerLike} from "../index-types";
import {Environment} from "../index-enums";
import {COMPONENT_NAME} from "../internal-component";
import {S_CLASSES, S_FUNCTIONS} from "../index-constants";

export class CoreSystem implements CoreSystemLike {
    // region properties
    protected _init: boolean;
    protected readonly _lyy: CoreLike;
    protected _id = 0;
    protected readonly _TIMES: Record<string, number> = {
        days: 60 * 60 * 24,
        hours: 60 * 60,
        minutes: 60,
    }
    protected readonly _startTime: Date = new Date();
    protected _offset: number = this._startTime.getTimezoneOffset();
    protected _ipMap: IpMap;
    protected _ipAddress: string;
    protected _host: string;
    protected _pwd = null;
    protected _npmPackageName: string = null;
    protected _npmPackageVersion: string = null;
    protected _environment = Environment.PROD;
    protected _statusLambda: CoreSystemStatusLambda; // todo
    protected LOG: LoggerLike;
    // endregion properties

    constructor(ins: CoreLike) {
        this._lyy = ins;
        this.LOG = this._lyy.ly_log(this);
    }
    ly_init(): void {
        if (this._init) {return;}
        this._init = true;
        this._pwd = this._lyy.variable.read<string>('PWD', {
            owner: 'node',
            parser: (v) => this._lyy.primitive.text(v, {silent: true, field: 'env.PWD'}),
            required: false,
            log: true,
            def: null
        });
        this._npmPackageName = this._lyy.variable.read<string>('npm_package_name', {
            owner: 'node',
            parser: (v) => this._lyy.primitive.text(v, {silent: true, field: 'env.npm_package_name'}),
            required: false,
            log: true,
            def: null
        });
        this._npmPackageVersion = this._lyy.variable.read<string>('npm_package_version ', {
            owner: 'node',
            parser: (v) => this._lyy.primitive.text(v, {silent: true, field: 'env.npm_package_version'}),
            required: false,
            log: true,
            def: null
        });
        this._environment = this._lyy.variable.read<Environment>('NODE_ENV', {
            owner: COMPONENT_NAME,
            parser: (v) => this._lyy.primitive.enumeration<Environment>(v, {map: Environment, silent: true, field: 'env.NODE_ENV'}),
            required: false,
            log: true,
            def: Environment.LOCAL
        });
        this._fillHost();
        this._fillIp();
        if (this._offset !== 0) {
            this.LOG.warn(`offset.not.utc`, {offset: this._offset});
        }
    }
    protected _fillHost(): void {
        try {
            this._host = os.hostname();
            this.LOG.debug(`host.set`, {host: this._host});
        } catch (e) {
        }

    }
    protected _fillIp(): void {
        this._ipMap = {};
        try {
            const nets = os.networkInterfaces();
            for (const name of Object.keys(nets)) {
                for (const net of nets[name]) {
                    // skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
                    if (net.family === 'IPv4' && !net.internal) {
                        if (!this._ipMap[name]) {
                            this._ipMap[name] = [];
                        }
                        this._ipMap[name].push(net.address);
                        if (!this._ipAddress) {
                            this._ipAddress = net.address;
                        }
                    }
                }
            }
            this.LOG.debug(`ip.set`, {ipAddress: this._ipAddress});
        } catch (e) {
            this.LOG.native(e, 'system.ip-address');
        }
    }

    get id(): number {
        return this._id;
    }
    get inc(): number {
        this._id++;
        return this._id;
    }
    get startTime(): Date {
        return this._startTime;
    }
    get timeDiff(): RecLike<number> {
        const result: RecLike<number> = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: Math.floor((Date.now() - this._startTime.getTime()) / 1000),
        }
        for (const [k, v] of Object.entries(this._TIMES)) {
            if (result.seconds >= v) {
                result[k] = Math.floor(result.seconds / v);
                result.seconds -= result[k] * v;
            }
        }
        return result;
    }
    get uptime(): number {
        return os.uptime();
    }
    get offset(): number {
        return this._offset;
    }
    get ipMap(): IpMap {
        return this._ipMap;
    }
    get ipAddress(): string {
        return this._ipAddress;
    }
    get host(): string {
        return this._host;
    }
    get pwd(): string {
        return this._pwd;
    }
    get npmPackage(): string {
        return this._npmPackageName;
    }
    get npmPackageVersion(): string {
        return this._npmPackageVersion;
    }
    get environment(): Environment {return this._environment;}
    get isProd(): boolean {
        return this._environment === Environment.PROD;
    }
    get isStaging(): boolean {
        return this._environment === Environment.STAGING;
    }
    get isAutomation(): boolean {
        return this._environment === Environment.AUTOMATION;
    }
    get isTest(): boolean {
        return this._environment === Environment.TEST;
    }
    get isDev(): boolean {
        return this._environment === Environment.DEV;
    }
    get isLocal(): boolean {
        return this._environment === Environment.LOCAL;
    }
    get status(): RecLike {
        const status: CoreSystemStatus = {
            id: this._id,
            pwd: this._pwd,
            host: this._host,
            packageName: this._npmPackageName,
            packageVersion: this._npmPackageVersion,
            ipAddress: this._ipAddress,
            ipMap: this._ipMap,
            offset: this._offset,
            uptime: this.uptime,
            timeDiff: this.timeDiff,
            startTime: this._startTime.toISOString(),
            environment: this._environment,
        };
        if (this._statusLambda) {
            try {
                return this._statusLambda(status);
            } catch (e) {
                this.LOG.native(e.message, 'run.status.lambda');
            }
        }
        return status;
    }
    isSysFunction(name: string): boolean {
        return (typeof name === 'string') && S_FUNCTIONS.includes(name);
    }
    isSysClass(name: string): boolean {
        return (typeof name === 'string') && S_CLASSES.includes(name);
    }
    propertyDescriptor(target: FuncLike|ObjectLike, key: string, isInstance: boolean): PropertyDescriptor {
        if (key === (isInstance ? 'constructor' : 'prototype') || typeof key === 'symbol' || this.isSysFunction(key)) {
            return null;
        }
        try {
            return Object.getOwnPropertyDescriptor(target, key) ?? null;
        } catch (e) {
            console.log(`CoreSystem.propertyDescriptor`, e.message);
        }
        return null;
    }
    clearFileName(value: string): string | null {
        value = this._lyy.primitive.text(value, {silent: true});
        if (value && !value.startsWith('~') && !value.startsWith('#')) {
            let path = `${this._pwd}/dist/`;
            if (value.startsWith(path)) {
                value = value.substring(path.length);
            }
            path = `${this._pwd}/`;
            if (value.startsWith(path)) {
                value = value.substring(path.length);
            }
            this._lyy.component.items.forEach(pck => {
                path = `node_modules/${pck}/dist/`;
                if (value.startsWith(path)) {
                    value = `# ${pck}/` + value.substring(path.length);
                }
            });
            path = `node_modules/`;
            if (value.startsWith(path)) {
                value = '# ' + value.substring(path.length);
            }
            if (value.endsWith('.js')) {
                value = value.substring(0, value.length - 3);
            }
            if (value.endsWith('.ts')) {
                value = value.substring(0, value.length - 3);
            }
            if (value !== '' && !value.startsWith('#')) {
                value = '~ ' + value;
            }
        }
        return value;
    }

}