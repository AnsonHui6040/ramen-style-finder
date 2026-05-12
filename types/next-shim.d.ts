declare module "next" {
  export type Metadata = {
    title?: string;
    description?: string;
  };
}

declare module "next/link" {
  import * as React from "react";
  const Link: React.ComponentType<any>;
  export default Link;
}

declare module "next/navigation" {
  export function notFound(): never;
  export function useSearchParams(): URLSearchParams;
  export function useRouter(): {
    push(href: string): void;
    replace(href: string): void;
    back(): void;
    forward(): void;
    refresh(): void;
    prefetch(href: string): void;
  };
  export function usePathname(): string;
  export function useParams<T extends Record<string, string | string[]> = Record<string, string | string[]>>(): T;
  export function redirect(url: string): never;
  export function permanentRedirect(url: string): never;
}
