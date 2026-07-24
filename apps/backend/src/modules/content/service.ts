import { MedusaService } from "@medusajs/framework/utils";
import { HomeContent } from "./models/home-content";

class ContentModuleService extends MedusaService({ HomeContent }) {}

export default ContentModuleService;
