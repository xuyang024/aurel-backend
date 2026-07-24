import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { CONTENT_MODULE } from "../../../modules/content";
import ContentModuleService from "../../../modules/content/service";

// Read the (single) homepage content row.
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(CONTENT_MODULE) as unknown as ContentModuleService;
  const [row] = await service.listHomeContents({}, { take: 1 });
  res.json({ content: row ?? null });
};

// Upsert the single homepage content row.
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(CONTENT_MODULE) as unknown as ContentModuleService;
  const body = (req.body ?? {}) as Record<string, unknown>;
  const [existing] = await service.listHomeContents({}, { take: 1 });

  const saved = existing
    ? await service.updateHomeContents({ id: existing.id, ...body })
    : await service.createHomeContents(body);

  res.json({ content: saved });
};
