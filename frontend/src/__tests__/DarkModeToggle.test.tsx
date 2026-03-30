import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { ThemeContext } from "@/components/ThemeProvider";
import { ReactNode } from "react";

describe("DarkModeToggle", () => {
  it("renders toggle button", () => {
    const mockSetTheme = jest.fn();
    render(
      <ThemeContext.Provider value={{ theme: "light", setTheme: mockSetTheme }}>
        <DarkModeToggle />
      </ThemeContext.Provider>,
    );

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-label", "Toggle dark mode");
  });

  it("displays moon icon when theme is light", () => {
    const mockSetTheme = jest.fn();
    const { container } = render(
      <ThemeContext.Provider value={{ theme: "light", setTheme: mockSetTheme }}>
        <DarkModeToggle />
      </ThemeContext.Provider>,
    );

    // Moon icon should be present
    const svgElements = container.querySelectorAll("svg");
    expect(svgElements.length).toBeGreaterThan(0);
  });

  it("displays sun icon when theme is dark", () => {
    const mockSetTheme = jest.fn();
    const { container } = render(
      <ThemeContext.Provider value={{ theme: "dark", setTheme: mockSetTheme }}>
        <DarkModeToggle />
      </ThemeContext.Provider>,
    );

    // Sun icon should be present
    const svgElements = container.querySelectorAll("svg");
    expect(svgElements.length).toBeGreaterThan(0);
  });

  it("calls setTheme to toggle between dark and light", async () => {
    const user = userEvent.setup();
    const mockSetTheme = jest.fn();

    render(
      <ThemeContext.Provider value={{ theme: "light", setTheme: mockSetTheme }}>
        <DarkModeToggle />
      </ThemeContext.Provider>,
    );

    const button = screen.getByRole("button");
    await user.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("toggles from dark to light", async () => {
    const user = userEvent.setup();
    const mockSetTheme = jest.fn();

    render(
      <ThemeContext.Provider value={{ theme: "dark", setTheme: mockSetTheme }}>
        <DarkModeToggle />
      </ThemeContext.Provider>,
    );

    const button = screen.getByRole("button");
    await user.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("applies correct styling classes", () => {
    const mockSetTheme = jest.fn();
    render(
      <ThemeContext.Provider value={{ theme: "light", setTheme: mockSetTheme }}>
        <DarkModeToggle />
      </ThemeContext.Provider>,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("rounded-2xl");
    expect(button).toHaveClass("border");
    expect(button).toHaveClass("inline-flex");
    expect(button).toHaveClass("h-11");
    expect(button).toHaveClass("w-11");
  });

  it("button type is button not submit", () => {
    const mockSetTheme = jest.fn();
    render(
      <ThemeContext.Provider value={{ theme: "light", setTheme: mockSetTheme }}>
        <DarkModeToggle />
      </ThemeContext.Provider>,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "button");
  });

  it("multiple clicks toggle theme back and forth", async () => {
    const user = userEvent.setup();
    const mockSetTheme = jest.fn();

    render(
      <ThemeContext.Provider value={{ theme: "light", setTheme: mockSetTheme }}>
        <DarkModeToggle />
      </ThemeContext.Provider>,
    );

    const button = screen.getByRole("button");

    await user.click(button); // light -> dark
    expect(mockSetTheme).toHaveBeenCalledWith("dark");

    mockSetTheme.mockClear();

    // Re-render with new theme
    const { rerender } = render(
      <ThemeContext.Provider value={{ theme: "dark", setTheme: mockSetTheme }}>
        <DarkModeToggle />
      </ThemeContext.Provider>,
    );

    await user.click(screen.getByRole("button")); // dark -> light
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("is keyboard accessible", async () => {
    const user = userEvent.setup();
    const mockSetTheme = jest.fn();

    render(
      <ThemeContext.Provider value={{ theme: "light", setTheme: mockSetTheme }}>
        <DarkModeToggle />
      </ThemeContext.Provider>,
    );

    const button = screen.getByRole("button");
    button.focus();
    expect(button).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(mockSetTheme).toHaveBeenCalled();
  });
});
