// Vite build tool definitions
declare module 'vite' {
  export interface UserConfig {
    plugins?: any[];
    server?: {
      port?: number;
      proxy?: Record<string, {
        target: string;
        changeOrigin?: boolean;
        [key: string]: any;
      }>;
      [key: string]: any;
    };
    build?: {
      outDir?: string;
      sourcemap?: boolean;
      [key: string]: any;
    };
    define?: Record<string, any>;
    resolve?: {
      alias?: Record<string, string>;
      [key: string]: any;
    };
    [key: string]: any;
  }
  
  export function defineConfig(config: UserConfig | (() => UserConfig)): UserConfig;
}

declare module '@vitejs/plugin-react' {
  interface ReactPluginOptions {
    include?: string | RegExp | Array<string | RegExp>;
    exclude?: string | RegExp | Array<string | RegExp>;
    jsxImportSource?: string;
    jsxRuntime?: 'automatic' | 'classic';
    babel?: any;
    [key: string]: any;
  }
  
  function react(options?: ReactPluginOptions): any;
  export default react;
}
