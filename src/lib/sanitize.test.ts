import { describe, it, expect } from "vitest";
import { sanitizeText } from "@/lib/sanitize";

describe("sanitizeText", () => {
  it("remove tags de script", () => {
    expect(sanitizeText('<script>alert("xss")</script>Mercado')).toBe("Mercado");
  });

  it("remove tags HTML mas preserva o texto", () => {
    expect(sanitizeText("<b>Aluguel</b> de casa")).toBe("Aluguel de casa");
  });

  it("remove atributos de evento inline", () => {
    expect(sanitizeText('<img src=x onerror="alert(1)">Nota fiscal')).toBe("Nota fiscal");
  });

  it("mantém texto simples inalterado (além do trim)", () => {
    expect(sanitizeText("Supermercado Extra")).toBe("Supermercado Extra");
  });

  it("remove espaços em branco nas extremidades", () => {
    expect(sanitizeText("   Farmácia   ")).toBe("Farmácia");
  });
});
