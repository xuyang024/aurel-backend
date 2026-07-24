import { MedusaService } from "@medusajs/framework/utils";
import { StoreSettings } from "./models/store-settings";

class SettingsModuleService extends MedusaService({ StoreSettings }) {}

export default SettingsModuleService;
