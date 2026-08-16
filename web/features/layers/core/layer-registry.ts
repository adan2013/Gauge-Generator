import { TickScaleLayer } from "@/features/layers/tick-scale/tick-scale";
import type { LayerDto } from "@/features/project/project-dto/project-dto";
import type { Layer } from "./layer";

export function createLayerModel(layer: LayerDto): Layer {
  switch (layer.type) {
    case "tick-scale":
      return new TickScaleLayer(layer);
  }
}
