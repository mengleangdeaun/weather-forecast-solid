import type * as MapLibreGL from "maplibre-gl";
import { createContext, useContext, type Accessor } from "solid-js";

export type MapContextValue = {
  map: Accessor<MapLibreGL.Map | null>;
  isLoaded: Accessor<boolean>;
};

export const MapContext = createContext<MapContextValue>();

export function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a Map component");
  }
  return context;
}

export type MapViewport = {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
};
