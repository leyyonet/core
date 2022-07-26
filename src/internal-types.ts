import {RecLike} from "./index-aliases";

export interface CoreLoggerRefresh {
    refresh: (map: RecLike) => void;
}