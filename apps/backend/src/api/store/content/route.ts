import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { CONTENT_MODULE } from "../../../modules/content";
import ContentModuleService from "../../../modules/content/service";

// Public read of homepage content (storefront). Requires publishable key like all /store routes.
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(CONTENT_MODULE) as unknown as ContentModuleService;
  const [row] = await service.listHomeContents({}, { take: 1 });
  res.json({ content: row ?? null });
};
