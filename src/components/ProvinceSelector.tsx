import { createSignal, createMemo, For, Show } from "solid-js";
import {
  CAMBODIA_PROVINCES,
  CAMBODIA_REGIONS,
  type Province,
} from "@/lib/provinces";
import type { WeatherData } from "@/lib/weather-api";
import { Search, MapPin, Check } from "lucide-solid";
import { cn } from "@/lib/utils";

interface ProvinceSelectorProps {
  activeProvince: Province;
  onSelectProvince: (province: Province) => void;
  weatherMap: Record<string, WeatherData>;
}

export function ProvinceSelector(props: ProvinceSelectorProps) {
  const [searchQuery, setSearchQuery] = createSignal("");
  const [selectedRegion, setSelectedRegion] = createSignal<string>("all");

  const filteredProvinces = createMemo(() => {
    const q = searchQuery().trim().toLowerCase();
    const region = selectedRegion();

    return CAMBODIA_PROVINCES.filter((p) => {
      // Region filter
      if (region !== "all" && p.region !== region) {
        return false;
      }
      // Text search filter (Khmer or English)
      if (q) {
        const matchKh = p.nameKh.includes(q);
        const matchEn = p.nameEn.toLowerCase().includes(q);
        const matchCapital =
          p.capitalEn.toLowerCase().includes(q) || p.capitalKh.includes(q);
        return matchKh || matchEn || matchCapital;
      }
      return true;
    });
  });

  return (
    <div class="space-y-4 rounded-3xl apple-glass p-5 sm:p-6 shadow-xl">
      {/* Header & Apple-style Search */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 class="text-base font-bold text-foreground flex items-center gap-2 tracking-tight">
            <MapPin class="size-4 text-primary" />
            <span class="font-khmer">ជ្រើសរើសរាជធានី-ខេត្ត</span>
            <span class="text-muted-foreground font-normal text-xs">
              · Select Province
            </span>
          </h3>
          <p class="text-[11px] text-muted-foreground/90 font-medium">
            សរុប {filteredProvinces().length} ក្នុងចំណោម ២៥ រាជធានី-ខេត្តនៃកម្ពុជា
          </p>
        </div>

        {/* Apple frosted search input */}
        <div class="relative w-full sm:w-72">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.currentTarget.value)}
            placeholder="ស្វែងរក / Search province..."
            class="w-full rounded-full border border-border/80 bg-background/70 py-1.5 pl-9 pr-8 text-[16px] sm:text-xs text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 backdrop-blur-md transition-all"
          />
          <Show when={searchQuery()}>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              class="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 rounded-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground hover:text-foreground cursor-pointer apple-press"
            >
              ×
            </button>
          </Show>
        </div>
      </div>

      {/* Region tabs (Apple Segmented Pills) */}
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <For each={CAMBODIA_REGIONS}>
          {(region) => {
            const isSelected = () => selectedRegion() === region.id;
            return (
              <button
                type="button"
                onClick={() => setSelectedRegion(region.id)}
                class={cn(
                  "whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-medium transition-all apple-press cursor-pointer border",
                  isSelected()
                    ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                    : "bg-muted/40 hover:bg-muted/70 text-muted-foreground hover:text-foreground border-transparent"
                )}
              >
                <span class="font-khmer">{region.labelKh}</span>
                <span class="opacity-50 ml-1">· {region.labelEn}</span>
              </button>
            );
          }}
        </For>
      </div>

      {/* Province chips grid with custom glass scrollbar */}
      <div class="h-68 sm:h-72 w-full pr-2 custom-glass-scroll">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 pt-1 pb-2">
          <For each={filteredProvinces()}>
            {(prov) => {
              const isActive = () => prov.id === props.activeProvince.id;
              const weather = () => props.weatherMap[prov.queryParam.toLowerCase()];
              const temp = () => (weather() ? `${Math.round(weather()!.temp_c)}°C` : null);

              return (
                <button
                  type="button"
                  onClick={() => props.onSelectProvince(prov)}
                  class={cn(
                    "group relative flex items-center justify-between rounded-2xl px-3 py-2.5 text-left transition-all apple-press cursor-pointer border",
                    isActive()
                      ? "bg-primary/20 border-primary text-primary font-semibold shadow-xs ring-1 ring-primary/40"
                      : "bg-card/60 hover:bg-card/90 border-border/60 text-foreground hover:border-border shadow-2xs"
                  )}
                >
                  <div class="truncate pr-1">
                    <div class="text-xs font-semibold leading-snug py-0.5 font-khmer">
                      {prov.nameKh}
                    </div>
                    <div class="text-[10px] text-muted-foreground/80 truncate tracking-tight">
                      {prov.nameEn}
                    </div>
                  </div>

                  <div class="flex items-center gap-1.5 shrink-0">
                    <Show when={temp()}>
                      <span class="text-[11px] font-mono font-medium text-foreground/90">
                        {temp()}
                      </span>
                    </Show>
                    <Show when={isActive()}>
                      <div class="size-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                        <Check class="size-2.5" />
                      </div>
                    </Show>
                  </div>
                </button>
              );
            }}
          </For>
        </div>

        <Show when={filteredProvinces().length === 0}>
          <div class="col-span-full py-8 text-center text-xs text-muted-foreground font-medium">
            រកមិនឃើញរាជធានី-ខេត្តដែលត្រូវគ្នានឹង "{searchQuery()}" ទេ · No provinces matching query
          </div>
        </Show>
      </div>
    </div>
  );
}
