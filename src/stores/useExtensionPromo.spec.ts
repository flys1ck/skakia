import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { useExtensionPromo } from "./useExtensionPromo";

beforeEach(() => setActivePinia(createPinia()));

describe("useExtensionPromo", () => {
  it("shows the banner until the user acts", () => {
    expect(useExtensionPromo().isBannerVisible).toBe(true);
  });

  it("hides the banner once it is dismissed", () => {
    const extensionPromo = useExtensionPromo();
    extensionPromo.isDismissed = true;

    expect(extensionPromo.isBannerVisible).toBe(false);
  });

  it("hides the banner once a game link from the extension was opened", () => {
    const extensionPromo = useExtensionPromo();
    extensionPromo.hasOpenedGameLink = true;

    expect(extensionPromo.isBannerVisible).toBe(false);
  });
});
