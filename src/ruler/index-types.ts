import {ShiftMain, ShiftSecure} from "@leyyo/common";

export interface RulerPoolLike extends ShiftSecure<RulerPoolSecure> {

}

export interface RulerPoolSecure extends ShiftMain<RulerPoolLike> {

}