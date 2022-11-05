// x_console.log(`## ${__filename}`, {i: 'loading'});

import os from "os";
import {CoreSystemLike, EnvironmentX, SystemIpMap, SystemStatus, SystemStatusLambda} from "./types";
import {LY_INT_PACKAGE} from "../internal";
import {LY_FUNCTION_METHODS, LY_SYSTEM_CLASSES, LY_SYSTEM_FUNCTIONS} from "./constants";
import {ObjectOrFunction, RecLike} from "../common";
import {$ly} from "../core";

/**
 * @core
 * */
export class CoreSystem implements CoreSystemLike {
    // region properties
    protected _environments: Array<EnvironmentX>;
    protected _envAlternatives: RecLike<EnvironmentX>;
    protected _id: number;
    protected _TIMES: Record<string, number>
    protected _startTime: Date;
    protected _offset: number;
    protected _ipMap: SystemIpMap;
    protected _ipAddress: string;
    protected _host: string;
    protected _environment: EnvironmentX;
    protected _statusLambda: SystemStatusLambda; // todo
    protected LOG = $ly.preLog;

    // endregion properties
    constructor() {
        this.$init();
        $ly.addFqn(this);
        $ly.addTrigger('logger', () => {this.LOG = $ly.logger.assign(this)});
        $ly.addTrigger('logger', () => {
                try {
                    this._host = os.hostname();
                } catch (e) {
                    this.LOG.native(e, 'system.ip-address');
                }
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
                } catch (e) {
                    this.LOG.native(e, 'system.ip-address');
                }
                if (this._offset !== 0) {
                    this.LOG.warn(`offset.not.utc`, {offset: this._offset});
                }
            });
        $ly.addTrigger('variable', () => {
                this._environment = $ly.variable.read<EnvironmentX>('NODE_ENV', {
                    target: LY_INT_PACKAGE,
                    parser: (v) => $ly.primitive.literal<EnvironmentX>(v, this._environments, this._envAlternatives),
                    required: false,
                    log: true,
                    def: 'local'
                });
            });
    }
    static {
        $ly.addDependency('system', () => new CoreSystem());
    }
    private $init() {
        this._environments = ['prod', 'staging', 'automation', 'test', 'dev', 'local'];
        this._envAlternatives = {
            p: 'prod',
            live: 'prod',
            production: 'prod',
            s: 'staging',
            stage: 'staging',
            model: 'staging',
            preprod: 'staging',
            preproduction: 'staging',
            demo: 'staging',
            external: 'staging',
            pipeline: 'automation',
            git: 'automation',
            github: 'automation',
            gitlab: 'automation',
            bitbucket: 'automation',
            jenkins: 'automation',
            t: 'test',
            q: 'test',
            testing: 'test',
            internal: 'test',
            qc: 'test',
            qa: 'test',
            d: 'dev',
            development: 'dev',
            trunk: 'dev',
            sandbox: 'dev',
        };
        this._id = 0;
        this._TIMES = {
            days: 60 * 60 * 24,
            hours: 60 * 60,
            minutes: 60,
        };
        this._startTime = new Date();
        this._offset = this._startTime.getTimezoneOffset();
        this._environment = 'prod';
        this._ipMap = {};
    }

    // region public
    get id(): number {
        return this._id;
    }

    // noinspection JSUnusedGlobalSymbols
    get inc(): number {
        this._id++;
        return this._id;
    }

    // noinspection JSUnusedGlobalSymbols
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

    // noinspection JSUnusedGlobalSymbols
    get offset(): number {
        return this._offset;
    }

    // noinspection JSUnusedGlobalSymbols
    get ipMap(): SystemIpMap {
        return this._ipMap;
    }

    // noinspection JSUnusedGlobalSymbols
    get ipAddress(): string {
        return this._ipAddress;
    }

    // noinspection JSUnusedGlobalSymbols
    get host(): string {
        return this._host;
    }

    get environment(): EnvironmentX {
        return this._environment;
    }

    // noinspection JSUnusedGlobalSymbols
    get isProd(): boolean {
        return this._environment === 'prod';
    }

    // noinspection JSUnusedGlobalSymbols
    get isStaging(): boolean {
        return this._environment === 'staging';
    }

    // noinspection JSUnusedGlobalSymbols
    get isAutomation(): boolean {
        return this._environment === 'automation';
    }

    // noinspection JSUnusedGlobalSymbols
    get isTest(): boolean {
        return this._environment === 'test';
    }

    // noinspection JSUnusedGlobalSymbols
    get isDev(): boolean {
        return this._environment === 'dev';
    }

    // noinspection JSUnusedGlobalSymbols
    get isLocal(): boolean {
        return this._environment === 'local';
    }

    // noinspection JSUnusedGlobalSymbols
    get status(): RecLike {
        const status: SystemStatus = {
            id: this._id,
            pwd: $ly.pwd,
            host: this._host,
            npmName: $ly.npmName,
            npmVersion: $ly.npmVersion,
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
    isFunctionMethod(name: string|symbol): boolean {
        return (typeof name === 'symbol') || name === "" || LY_FUNCTION_METHODS.includes(name);
    }
    isCustomMethod(name: string|symbol): boolean {
        return name && !this.isFunctionMethod(name);
    }
    isSysFunction(name: string|symbol): boolean {
        return (typeof name === 'symbol') || name === "" || LY_SYSTEM_FUNCTIONS.includes(name);
    }
    isCustomFunction(name: string|symbol): boolean {
        return name && !this.isSysFunction(name);
    }

    // noinspection JSUnusedGlobalSymbols
    isSysClass(name: string): boolean {
        return (typeof name === 'string') && (name === "" || LY_SYSTEM_CLASSES.includes(name));
    }
    
    isCustomClass(name: string): boolean {
        return name && (typeof name === 'string') && !this.isSysClass(name);
    }

    // noinspection JSUnusedGlobalSymbols
    propertyDescriptor(target: ObjectOrFunction, key: string, isInstance: boolean): PropertyDescriptor {
        if (key === (isInstance ? 'constructor' : 'prototype') || typeof key === 'symbol' || !this.isCustomFunction(key)) {
            return undefined;
        }
        try {
            return Object.getOwnPropertyDescriptor(target, key);
        } catch (e) {
            this.LOG.native(e.message, 'propertyDescriptor');
        }
        return undefined;
    }

    // noinspection JSUnusedGlobalSymbols
    clearFileName(value: string): string | undefined {
        const pwd = $ly.pwd;
        if (!pwd) {
            return value;
        }
        if (typeof value === 'string' && !value.startsWith('#') && !value.startsWith('~')) {
            const folders = [`${pwd}/dist/`, `${pwd}/src/`, `${pwd}/`];
            for (const folder of folders) {
                if (value.startsWith(folder)) {
                    value = '~ ' + value.substring(folder.length);
                    break;
                }
            }
            $ly.package?.getItems()?.forEach(pck => {
                const folders = [`node_modules/${pck}/dist/`, `node_modules/${pck}/src/`];
                for (const folder of folders) {
                    if (value.startsWith(folder)) {
                        value = `# ${pck}/` + value.substring(folder.length);
                        break;
                    }
                }
            });
            if (value.startsWith('`node_modules/')) {
                value = '# ' + value.substring('`node_modules/'.length);
            }
            if (value.endsWith('.js')) {
                value = value.substring(0, value.length - 3);
            }
            if (value.endsWith('.ts')) {
                value = value.substring(0, value.length - 3);
            }
        }
        return value;
    }

    // endregion public

}
