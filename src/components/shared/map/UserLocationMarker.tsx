import { Show } from "solid-js";
import { MapMarker, MarkerContent, MarkerLabel } from "@/components/ui/map";
import { cn } from "@/lib/utils";

interface UserLocationMarkerProps {
  coordinates: [number, number] | null;
  label?: string;
  class?: string;
}

export function UserLocationMarker(props: UserLocationMarkerProps) {
  return (
    <Show when={props.coordinates}>
      <MapMarker longitude={props.coordinates![0]} latitude={props.coordinates![1]}>
        <MarkerContent class={cn("z-50 pointer-events-none", props.class)}>
          <div class="relative flex items-center justify-center">
            {/* Sonar rings */}
            <div class="absolute size-8 rounded-full bg-blue-500/25 animate-ping" />
            <div class="absolute size-5 rounded-full bg-blue-500/40 animate-pulse" />

            {/* Core GPS point */}
            <div class="relative size-4 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
              <div class="size-1.5 rounded-full bg-white" />
            </div>
          </div>

          <Show when={props.label || "ទីតាំងរបស់អ្នក · Your Location"}>
            <MarkerLabel
              position="top"
              class="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[10px] font-medium shadow-md border border-white/20 whitespace-nowrap"
            >
              {props.label || "ទីតាំងរបស់អ្នក · Your Location"}
            </MarkerLabel>
          </Show>
        </MarkerContent>
      </MapMarker>
    </Show>
  );
}
