import { createLinkSchema, type CreateLinkDto } from "./links.schema.ts";

export async function createLink(dto: CreateLinkDto) {
  const body = createLinkSchema.parse(dto);
}
