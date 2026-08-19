import { describe, expect, it } from "vitest";

import { translate } from "../src/localization";

describe("card localization", () => {
  it("provides the publication-facing strip and editor labels", () => {
    expect(translate("en", "recentEyebrow")).toBe("Recent");
    expect(translate("pt-BR", "recentEyebrow")).toBe("Recentes");
    expect(translate("en", "upcomingEyebrow")).toBe("Upcoming");
    expect(translate("pt-BR", "upcomingEyebrow")).toBe("Em breve");
    expect(translate("pt-BR", "appearanceLight")).toBe("Claro");
    expect(translate("pt-BR", "autoScrollInterval")).toBe("Intervalo da rolagem (segundos)");
  });
});
