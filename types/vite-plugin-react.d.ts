declare module "@vitejs/plugin-react" {
  import type { Plugin } from "vite";

  export interface ReactPluginOptions {
    jsxImportSource?: string;
    babel?: {
      plugins?: any[];
      presets?: any[];
    };
    fastRefresh?: boolean;
    include?: string | RegExp | (string | RegExp)[];
    exclude?: string | RegExp | (string | RegExp)[];
  }

  export default function react(options?: ReactPluginOptions): Plugin;
}

