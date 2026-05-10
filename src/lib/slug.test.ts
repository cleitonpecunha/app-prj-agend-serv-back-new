import { generateSlug } from "./slug";

describe("generateSlug", () => {
  it("deve converter texto simples para minúsculas", () => {
    expect(generateSlug("Barbearia")).toBe("barbearia");
  });

  it("deve substituir espaços por hífens", () => {
    expect(generateSlug("Barbearia do João")).toBe("barbearia-do-joao");
  });

  it("deve remover acentos e cedilha", () => {
    expect(generateSlug("Ação de Graças")).toBe("acao-de-gracas");
  });

  it("deve remover caracteres especiais mantendo letras e números", () => {
    expect(generateSlug("Café & Cia")).toBe("cafe-cia");
  });

  it("deve colapsar múltiplos hífens em um único", () => {
    expect(generateSlug("Empresa -- Extra")).toBe("empresa-extra");
  });

  it("deve remover espaços extras nas bordas e no meio", () => {
    expect(generateSlug("  Empresa  Teste  ")).toBe("empresa-teste");
  });

  it("deve remover hífens nas bordas da string", () => {
    expect(generateSlug("-Empresa-")).toBe("empresa");
  });

  it("deve retornar string vazia para entrada vazia", () => {
    expect(generateSlug("")).toBe("");
  });

  it("deve preservar números no slug", () => {
    expect(generateSlug("Studio 2B")).toBe("studio-2b");
  });

  it("deve ser determinístico para a mesma entrada", () => {
    const text = "Studio Beleza Maria";
    expect(generateSlug(text)).toBe(generateSlug(text));
  });

  it("deve normalizar caixa-alta corretamente", () => {
    expect(generateSlug("LIMA ELÉTRICA")).toBe("lima-eletrica");
  });
});
