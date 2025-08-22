// Global type definitions to resolve TypeScript issues

declare module 'react' {
  export = React;
  export as namespace React;
  
  namespace React {
    export interface FC<P = {}> {
      (props: P): any;
    }
    
    export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
      type: T;
      props: P;
      key: Key | null;
    }
    
    export type ReactNode = ReactElement | string | number | ReactFragment | ReactPortal | boolean | null | undefined | Element | any;
    
    export type Key = string | number;
    
    export type ReactFragment = {} & Iterable<ReactNode>;
    
    export type ReactPortal = {
      key: Key | null;
      children: ReactNode;
    };
    
    export const Fragment: React.FC<{ children?: ReactNode }>;
    export const StrictMode: React.FC<{ children?: ReactNode }>;
    
    export type JSXElementConstructor<P> = 
      | ((props: P) => ReactElement<any, any> | null)
      | (new (props: P) => Component<any, any>);
    
    export interface Component<P = {}, S = {}> {
      props: Readonly<P>;
      state: Readonly<S>;
    }
    
    export interface MouseEvent<T = Element> {
      currentTarget: T;
      target: EventTarget & T;
      preventDefault(): void;
      stopPropagation(): void;
    }
    
    export interface ChangeEvent<T = Element> {
      target: EventTarget & T & { value: string };
      currentTarget: T;
      preventDefault(): void;
      stopPropagation(): void;
    }
    
    export interface FocusEvent<T = Element> {
      currentTarget: T;
      target: EventTarget & T;
      preventDefault(): void;
      stopPropagation(): void;
    }
    
    export interface FormEvent<T = Element> {
      currentTarget: T;
      target: EventTarget & T;
      preventDefault(): void;
      stopPropagation(): void;
    }
    
    export interface CSSProperties {
      [key: string]: any;
      width?: string | number;
      height?: string | number;
      padding?: string | number;
      margin?: string | number;
      backgroundColor?: string;
      color?: string;
      border?: string;
      borderRadius?: string | number;
      boxShadow?: string;
      display?: string;
      flexDirection?: string;
      alignItems?: string;
      justifyContent?: string;
      gap?: string | number;
      opacity?: number;
      cursor?: string;
      fontSize?: string | number;
      fontWeight?: string | number;
      lineHeight?: string | number;
      textAlign?: string;
      transform?: string;
      transition?: string;
      animation?: string;
      position?: string;
      top?: string | number;
      left?: string | number;
      right?: string | number;
      bottom?: string | number;
      zIndex?: number;
      overflow?: string;
      overflowY?: string;
      maxWidth?: string | number;
      maxHeight?: string | number;
      minWidth?: string | number;
      minHeight?: string | number;
      gridTemplateColumns?: string;
      gridColumn?: string;
      gridRow?: string;
      flex?: string | number;
      flexWrap?: string;
      flexGrow?: number;
      flexShrink?: number;
      flexBasis?: string | number;
      filter?: string;
      objectFit?: string;
      objectPosition?: string;
    }
    
    // Hooks
    export function useState<S>(initialState: S | (() => S)): [S, (value: S | ((prevState: S) => S)) => void];
    export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
    export function useRef<T>(initialValue: T): { current: T };
    
    // Additional interfaces
    export interface ButtonHTMLAttributes<T> {
      type?: 'button' | 'submit' | 'reset';
      onClick?: (event: MouseEvent<T>) => void;
      onMouseEnter?: (event: MouseEvent<T>) => void;
      onMouseLeave?: (event: MouseEvent<T>) => void;
      disabled?: boolean;
      className?: string;
      style?: CSSProperties;
      children?: ReactNode;
    }
    
    export interface InputHTMLAttributes<T> {
      type?: string;
      value?: string;
      placeholder?: string;
      onChange?: (event: ChangeEvent<T>) => void;
      onFocus?: (event: FocusEvent<T>) => void;
      onBlur?: (event: FocusEvent<T>) => void;
      disabled?: boolean;
      className?: string;
      style?: CSSProperties;
    }
    
    export interface HTMLAttributes<T> {
      className?: string;
      style?: CSSProperties;
      onClick?: (event: MouseEvent<T>) => void;
      onMouseEnter?: (event: MouseEvent<T>) => void;
      onMouseLeave?: (event: MouseEvent<T>) => void;
      children?: ReactNode;
    }
  }
}

declare module 'react-dom' {
  export function render(element: React.ReactElement, container: Element | null): void;
}

declare module 'react-dom/client' {
  export interface Root {
    render(children: React.ReactNode): void;
    unmount(): void;
  }
  
  export function createRoot(container: Element | DocumentFragment): Root;
  export function hydrateRoot(container: Element, initialChildren: React.ReactNode): Root;
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    baseURL?: string;
    withCredentials?: boolean;
    headers?: any;
    [key: string]: any;
  }
  
  export interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: AxiosRequestConfig;
  }
  
  export interface AxiosInstance {
    defaults: {
      headers: {
        common: { [key: string]: string };
        [key: string]: any;
      };
      [key: string]: any;
    };
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    [key: string]: any;
  }
  
  export function create(config?: AxiosRequestConfig): AxiosInstance;
  
  const axios: AxiosInstance & {
    create: typeof create;
  };
  
  export default axios;
}

// Vite environment variables
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_APP_TITLE?: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly hot?: {
    readonly data: any;
    accept(): void;
    accept(cb: (mod: any) => void): void;
    accept(dep: string, cb: (mod: any) => void): void;
    accept(deps: readonly string[], cb: (mods: any[]) => void): void;
    dispose(cb: (data: any) => void): void;
    decline(): void;
    invalidate(): void;
    on(event: string, cb: (...args: any[]) => void): void;
  };
}

// Vite configuration types
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
      [key: string]: any;
    };
    [key: string]: any;
  }
  
  export function defineConfig(config: UserConfig): UserConfig;
}

declare module '@vitejs/plugin-react' {
  export default function react(options?: any): any;
}

declare namespace JSX {
  interface IntrinsicElements {
    div: React.HTMLAttributes<HTMLDivElement>;
    span: React.HTMLAttributes<HTMLSpanElement>;
    button: React.ButtonHTMLAttributes<HTMLButtonElement>;
    input: React.InputHTMLAttributes<HTMLInputElement>;
    label: React.HTMLAttributes<HTMLLabelElement>;
    h1: React.HTMLAttributes<HTMLHeadingElement>;
    h2: React.HTMLAttributes<HTMLHeadingElement>;
    h3: React.HTMLAttributes<HTMLHeadingElement>;
    h4: React.HTMLAttributes<HTMLHeadingElement>;
    h5: React.HTMLAttributes<HTMLHeadingElement>;
    h6: React.HTMLAttributes<HTMLHeadingElement>;
    p: React.HTMLAttributes<HTMLParagraphElement>;
    ul: React.HTMLAttributes<HTMLUListElement>;
    li: React.HTMLAttributes<HTMLLIElement>;
    a: React.HTMLAttributes<HTMLAnchorElement>;
    img: React.HTMLAttributes<HTMLImageElement>;
    form: React.HTMLAttributes<HTMLFormElement>;
    select: React.HTMLAttributes<HTMLSelectElement>;
    option: React.HTMLAttributes<HTMLOptionElement>;
    textarea: React.HTMLAttributes<HTMLTextAreaElement>;
    i: React.HTMLAttributes<HTMLElement>;
    [elemName: string]: any;
  }
  
  interface Element extends React.ReactElement<any, any> {
    type: any;
    props: any;
    key: any;
  }
  
  type ElementType = Element | React.ReactNode;
}

// FontAwesome Types
declare module '@fortawesome/react-fontawesome' {
  export interface FontAwesomeIconProps {
    icon: any;
    size?: 'xs' | 'sm' | 'lg' | 'xl' | '2x' | '3x' | '4x' | '5x' | '6x' | '7x' | '8x' | '9x' | '10x';
    color?: string;
    className?: string;
    style?: React.CSSProperties;
    [key: string]: any;
  }
  
  export const FontAwesomeIcon: React.FC<FontAwesomeIconProps>;
}

declare module '@fortawesome/free-solid-svg-icons' {
  export const faDesktop: any;
  export const faDownload: any;
  export const faUser: any;
  export const faKey: any;
  export const faEye: any;
  export const faEyeSlash: any;
  export const faCog: any;
  export const faSignOutAlt: any;
  export const faPlus: any;
  export const faEdit: any;
  export const faTrash: any;
  export const faCheck: any;
  export const faTimes: any;
  export const faSpinner: any;
  export const faExclamationTriangle: any;
}

declare module '@fortawesome/free-brands-svg-icons' {
  export const faWindows: any;
  export const faApple: any;
  export const faLinux: any;
  export const faMicrosoft: any;
}

declare module '@fortawesome/free-regular-svg-icons' {
  export const faUser: any;
  export const faEnvelope: any;
}

declare module '@fortawesome/fontawesome-svg-core' {
  export const library: any;
  export function config(...args: any[]): any;
}
