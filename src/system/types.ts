import {ObjectOrFunction, RecLike} from "../common";

export type EnvironmentX = 'prod' | 'staging' | 'test' | 'automation' | 'dev' | 'local';

export type SystemStatusLambda<T = RecLike> = (status: SystemStatus<T>) => RecLike;
export type SystemStatus<T = RecLike> = RecLike;
export type SystemIpMap = RecLike<Array<string>>;

export interface CoreSystemLike {
    get id(): number;

    get inc(): number;

    get startTime(): Date;

    get timeDiff(): RecLike<number>;

    get uptime(): number;

    get offset(): number;

    get ipMap(): SystemIpMap;

    get ipAddress(): string;

    get host(): string;

    get environment(): EnvironmentX;

    get isProd(): boolean;

    get isStaging(): boolean;

    get isAutomation(): boolean;

    get isTest(): boolean;

    get isDev(): boolean;

    get isLocal(): boolean;

    get status(): RecLike;

    isFunctionMethod(name: string|symbol): boolean;
    isCustomMethod(name: string|symbol): boolean;
    isSysFunction(name: string|symbol): boolean;
    isCustomFunction(name: string|symbol): boolean;

    isSysClass(name: string): boolean;
    isCustomClass(name: string): boolean;

    propertyDescriptor(target: ObjectOrFunction, key: string, isInstance: boolean): PropertyDescriptor;

    clearFileName(value: string): string | undefined;
}