import { createProject, createRange } from "@/features/project/factories/project-factories";

export const validProjectFixture = createProject({ ranges: [createRange({ id: "8b376848-6d14-4a76-9b05-759d808d4027" })] });
export const invalidProjectFixture = { ...validProjectFixture, canvas: { ...validProjectFixture.canvas, widthMm: -1 } };
