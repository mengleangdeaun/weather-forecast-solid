import { Show, For, createMemo } from "solid-js";
import type { WeatherData } from "@/lib/weather-api";
import {
  Wind,
  Droplets,
  Gauge,
  CloudRain,
  Cloud,
  Eye,
  Navigation,
} from "lucide-solid";
import { cn } from "@/lib/utils";

interface WeatherMetricsGridProps {
  weather: WeatherData | null;
}

export function WeatherMetricsGrid(props: WeatherMetricsGridProps) {
  const metrics = createMemo(() => {
    const w = props.weather;
    if (!w) return [];

    const windSpeed = `${w.wind_kph} km/h`;
    const gustSpeed = `${w.gust_kph} km/h`;
    const precip = `${w.precip_mm} mm`;
    const dewPoint = `${w.dewpoint_c}°C`;
    const visibility = `${w.vis_km} km`;

    return [
      {
        id: "wind",
        titleKh: "ខ្យល់",
        titleEn: "WIND",
        value: windSpeed,
        subValue: `ខ្យល់កន្ត្រាក់: ${gustSpeed}`,
        meta: `ទិស ${w.wind_dir} (${w.wind_degree}°)`,
        icon: Wind,
        color: "text-teal-400",
        bg: "bg-teal-500/12",
        compassAngle: w.wind_degree,
        progress: Math.min(100, Math.round((w.wind_kph / 60) * 100)),
      },
      {
        id: "humidity",
        titleKh: "សំណើម",
        titleEn: "HUMIDITY",
        value: `${w.humidity}%`,
        subValue: `ទឹកសន្សើម: ${dewPoint}`,
        meta: w.humidity > 80 ? "សំណើមខ្ពស់ · High" : "សំណើមធម្មតា · Normal",
        icon: Droplets,
        color: "text-sky-400",
        bg: "bg-sky-500/12",
        progress: w.humidity,
      },
      {
        id: "pressure",
        titleKh: "សម្ពាធ",
        titleEn: "PRESSURE",
        value: `${w.pressure_mb}`,
        unitLabel: "hPa",
        subValue: `${w.pressure_in} inHg`,
        meta: w.pressure_mb >= 1013 ? "សម្ពាធប្រក្រតី · Steady" : "សម្ពាធទាប · Low",
        icon: Gauge,
        color: "text-indigo-400",
        bg: "bg-indigo-500/12",
        progress: Math.min(100, Math.max(0, Math.round(((w.pressure_mb - 980) / 60) * 100))),
      },
      {
        id: "precip",
        titleKh: "ទឹកភ្លៀង",
        titleEn: "PRECIPITATION",
        value: precip,
        subValue: Number(w.precip_mm) > 0 ? "មានភ្លៀងធ្លាក់ · Rain" : "គ្មានភ្លៀងទេ · None",
        meta: "កម្រិតទឹកភ្លៀងចុងក្រោយ",
        icon: CloudRain,
        color: "text-blue-400",
        bg: "bg-blue-500/12",
        progress: Math.min(100, Math.round((Number(w.precip_mm) / 30) * 100)),
      },
      {
        id: "cloud",
        titleKh: "ពពក",
        titleEn: "CLOUD",
        value: `${w.cloud}%`,
        subValue:
          w.cloud > 70
            ? "មេឃស្រទំ · Cloudy"
            : w.cloud > 30
            ? "ពពកខ្លះៗ · Partly"
            : "មេឃស្រឡះ · Clear",
        meta: "កម្រិតគ្របដណ្តប់ពពក",
        icon: Cloud,
        color: "text-slate-300",
        bg: "bg-slate-500/12",
        progress: w.cloud,
      },
      {
        id: "visibility",
        titleKh: "ចម្ងាយ",
        titleEn: "VISIBILITY",
        value: visibility,
        subValue: w.vis_km >= 10 ? "ច្បាស់ល្អ · Perfect" : "មានអ័ព្ទ · Reduced",
        meta: "ចម្ងាយមើលឃើញ",
        icon: Eye,
        color: "text-emerald-400",
        bg: "bg-emerald-500/12",
        progress: Math.min(100, Math.round((w.vis_km / 10) * 100)),
      },
    ];
  });

  return (
    <Show when={props.weather}>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
        <For each={metrics()}>
          {(item) => {
            const IconComponent = item.icon;
            return (
              <div class="group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl apple-glass p-3 sm:p-4.5 shadow-sm transition-all duration-300 hover:shadow-md apple-press min-h-[135px] sm:min-h-[155px]">
                {/* Header: Icon + Category Label */}
                <div>
                  <div class="flex items-center justify-between gap-1 text-[10px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
                    <div class="flex items-center gap-1 truncate">
                      <IconComponent class={cn("size-3.5 shrink-0", item.color)} />
                      <span class="truncate">{item.titleEn}</span>
                    </div>
                    <Show
                      when={item.id === "wind" && item.compassAngle !== undefined}
                      fallback={
                        <span class="font-khmer normal-case font-medium text-[10px] opacity-70 shrink-0 hidden xs:inline">
                          {item.titleKh}
                        </span>
                      }
                    >
                      <Navigation
                        class="size-3 text-teal-400 shrink-0 transition-transform duration-500"
                        style={{ transform: `rotate(${item.compassAngle}deg)` }}
                      />
                    </Show>
                  </div>

                  {/* Value readout */}
                  <div class="mt-1.5 sm:mt-2.5 flex items-baseline gap-1">
                    <span class="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground tabular-nums">
                      {item.value}
                    </span>
                    <Show when={item.unitLabel}>
                      <span class="text-[11px] sm:text-xs font-medium text-muted-foreground">
                        {item.unitLabel}
                      </span>
                    </Show>
                  </div>
                </div>

                {/* Apple Subtle Gauge Bar */}
                <div class="my-1.5 sm:my-2.5">
                  <div class="h-1 sm:h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                    <div
                      class="h-full rounded-full bg-primary/70 transition-all duration-700 ease-out"
                      style={{ width: `${Math.max(8, item.progress)}%` }}
                    />
                  </div>
                </div>

                {/* Footer Summary */}
                <div class="space-y-0.5 min-w-0 pt-0.5">
                  <div class="text-[11px] sm:text-xs font-semibold text-foreground/90 font-khmer leading-snug py-0.5 truncate tracking-normal">
                    {item.subValue}
                  </div>
                  <div class="text-[10px] sm:text-[11px] text-muted-foreground/90 font-khmer leading-snug py-0.5 truncate tracking-normal">
                    {item.meta}
                  </div>
                </div>
              </div>
            );
          }}
        </For>
      </div>
    </Show>
  );
}
