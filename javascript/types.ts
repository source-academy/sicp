import type { html } from "hono/html";

type WriteBufferElement = string | ReturnType<typeof html>;
export type WriteBuffer = WriteBufferElement[];
