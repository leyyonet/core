import {CoreLike} from "./types";
import {$ly} from "./core";
import {$mdl_json} from "../json/mdl";
import {$mdl_repo} from "../repo/mdl";
import {$mdl_symbol} from "../symbol/mdl";
import {$mdl_primitive} from "../primitive/mdl";
import {$mdl_system} from "../system/mdl";
import {$mdl_fqn} from "../fqn/mdl";
import {$mdl_logger} from "../logger/mdl";
import {$mdl_pointer} from "../pointer/mdl";
import {$mdl_api} from "../api/mdl";
import {$mdl_deco} from "../deco/mdl";
import {$mdl_dto} from "../dto/mdl";
import {$mdl_hook} from "../hook/mdl";
import {$mdl_error} from "../error/mdl";
import {$mdl_handler} from "../handler/mdl";
import {$mdl_injector} from "../injector/mdl";
import {$mdl_context} from "../context/mdl";
import {$mdl_processor} from "../processor/mdl";
import {$mdl_reflect} from "../reflect/mdl";
import {$mdl_variable} from "../variable/mdl";
import {$mdl_binder} from "../binder/mdl";
import {$mdl_enum} from "../enum/mdl";
import {$mdl_cast} from "../cast/mdl";
import {$mdl_generics} from "../generics/mdl";
import {$mdl_package} from "../package/mdl";
import {$mdl_mixin} from "../mixin/mdl";
import {$mdl_testing} from "../testing/mdl";
import {Module} from "../injector";


export const leyyo = $ly as CoreLike;
const moduleList = [];
moduleList.push(...$mdl_json);
moduleList.push(...$mdl_repo);
moduleList.push(...$mdl_symbol);
moduleList.push(...$mdl_primitive);
moduleList.push(...$mdl_system);
moduleList.push(...$mdl_fqn);
moduleList.push(...$mdl_logger);
moduleList.push(...$mdl_pointer);
moduleList.push(...$mdl_api);
moduleList.push(...$mdl_deco);
moduleList.push(...$mdl_dto);
moduleList.push(...$mdl_hook);
moduleList.push(...$mdl_error);
moduleList.push(...$mdl_handler);
moduleList.push(...$mdl_injector);
moduleList.push(...$mdl_context);
moduleList.push(...$mdl_processor);
moduleList.push(...$mdl_reflect);
moduleList.push(...$mdl_variable);
moduleList.push(...$mdl_binder);
moduleList.push(...$mdl_enum);
moduleList.push(...$mdl_error);
moduleList.push(...$mdl_cast);
moduleList.push(...$mdl_generics);
moduleList.push(...$mdl_package);
moduleList.push(...$mdl_mixin);
moduleList.push(...$mdl_testing);

@Module(...moduleList)
export class LeyyoCoreModule {

}