import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { reset } from "../src/store";

/* The first interaction is recorded once for the whole module, so every test
   has to unmount what it rendered and start from a page nobody has touched. */
afterEach(() => {
  cleanup();

  if (typeof window !== "undefined") reset();
});
