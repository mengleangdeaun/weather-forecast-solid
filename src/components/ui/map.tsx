import * as MapLibreGL from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  createSignal,
  createEffect,
  createMemo,
  onMount,
  onCleanup,
  createContext,
  useContext,
  Show,
  type JSX,
  type Accessor,
} from "solid-js";
import { Portal } from "solid-js/web";
import { MapContext, useMap, type MapViewport } from "./map-context";
export { useMap, type MapViewport };
import { Plus, Minus, Locate, Layers } from "lucide-solid";
import { cn } from "@/lib/utils";

// Initialize RTL plugin for complex scripts like Khmer
if (typeof window !== "undefined" && !MapLibreGL.getRTLTextPluginStatus()) {
  try {
    (MapLibreGL as unknown as { setRTLTextPlugin: (url: string, callback?: unknown, lazy?: boolean) => void }).setRTLTextPlugin(
      "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js",
      null,
      false
    );
  } catch (e) {
    console.warn("RTL text plugin init:", e);
  }
}

export type MapLayerType = "roadmap" | "satellite" | "terrain";

export function createGoogleKhmerStyle(layer: MapLayerType, isDark: boolean): MapLibreGL.StyleSpecification {
  let tilesUrl = "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=km";

  if (layer === "satellite") {
    // Hybrid satellite with Khmer place labels
    tilesUrl = "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&hl=km";
  } else if (layer === "terrain") {
    // Terrain with elevation shading & Khmer place labels
    tilesUrl = "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}&hl=km";
  }

  const paintProps: Record<string, unknown> =
    isDark && layer === "roadmap"
      ? {
          "raster-brightness-max": 0.85,
          "raster-brightness-min": 0.08,
          "raster-contrast": 0.15,
          "raster-hue-rotate": 180,
          "raster-saturation": -0.65,
        }
      : {};

  return {
    version: 8,
    sources: {
      "google-khmer-tiles": {
        type: "raster",
        tiles: [tilesUrl],
        tileSize: 256,
        attribution: "&copy; Google Maps",
      },
    },
    layers: [
      {
        id: "google-khmer-tiles",
        type: "raster",
        source: "google-khmer-tiles",
        minzoom: 0,
        maxzoom: 22,
        paint: paintProps,
      },
    ],
  };
}

export type Theme = "light" | "dark";

export interface MapProps {
  children?: JSX.Element;
  class?: string;
  theme?: Theme;
  mapLayer?: MapLayerType;
  viewport?: Partial<MapViewport>;
  loading?: boolean;
}

export function Map(props: MapProps) {
  let containerRef: HTMLDivElement | undefined;
  const [mapInstance, setMapInstance] = createSignal<MapLibreGL.Map | null>(null);
  const [isLoaded, setIsLoaded] = createSignal(false);
  let currentKey = "";

  const resolvedTheme = () => {
    if (props.theme) return props.theme;
    if (typeof document !== "undefined" && document.documentElement.classList.contains("dark")) {
      return "dark";
    }
    return "light";
  };

  const activeStyle = createMemo(() => {
    const layer = props.mapLayer || "roadmap";
    const isDark = resolvedTheme() === "dark";
    return createGoogleKhmerStyle(layer, isDark);
  });

  onMount(() => {
    if (!containerRef) return;

    const layer = props.mapLayer || "roadmap";
    const isDark = resolvedTheme() === "dark";
    currentKey = `${layer}-${isDark}`;

    const map = new MapLibreGL.Map({
      container: containerRef,
      style: activeStyle(),
      renderWorldCopies: false,
      attributionControl: {
        compact: true,
      },
      center: props.viewport?.center || [104.991, 12.565],
      zoom: props.viewport?.zoom ?? 7.3,
      bearing: props.viewport?.bearing ?? 0,
      pitch: props.viewport?.pitch ?? 0,
    });

    map.on("load", () => {
      setIsLoaded(true);
      setMapInstance(map);
      map.resize();
    });

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(containerRef);

    onCleanup(() => {
      resizeObserver.disconnect();
      map.remove();
      setMapInstance(null);
      setIsLoaded(false);
    });
  });

  // React to style / layer changes
  createEffect(() => {
    const map = mapInstance();
    const loaded = isLoaded();
    if (!map || !loaded) return;

    const layer = props.mapLayer || "roadmap";
    const isDark = resolvedTheme() === "dark";
    const newKey = `${layer}-${isDark}`;

    if (currentKey !== newKey) {
      currentKey = newKey;
      map.setStyle(activeStyle());
    }
  });

  return (
    <div ref={containerRef} class={cn("relative h-full w-full overflow-hidden", props.class)}>
      <MapContext.Provider value={{ map: mapInstance, isLoaded }}>
        {props.children}
        <Show when={props.loading}>
          <div class="bg-background/50 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-xs">
            <div class="flex gap-1">
              <span class="bg-primary size-2 animate-pulse rounded-full" />
              <span class="bg-primary size-2 animate-pulse rounded-full [animation-delay:150ms]" />
              <span class="bg-primary size-2 animate-pulse rounded-full [animation-delay:300ms]" />
            </div>
          </div>
        </Show>
      </MapContext.Provider>
    </div>
  );
}

// Marker Context
type MarkerContextValue = {
  marker: Accessor<MapLibreGL.Marker | null>;
  map: Accessor<MapLibreGL.Map | null>;
  element: Accessor<HTMLDivElement | null>;
};
const MarkerContext = createContext<MarkerContextValue>();

function useMarkerContext() {
  const ctx = useContext(MarkerContext);
  if (!ctx) {
    throw new Error("useMarkerContext must be used within a MapMarker");
  }
  return ctx;
}

export interface MapMarkerProps {
  longitude: number;
  latitude: number;
  children?: JSX.Element;
  onClick?: (e: MouseEvent) => void;
  draggable?: boolean;
}

export function MapMarker(props: MapMarkerProps) {
  const { map } = useMap();
  const [markerInstance, setMarkerInstance] = createSignal<MapLibreGL.Marker | null>(null);
  const [markerEl, setMarkerEl] = createSignal<HTMLDivElement | null>(null);

  onMount(() => {
    const el = document.createElement("div");
    setMarkerEl(el);

    const handleClick = (e: MouseEvent) => {
      e.stopPropagation();
      props.onClick?.(e);
    };
    el.addEventListener("click", handleClick);

    const marker = new MapLibreGL.Marker({
      element: el,
      draggable: props.draggable ?? false,
    }).setLngLat([props.longitude, props.latitude]);

    setMarkerInstance(marker);

    const m = map();
    if (m) {
      marker.addTo(m);
    }

    onCleanup(() => {
      el.removeEventListener("click", handleClick);
      marker.remove();
    });
  });

  // Watch for map ready
  createEffect(() => {
    const m = map();
    const marker = markerInstance();
    if (m && marker) {
      const internalMap = (marker as unknown as { _map?: unknown })._map;
      if (!internalMap) {
        marker.addTo(m);
      }
    }
  });

  // Watch for coordinate changes
  createEffect(() => {
    const marker = markerInstance();
    if (marker) {
      marker.setLngLat([props.longitude, props.latitude]);
    }
  });

  return (
    <MarkerContext.Provider
      value={{
        marker: markerInstance,
        map,
        element: markerEl,
      }}
    >
      {props.children}
    </MarkerContext.Provider>
  );
}

export interface MarkerContentProps {
  children?: JSX.Element;
  class?: string;
}

export function MarkerContent(props: MarkerContentProps) {
  const { element } = useMarkerContext();

  return (
    <Show when={element()}>
      <Portal mount={element()!}>
        <div class={cn("relative cursor-pointer transition-transform", props.class)}>
          {props.children}
        </div>
      </Portal>
    </Show>
  );
}

export interface MarkerLabelProps {
  children: JSX.Element;
  class?: string;
  position?: "top" | "bottom";
}

export function MarkerLabel(props: MarkerLabelProps) {
  const posClass = () => (props.position === "bottom" ? "top-full mt-1.5" : "bottom-full mb-1.5");

  return (
    <div
      class={cn(
        "absolute start-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none select-none",
        "text-foreground text-[11px] font-medium",
        posClass(),
        props.class
      )}
    >
      {props.children}
    </div>
  );
}

export interface MarkerPopupProps {
  children: JSX.Element;
  open?: boolean;
  class?: string;
}

export function MarkerPopup(props: MarkerPopupProps) {
  const { marker, map } = useMarkerContext();
  const container = document.createElement("div");
  let popupInstance: MapLibreGL.Popup | null = null;

  onMount(() => {
    popupInstance = new MapLibreGL.Popup({
      offset: 14,
      closeButton: false,
      className: "weather-map-popup",
    })
      .setMaxWidth("none")
      .setDOMContent(container);

    const m = marker();
    if (m) {
      m.setPopup(popupInstance);
    }

    onCleanup(() => {
      if (popupInstance) {
        popupInstance.remove();
        popupInstance = null;
      }
      const curMarker = marker();
      if (curMarker) {
        curMarker.setPopup(null);
      }
    });
  });

  // Watch open state
  createEffect(() => {
    const isOpen = props.open;
    const curMap = map();
    const curMarker = marker();

    if (!curMap || !curMarker || !popupInstance) return;

    if (isOpen) {
      if (!popupInstance.isOpen()) {
        const internalMap = (curMarker as unknown as { _map?: unknown })._map;
        if (!internalMap) {
          curMarker.addTo(curMap);
        }
        curMarker.togglePopup();
      }
    } else {
      if (popupInstance.isOpen()) {
        popupInstance.remove();
      }
    }
  });

  return (
    <Portal mount={container}>
      <div
        class={cn(
          "bg-popover text-popover-foreground relative rounded-xl border p-3 shadow-2xl backdrop-blur-md",
          props.class
        )}
      >
        {props.children}
      </div>
    </Portal>
  );
}

export interface MapControlsProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  showZoom?: boolean;
  showLocate?: boolean;
  showLayerToggle?: boolean;
  currentLayer?: MapLayerType;
  onChangeLayer?: (layer: MapLayerType) => void;
  class?: string;
  onLocate?: () => void;
}

const positionClasses = {
  "top-left": "top-3 left-3",
  "top-right": "top-3 right-3",
  "bottom-left": "bottom-3 left-3",
  "bottom-right": "bottom-3 right-3",
};

export function MapControls(props: MapControlsProps) {
  const { map } = useMap();
  const [isLocating, setIsLocating] = createSignal(false);
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);

  const handleZoomIn = () => map()?.zoomIn();
  const handleZoomOut = () => map()?.zoomOut();

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { longitude, latitude } = pos.coords;
        map()?.flyTo({ center: [longitude, latitude], zoom: 10 });
        props.onLocate?.();
      },
      () => {
        setIsLocating(false);
      }
    );
  };

  const posClass = () => positionClasses[props.position || "top-right"];

  return (
    <div
      class={cn(
        "absolute z-10 flex flex-col gap-1.5 p-1 rounded-xl bg-card/90 backdrop-blur-md border shadow-lg",
        posClass(),
        props.class
      )}
    >
      <Show when={props.showZoom !== false}>
        <button
          type="button"
          onClick={handleZoomIn}
          class="size-7 rounded-lg hover:bg-muted text-foreground flex items-center justify-center cursor-pointer apple-press"
          title="Zoom in"
        >
          <Plus class="size-3.5" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          class="size-7 rounded-lg hover:bg-muted text-foreground flex items-center justify-center cursor-pointer apple-press"
          title="Zoom out"
        >
          <Minus class="size-3.5" />
        </button>
      </Show>

      <Show when={props.showLocate !== false}>
        <button
          type="button"
          onClick={handleLocate}
          disabled={isLocating()}
          class={cn(
            "size-7 rounded-lg hover:bg-muted text-foreground flex items-center justify-center cursor-pointer apple-press",
            isLocating() && "animate-spin text-primary"
          )}
          title="Find my location"
        >
          <Locate class="size-3.5" />
        </button>
      </Show>

      <Show when={props.showLayerToggle && props.onChangeLayer}>
        <div class="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen())}
            class={cn(
              "size-7 rounded-lg hover:bg-muted text-foreground flex items-center justify-center cursor-pointer apple-press",
              isMenuOpen() && "bg-muted text-primary"
            )}
            title="Switch map layer"
          >
            <Layers class="size-3.5" />
          </button>

          <Show when={isMenuOpen()}>
            <div class="absolute right-full mr-2 top-0 bg-card/95 backdrop-blur-md border rounded-xl p-1 shadow-xl flex flex-col gap-1 whitespace-nowrap z-20 min-w-28">
              <button
                type="button"
                onClick={() => {
                  props.onChangeLayer?.("roadmap");
                  setIsMenuOpen(false);
                }}
                class={cn(
                  "px-2.5 py-1 rounded-lg text-xs text-left cursor-pointer transition-colors",
                  props.currentLayer === "roadmap"
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-muted text-foreground"
                )}
              >
                Roadmap
              </button>
              <button
                type="button"
                onClick={() => {
                  props.onChangeLayer?.("satellite");
                  setIsMenuOpen(false);
                }}
                class={cn(
                  "px-2.5 py-1 rounded-lg text-xs text-left cursor-pointer transition-colors",
                  props.currentLayer === "satellite"
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-muted text-foreground"
                )}
              >
                Satellite
              </button>
              <button
                type="button"
                onClick={() => {
                  props.onChangeLayer?.("terrain");
                  setIsMenuOpen(false);
                }}
                class={cn(
                  "px-2.5 py-1 rounded-lg text-xs text-left cursor-pointer transition-colors",
                  props.currentLayer === "terrain"
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-muted text-foreground"
                )}
              >
                Terrain
              </button>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
}
