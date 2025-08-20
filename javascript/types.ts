import type { html } from "hono/html";

export type WriteBufferElement = string | ReturnType<typeof html>;
export type WriteBuffer = WriteBufferElement[];
