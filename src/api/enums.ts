export enum FieldType {
    STRING = 'string',
    NUMBER = 'number',
    INTEGER = 'integer',
    BOOLEAN = 'boolean',
    ARRAY = 'array',
    OBJECT = 'object'
}
export type FieldTypeLike = Lowercase<keyof typeof FieldType> | FieldType;
export enum HttpMethod {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    PATCH = 'patch',
    DELETE = 'delete',
    HEAD = 'head',
    OPTIONS = 'options',
    PURGE = 'purge',
    LINK = 'link',
    UNLINK = 'unlink',
}
export type HttpMethodLike = Lowercase<keyof typeof HttpMethod> | HttpMethod;

// type WeekdayType = `${HttpMethod}`;

// array to enum
const Enum3 = ['aaa', 'bbb', 'ccc'] as const;
type Enum4 = typeof Enum3[number];
const e4: Enum4 = "aaa";


