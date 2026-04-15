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
}
