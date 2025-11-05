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

// === Variables de entorno de Vite ===
interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}