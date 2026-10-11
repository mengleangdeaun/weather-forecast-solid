import { createSignal, createEffect, For, Show } from "solid-js";
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  useMap,
  type MapLayerType,
} from "@/components/ui/map";
import { CAMBODIA_PROVINCES, type Province } from "@/lib/provinces";
import type { WeatherData } from "@/lib/weather-api";
import { UserLocationMarker } from "@/components/shared/map/UserLocationMarker";
import { cn } from "@/lib/utils";
import { Droplets, Wind } from "lucide-solid";

interface WeatherMapProps {
  activeProvince: Province;
  onSelectProvince: (province: Province) => void;
  weatherMap: Record<string, WeatherData>;
  userLocation: [number, number] | null;
  theme?: "light" | "dark";
  class?: string;
  onDetectLocation?: () => void;
}

// Camera controller to smoothly fly to selected province
function MapCameraController(props: { activeProvince: Province }) {
  const { map, isLoaded } = useMap();
  let prevId = "";

  createEffect(() => {
    const curMap = map();
    const loaded = isLoaded();
    const curProv = props.activeProvince;

    if (!curMap || !loaded) return;
    if (prevId === curProv.id) return;
    prevId = curProv.id;

    curMap.flyTo({
      center: curProv.coordinates,
      zoom: 8.5,
      essential: true,
      duration: 1200,
    });
  });

  return null;
}

export function WeatherMap(props: WeatherMapProps) {
  const [mapLayer, setMapLayer] = createSignal<MapLayerType>("roadmap");

  const initialViewport = {
    center: [104.991, 12.565] as [number, number],
    zoom: 7.3,
    bearing: 0,
    pitch: 0,
  };

  return (
    <div
      class={cn(
        "relative h-full w-full rounded-xl sm:rounded-2xl border shadow-lg overflow-hidden bg-card/75 backdrop-blur-xl",
        props.class
      )}
    >
      <Map
        viewport={initialViewport}
        theme={props.theme}
        mapLayer={mapLayer()}
        class="h-full w-full min-h-[340px] sm:min-h-[460px] lg:min-h-[580px]"
      >
        <MapCameraController activeProvince={props.activeProvince} />

        <MapControls
          position="top-right"
          showZoom={true}
          showLocate={true}
          showLayerToggle={true}
          currentLayer={mapLayer()}
          onChangeLayer={setMapLayer}
          onLocate={() => props.onDetectLocation?.()}
        />

        {/* User location marker */}
        <UserLocationMarker coordinates={props.userLocation} />

        {/* Province Markers */}
        <For each={CAMBODIA_PROVINCES}>
          {(prov) => {
            const isActive = () => prov.id === props.activeProvince.id;
            const weather = () =>
              props.weatherMap[prov.queryParam.toLowerCase()] ||
              (isActive() ? props.weatherMap[props.activeProvince.queryParam.toLowerCase()] : null);
            const temp = () => (weather() ? `${Math.round(weather()!.temp_c)}°C` : null);

            return (
              <MapMarker
                longitude={prov.coordinates[0]}
                latitude={prov.coordinates[1]}
                onClick={() => props.onSelectProvince(prov)}
              >
                <MarkerContent>
                  <div
                    class={cn(
                      "group relative flex flex-col items-center cursor-pointer transition-all duration-300",
                      isActive()
                        ? "scale-115 z-30"
                        : "scale-90 hover:scale-105 z-10 opacity-90 hover:opacity-100"
                    )}
                  >
                    {/* Pin Capsule */}
                    <div
                      class={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-full border shadow-md text-xs transition-all apple-press",
                        isActive()
                          ? "bg-primary text-primary-foreground border-primary ring-4 ring-primary/20 shadow-lg scale-105 font-semibold"
                          : "apple-glass text-foreground hover:border-primary/50"
                      )}
                    >
                      <Show
                        when={weather()?.condition.icon}
                        fallback={
                          <div
                            class={cn(
                              "size-2 rounded-full",
                              isActive() ? "bg-primary-foreground animate-pulse" : "bg-primary/70"
                            )}
                          />
                        }
                      >
                        <img
                          src={`https:${weather()!.condition.icon}`}
                          alt={weather()!.condition.text}
                          class="size-4 object-contain"
                        />
                      </Show>

                      <span class="font-semibold tracking-tight text-[11px] font-khmer">
                        {prov.nameKh}
                      </span>

                      <Show when={temp()}>
                        <span
                          class={cn(
                            "text-[10px] px-1 rounded font-mono font-medium",
                            isActive()
                              ? "bg-primary-foreground/25 text-white"
                              : "text-muted-foreground"
                          )}
                        >
                          {temp()}
                        </span>
                      </Show>
                    </div>

                    {/* Pin arrow point */}
                    <div
                      class={cn(
                        "w-2 h-1.5 border-t-[6px] border-l-[4px] border-r-[4px] border-b-0 border-l-transparent border-r-transparent -mt-[1px]",
                        isActive() ? "border-t-primary" : "border-t-border"
                      )}
                    />
                  </div>
                </MarkerContent>

                {/* Rich popup for the active marker */}
                <Show when={isActive() && weather()}>
                  <MarkerPopup open={true} class="w-52 sm:w-56 p-2.5 sm:p-3 max-w-[calc(100vw-40px)]">
                    <div class="space-y-1.5 sm:space-y-2">
                      <div class="flex items-center justify-between border-b pb-1.5">
                        <div>
                          <div class="font-bold text-sm leading-snug py-0.5 text-foreground font-khmer">
                            {prov.nameKh}
                          </div>
                          <div class="text-[11px] text-muted-foreground">
                            {prov.nameEn}
                          </div>
                        </div>
                        <span class="text-xl font-bold text-primary">
                          {temp()}
                        </span>
                      </div>

                      <div class="flex items-center gap-2 text-xs">
                        <Show when={weather()?.condition.icon}>
                          <img
                            src={`https:${weather()!.condition.icon}`}
                            alt={weather()!.condition.text}
                            class="size-6 sm:size-7"
                          />
                        </Show>
                        <div>
                          <div class="font-medium text-foreground text-[11px] font-khmer">
                            {weather()!.condition.text}
                          </div>
                          <div class="text-[10px] text-muted-foreground">
                            មានអារម្មណ៍ដូច {Math.round(weather()!.feelslike_c)}°C
                          </div>
                        </div>
                      </div>

                      <div class="grid grid-cols-2 gap-1.5 pt-1 text-[10px] text-muted-foreground border-t">
                        <div class="flex items-center gap-1">
                          <Droplets class="size-3 text-sky-500 shrink-0" />
                          <span>សំណើម {weather()!.humidity}%</span>
                        </div>
                        <div class="flex items-center gap-1">
                          <Wind class="size-3 text-teal-500 shrink-0" />
                          <span>ខ្យល់ {weather()!.wind_kph}km/h</span>
                        </div>
                      </div>
                    </div>
                  </MarkerPopup>
                </Show>
              </MapMarker>
            );
          }}
        </For>
      </Map>

      {/* Map Legend */}
      <div class="absolute bottom-4 left-4 z-10 pointer-events-none max-w-[calc(100%-80px)]">
        <div class="apple-glass rounded-full px-2.5 py-1 text-[10px] sm:text-[11px] text-muted-foreground shadow-xs flex items-center gap-1.5 truncate">
          <div class="size-1.5 rounded-full bg-primary shrink-0" />
          <span class="truncate">ជ្រើសរើសខេត្ត · Click province pin</span>
        </div>
      </div>
    </div>
  );
}
