import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NiarProvider } from "../../theme/NiarProvider";
import { PageIntro } from "./PageIntro";
describe("PageIntro", () => { it("renderiza título e descrição", () => { render(<NiarProvider><PageIntro title="Projetos" description="Descrição" /></NiarProvider>); expect(screen.getByRole("heading", { name: "Projetos" })).toBeTruthy(); expect(screen.getByText("Descrição")).toBeTruthy(); }); });
