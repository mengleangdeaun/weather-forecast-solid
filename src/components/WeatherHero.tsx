import { Show } from "solid-js";
import type { Province } from "@/lib/provinces";
import {
  type WeatherData,
  getKhmerWeatherCondition,
  getWeatherAtmosphere,
} from "@/lib/weather-api";
import { cn } from "@/lib/utils";
import { Clock, Thermometer, MapPin, RefreshCw } from "lucide-solid";

interface WeatherHeroProps {
  province: Province;
  weather: WeatherData | null;
  isLoading: boolean;
  onRefresh?: () => void;
}

export function WeatherHero(props: WeatherHeroProps) {
  const atmosphereGradients = {
    sunny: "from-amber-500/14 via-orange-500/6 to-transparent",
    cloudy: "from-sky-500/12 via-slate-500/6 to-transparent",
    rainy: "from-cyan-600/20 via-blue-600/8 to-transparent",
    thunder: "from-purple-600/22 via-indigo-600/8 to-transparent",
    night: "from-indigo-600/18 via-blue-950/15 to-transparent",
  };

  const atmosphere = () =>
    props.weather
      ? getWeatherAtmosphere(props.weather.condition.code, props.weather.is_day)
      : "cloudy";

  return (
    <Show
      when={props.weather}
      fallback={
        <Show when={props.isLoading}>
          <div class="relative overflow-hidden rounded-3xl apple-glass p-4 sm:p-6 lg:p-8 shadow-xl animate-pulse">
            <div class="h-5 w-40 bg-muted/60 rounded-full mb-3" />
            <div class="h-16 sm:h-24 w-36 sm:w-44 bg-muted/60 rounded-3xl mb-4" />
            <div class="h-4 w-52 bg-muted/60 rounded-full" />
          </div>
        </Show>
      }
    >
      <div
        class={cn(
          "relative overflow-hidden rounded-3xl apple-glass p-4 sm:p-6 lg:p-8 shadow-2xl transition-colors duration-300 bg-gradient-to-br",
          atmosphereGradients[atmosphere()]
        )}
      >
        {/* Ambient specular highlight reflection */}
        <div class="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-primary/15 blur-3xl" />

        <div class="relative z-10 flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left column: Province Identification & Condition */}
          <div class="space-y-2.5 sm:space-y-3.5">
            {/* Region Tag & Timestamp */}
            <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span class="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-primary/15 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold text-primary border border-primary/20 shadow-2xs">
                <MapPin class="size-3 shrink-0" />
                <span class="font-khmer">{props.province.regionLabelKh}</span>
                <span class="opacity-40">·</span>
                <span>{props.province.regionLabelEn}</span>
              </span>

              <span class="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-muted-foreground font-medium">
                <Clock class="size-3 opacity-70 shrink-0" />
                <span>
                  {props.weather?.last_updated?.split(" ")[1] || "ថ្មីៗ"}
                </span>
              </span>

              <Show when={props.onRefresh}>
                <button
                  type="button"
                  onClick={props.onRefresh}
                  class="size-5 sm:size-6 rounded-full bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center apple-press cursor-pointer border border-border/40 shrink-0"
                  title="Refresh weather"
                >
                  <RefreshCw
                    class={cn(
                      "size-2.5 sm:size-3",
                      props.isLoading && "animate-spin text-primary"
                    )}
                  />
                </button>
              </Show>
            </div>

            {/* Bilingual Province Title */}
            <div>
              <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground flex flex-wrap items-baseline gap-x-2 sm:gap-x-3 gap-y-0.5">
                <span class="font-khmer">{props.province.nameKh}</span>
                <span class="text-lg sm:text-2xl lg:text-3xl font-normal text-muted-foreground/80 tracking-tight">
                  · {props.province.nameEn}
                </span>
              </h2>
              <p class="text-[11px] sm:text-sm text-muted-foreground/90 mt-0.5 sm:mt-1 font-medium truncate">
                <span class="font-khmer">{props.province.capitalKh}</span> ·{" "}
                {props.province.capitalEn}
              </p>
            </div>

            {/* Condition pill & bilingual description */}
            <div class="flex items-center gap-2.5 sm:gap-3.5 pt-0.5 sm:pt-1">
              <Show when={props.weather?.condition.icon}>
                <div class="flex size-11 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-background/80 shadow-md border border-white/20 p-1 backdrop-blur-md">
                  <img
                    src={`https:${props.weather?.condition.icon}`}
                    alt={props.weather?.condition.text}
                    class="size-9 sm:size-12 object-contain"
                  />
                </div>
              </Show>
              <div class="min-w-0">
                <div class="text-base sm:text-xl font-bold text-foreground tracking-tight font-khmer truncate">
                  {getKhmerWeatherCondition(props.weather?.condition.text || "")}
                </div>
                <div class="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                  {props.weather?.condition.text}
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Temperature & Feels Like */}
          <div class="flex flex-row items-end justify-between sm:justify-start lg:flex-col lg:items-end gap-2 border-t lg:border-t-0 pt-3 sm:pt-4 lg:pt-0 border-border/50">
            <div class="flex items-start">
              <span class="text-6xl sm:text-7xl lg:text-9xl font-light tracking-tighter text-foreground tabular-nums leading-none">
                {Math.round(props.weather?.temp_c || 0)}
              </span>
              <span class="text-3xl sm:text-4xl lg:text-5xl font-extralight text-primary/90 ml-0.5">
                °
              </span>
            </div>

            <div class="flex flex-col items-end gap-0.5 sm:gap-1 text-xs sm:text-sm">
              <div class="flex items-center gap-1.5 text-muted-foreground font-medium">
                <Thermometer class="size-3.5 text-amber-500 shrink-0" />
                <span>
                  មានអារម្មណ៍ដូច{" "}
                  <strong class="text-foreground font-semibold">
                    {Math.round(props.weather?.feelslike_c || 0)}°
                  </strong>
                </span>
              </div>

              <Show when={props.weather?.heatindex_c !== null && props.weather?.heatindex_c !== undefined}>
                <div class="text-[10px] sm:text-[11px] text-muted-foreground/75 font-medium">
                  កម្តៅ Heat Index: {Math.round(props.weather?.heatindex_c || 0)}°C
                </div>
              </Show>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}
