// deps.ts - Dependencias centralizadas
export { Application, Router, Context, send } from "https://deno.land/x/oak@v12.6.1/mod.ts";
export { validate, required, isString, isNumber, isEmail, lengthBetween } from "https://deno.land/x/validasaur@v0.15.0/mod.ts";
export { create, verify } from "https://deno.land/x/djwt@v2.9.1/mod.ts";
export { hash, compare } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
export { Client } from "https://deno.land/x/mysql@v2.11.0/mod.ts";

// Tipos útiles
export type { RouterContext } from "https://deno.land/x/oak@v12.6.1/mod.ts";
