/// <reference types="react-scripts" />

declare interface Window {
  google: any;
}

declare namespace google.maps {
  export class Map {
    constructor(mapDiv: Element, opts?: MapOptions);
    setCenter(latLng: LatLng | LatLngLiteral): void;
    setZoom(zoom: number): void;
    // ... other methods you might use
  }

  export class Marker {
    constructor(opts?: MarkerOptions);
    setMap(map: Map | null): void;
    getPosition(): LatLng;
    getTitle(): string;
    addListener(eventName: string, handler: Function): MapsEventListener;
    // ... other methods you might use
  }

  export class InfoWindow {
    constructor(opts?: InfoWindowOptions);
    open(map?: Map, anchor?: MVCObject): void;
    // ... other methods you might use
  }

  export interface LatLng {
    lat(): number;
    lng(): number;
    // ... other methods you might use
  }

  export interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  export interface MapOptions {
    center?: LatLng | LatLngLiteral;
    zoom?: number;
    mapTypeControl?: boolean;
    fullscreenControl?: boolean;
    streetViewControl?: boolean;
    zoomControl?: boolean;
    zoomControlOptions?: ZoomControlOptions;
    // ... other options you might use
  }

  export interface ZoomControlOptions {
    position?: ControlPosition;
  }

  export interface MarkerOptions {
    position?: LatLng | LatLngLiteral;
    map?: Map;
    title?: string;
    icon?: string | Icon | Symbol;
    // ... other options you might use
  }

  export interface InfoWindowOptions {
    content?: string | Node;
    // ... other options you might use
  }

  export interface MapsEventListener {
    remove(): void;
  }

  export interface MVCObject {
    // ... methods you might use
  }

  export class SymbolPath {
    static CIRCLE: number;
    // ... other properties
  }

  export enum ControlPosition {
    RIGHT_BOTTOM,
    // ... other positions
  }
}
