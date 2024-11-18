// types/global.d.ts
declare namespace NodeJS {
    interface ProcessEnv {
      PRIVATE_KEY: string;
      PRIVATE_KEY_C1: string;
      TOKEN_MINT_ADDRESS: string;
      URL: string;
      NODE_ENV?: 'development' | 'production';
    }
  }
  