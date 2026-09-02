"use client";

import { useId } from "react";
import type { ProjectDto } from "@/features/project/project-dto/project-dto";
import { useLucideIconDefinitions } from "@/features/layers/icon/use-lucide-icon-definitions";
import { getProjectIconNames, renderProjectLayers } from "@/features/project/rendering/project-svg";
import { cn } from "@/lib/cn";

type ExampleProjectPreviewProps = {
  className?: string;
  project: ProjectDto;
  title: string;
};

export function ExampleProjectPreview({ className, project, title }: ExampleProjectPreviewProps) {
  const iconDefinitions = useLucideIconDefinitions(getProjectIconNames(project));
  const renderedLayers = renderProjectLayers(project, iconDefinitions);
  const canvasClipId = `example-canvas-clip-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <div
      className={cn(
        "grid aspect-4/3 place-items-center overflow-hidden bg-[linear-gradient(45deg,#eef0f3_25%,transparent_25%),linear-gradient(-45deg,#eef0f3_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#eef0f3_75%),linear-gradient(-45deg,transparent_75%,#eef0f3_75%)] bg-[length:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0px] p-3",
        className,
      )}
    >
      <svg
        aria-label={`Preview of ${title}`}
        className="size-full drop-shadow-[0_8px_16px_rgba(32,36,43,0.12)]"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        viewBox={`0 0 ${project.canvas.widthMm} ${project.canvas.heightMm}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id={canvasClipId} clipPathUnits="userSpaceOnUse">
            <rect height={project.canvas.heightMm} width={project.canvas.widthMm} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${canvasClipId})`}>
          {!project.canvas.transparentBackground ? (
            <rect
              fill={project.canvas.background}
              height={project.canvas.heightMm}
              width={project.canvas.widthMm}
            />
          ) : null}
          {renderedLayers.map((layer) => (
            <g dangerouslySetInnerHTML={{ __html: layer.svg }} key={layer.id} />
          ))}
        </g>
      </svg>
    </div>
  );
}
