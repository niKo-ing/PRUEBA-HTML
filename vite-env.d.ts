/// <reference types="vite/client" />

declare module "*.jpg";
declare module "*.jpeg";
declare module "*.png";
declare module "*.gif";
declare module "*.svg";
declare module "*.webp";
declare module "*.mp4";
declare module "*.webm";
declare module "*.ogg";
declare module "*.mp3";
declare module "*.wav";

// Soporte para extensiones en MAYÚSCULAS
declare module "*.JPG";
declare module "*.JPEG";
declare module "*.PNG";
declare module "*.GIF";
declare module "*.SVG";
declare module "*.WEBP";
declare module "*.MP4";
declare module "*.WEBM";
declare module "*.OGG";
declare module "*.MP3";
declare module "*.WAV";

// === Variables de entorno de Vite ===
interface ImportMetaEnv {
  // Variables propias de la app
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_TARGET?: string;

  // Propiedades estándar de Vite
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR?: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
