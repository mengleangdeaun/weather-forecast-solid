import {
  createSignal,
  createEffect,
  onMount,
  Show,
} from "solid-js";
import {
  CAMBODIA_PROVINCES,
  type Province,
  findNearestProvince,
} from "@/lib/provinces";
import {
  type WeatherData,
  fetchWeather,
  getLastSelectedProvinceId,
  saveLastSelectedProvinceId,
  getWeatherAtmosphere,
} from "@/lib/weather-api";
import { Header } from "@/components/Header";
import { WeatherHero } from "@/components/WeatherHero";
import { WeatherMetricsGrid } from "@/components/WeatherMetricsGrid";
import { ProvinceSelector } from "@/components/ProvinceSelector";
import { WeatherMap } from "@/components/WeatherMap";
import { LocationBanner } from "@/components/LocationBanner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, RefreshCw } from "lucide-solid";

export function App() {
  // Theme state
  const initialTheme = (): "light" | "dark" => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kh_weather_theme");
      if (saved === "light" || saved === "dark") return saved;
      return "light"; // Default to light mode
    }
    return "light";
  };

  const [theme, setTheme] = createSignal<"light" | "dark">(initialTheme());

  createEffect(() => {
    const curTheme = theme();
    if (curTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
    localStorage.setItem("kh_weather_theme", curTheme);
  });

  const handleToggleTheme = () => {
    const nextTheme: "light" | "dark" = theme() === "dark" ? "light" : "dark";

    // Disable all CSS transitions instantly during theme toggle to prevent flickering
    document.documentElement.classList.add("theme-switching");

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }

    setTheme(nextTheme);
    localStorage.setItem("kh_weather_theme", nextTheme);

    setTimeout(() => {
      document.documentElement.classList.remove("theme-switching");
    }, 50);
  };

  // Active province state
  const initialProvince = (): Province => {
    const savedId = getLastSelectedProvinceId();
    const found = CAMBODIA_PROVINCES.find((p) => p.id === savedId);
    return found || CAMBODIA_PROVINCES[0]; // Default Phnom Penh
  };

  const [activeProvince, setActiveProvince] = createSignal<Province>(initialProvince());
  const [weatherMap, setWeatherMap] = createSignal<Record<string, WeatherData>>({});
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);

  // User GPS coordinates [lng, lat]
  const [userLocation, setUserLocation] = createSignal<[number, number] | null>(null);
  const [locationStatus, setLocationStatus] = createSignal<
    "locating" | "success" | "error" | null
  >(null);
  const [detectedProvinceInfo, setDetectedProvinceInfo] = createSignal<{
    province: Province;
    distanceKm: number;
  } | null>(null);

  // Fetch weather for a single province
  const loadWeather = async (prov: Province) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchWeather(prov.queryParam);
      setWeatherMap((prev) => ({
        ...prev,
        [prov.queryParam.toLowerCase()]: data,
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load weather data";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Province selection handler
  const handleSelectProvince = (province: Province) => {
    setActiveProvince(province);
    saveLastSelectedProvinceId(province.id);
    loadWeather(province);
  };

  // Initial load & sequential background preloading
  onMount(() => {
    loadWeather(activeProvince());

    // Preload remaining provinces gently
    const remainingProvinces = CAMBODIA_PROVINCES.filter(
      (p) => p.id !== activeProvince().id
    );

    const loadSequentially = async () => {
      await new Promise((r) => setTimeout(r, 600));

      for (const p of remainingProvinces) {
        try {
          const data = await fetchWeather(p.queryParam);
          setWeatherMap((prev) => ({
            ...prev,
            [p.queryParam.toLowerCase()]: data,
          }));
          await new Promise((r) => setTimeout(r, 400));
        } catch {
          // Ignore background fetch errors
        }
      }
    };

    loadSequentially();
  });

  // GPS detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      setErrorMessage(
        "កម្មវិធីរុករករបស់អ្នកមិនគាំទ្រ Geolocation ទេ។ · Browser does not support geolocation."
      );
      return;
    }

    setLocationStatus("locating");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([longitude, latitude]);

        const match = findNearestProvince(latitude, longitude);
        setDetectedProvinceInfo(match);
        setLocationStatus("success");
        handleSelectProvince(match.province);
      },
      (err) => {
        setLocationStatus("error");
        setErrorMessage(
          err.message ||
            "ការទាញយកទីតាំងត្រូវបានបដិសេធ។ · Geolocation permission denied."
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const currentWeather = () => {
    const prov = activeProvince();
    return weatherMap()[prov.queryParam.toLowerCase()] || null;
  };

  const atmosphereClass = () => {
    const w = currentWeather();
    if (!w) return "atmosphere-cloudy";
    return `atmosphere-${getWeatherAtmosphere(w.condition.code, w.is_day)}`;
  };

  return (
    <div
      class={cn(
        "min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden w-full pt-14 sm:pt-16",
        atmosphereClass()
      )}
    >
      {/* Header Bar (Fixed at top) */}
      <Header
        onDetectLocation={handleDetectLocation}
        isLocating={locationStatus() === "locating"}
        onRefreshAll={() => loadWeather(activeProvince())}
        isRefreshing={isLoading()}
        theme={theme()}
        onToggleTheme={handleToggleTheme}
      />

      {/* GPS Location Status Banner */}
      <LocationBanner
        status={locationStatus()}
        detectedProvince={detectedProvinceInfo()?.province}
        distanceKm={detectedProvinceInfo()?.distanceKm}
        errorMessage={errorMessage()}
        onDismiss={() => setLocationStatus(null)}
      />

      {/* Error alert banner */}
      <Show when={errorMessage()}>
        <div class="mx-auto max-w-7xl px-4 sm:px-6 pt-3 w-full">
          <div class="flex items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive backdrop-blur-md">
            <div class="flex items-center gap-2">
              <AlertTriangle class="size-4 shrink-0" />
              <span>{errorMessage()}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => loadWeather(activeProvince())}
              class="text-xs h-7 gap-1"
            >
              <RefreshCw class="size-3" />
              <span>ព្យាយាមម្តងទៀត · Retry</span>
            </Button>
          </div>
        </div>
      </Show>

      {/* Main Content Area */}
      <main class="flex-1 mx-auto max-w-7xl w-full px-3 sm:px-6 py-3.5 sm:py-6 space-y-4 sm:space-y-6">
        {/* Weather Hero Card */}
        <WeatherHero
          province={activeProvince()}
          weather={currentWeather()}
          isLoading={isLoading()}
          onRefresh={() => loadWeather(activeProvince())}
        />

        {/* Wide Landscape Interactive Map */}
        <section class="w-full space-y-2 sm:space-y-2.5">
          <div class="flex items-center justify-between px-1">
            <div class="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span class="text-xs sm:text-sm font-bold text-foreground truncate">
                ផែនទីអាកាសធាតុកម្ពុជា
              </span>
              <span class="text-[11px] sm:text-xs text-muted-foreground font-medium truncate hidden xs:inline">
                · Interactive Weather Map
              </span>
            </div>
            <span class="text-[10px] sm:text-[11px] text-muted-foreground hidden sm:inline">
              ចុចលើខេត្តនីមួយៗដើម្បីមើលទិន្នន័យអាកាសធាតុ · Click pins to explore
            </span>
          </div>

          <div class="w-full h-[360px] sm:h-[480px] lg:h-[600px]">
            <WeatherMap
              activeProvince={activeProvince()}
              onSelectProvince={handleSelectProvince}
              weatherMap={weatherMap()}
              userLocation={userLocation()}
              theme={theme()}
              onDetectLocation={handleDetectLocation}
            />
          </div>
        </section>

        {/* Detailed Metrics Grid */}
        <section class="space-y-2 sm:space-y-2.5">
          <div class="flex items-center gap-1.5 sm:gap-2 px-1">
            <span class="text-xs sm:text-sm font-bold text-foreground">
              លក្ខខណ្ឌបរិយាកាសលម្អិត
            </span>
            <span class="text-[11px] sm:text-xs text-muted-foreground font-medium hidden xs:inline">
              · Atmospheric Conditions
            </span>
          </div>
          <WeatherMetricsGrid weather={currentWeather()} />
        </section>

        {/* Full-width Province Selector below */}
        <section class="pt-2">
          <ProvinceSelector
            activeProvince={activeProvince()}
            onSelectProvince={handleSelectProvince}
            weatherMap={weatherMap()}
          />
        </section>
      </main>

      {/* Footer */}
      <footer class="mt-auto border-t bg-card/40 backdrop-blur-md py-6 text-center text-xs text-muted-foreground">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <div class="text-[11px]">
            Built with Love ©{new Date().getFullYear()} Mengleang · Powered by Solid.js
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
