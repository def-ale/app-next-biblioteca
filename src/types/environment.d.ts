
declare namespace NodeJS {
  interface ProcessEnv {
    readonly JWT_SECRET: string;
    readonly NEXT_PUBLIC_JWT_SECRET: string;
  }
}
