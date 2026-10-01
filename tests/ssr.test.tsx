// @vitest-environment node

import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { useFirstInteraction } from "../src/useFirstInteraction";
import { useOnFirstInteraction } from "../src/useOnFirstInteraction";

function Probe() {
  const interacted = useFirstInteraction({ timeout: 0 });
  const ran = useOnFirstInteraction(() => {
    throw new Error("must not run on the server");
  });

  return createElement("p", null, `${interacted} ${ran}`);
}

describe("on the server", () => {
  it("renders false without touching window", () => {
    expect(typeof window).toBe("undefined");
    expect(renderToString(createElement(Probe))).toBe("<p>false false</p>");
  });
});
