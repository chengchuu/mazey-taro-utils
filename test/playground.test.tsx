/** @jest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import { App } from "../examples/App";

function api() {
  return {
    getEnv: jest.fn(() => "h5"),
    getWindowSize: jest.fn(() => ({
      width: 390,
      height: 844,
      ratio: 390 / 844,
      hwRatio: 844 / 390,
    })),
    isH5: jest.fn(() => true),
    isMiniProgram: jest.fn(() => false),
    quickNavigateTo: jest.fn(),
    quickRedirectTo: jest.fn(),
    quickScrollTo: jest.fn(),
    quickToast: jest.fn(),
  };
}

afterEach(cleanup);

test("renders environment output and keyboard-accessible controls", async () => {
  const user = userEvent.setup();
  render(<App api={api()} />);

  expect(screen.getByText("h5")).not.toBeNull();
  expect(screen.getByText("390 × 844")).not.toBeNull();

  await user.tab();
  expect(document.activeElement).toBe(
    screen.getByRole("textbox", { name: "Taro page directory" }),
  );
});

test("calls public navigation and toast helpers with controlled values", async () => {
  const user = userEvent.setup();
  const publicApi = api();
  render(<App api={publicApi} />);

  await user.clear(
    screen.getByRole("textbox", { name: "Taro page directory" }),
  );
  await user.type(
    screen.getByRole("textbox", { name: "Taro page directory" }),
    "settings",
  );
  await user.click(screen.getByRole("button", { name: "Run quickNavigateTo" }));

  expect(publicApi.quickNavigateTo).toHaveBeenCalledWith("settings", {
    params: { userId: "42" },
  });

  await user.click(screen.getByRole("button", { name: "Run quickToast" }));
  expect(publicApi.quickToast).toHaveBeenCalledWith("Hello from Taro");
});

test("reports invalid page and toast values accessibly", async () => {
  const user = userEvent.setup();
  render(<App api={api()} />);

  await user.clear(
    screen.getByRole("textbox", { name: "Taro page directory" }),
  );
  await user.click(screen.getByRole("button", { name: "Run quickNavigateTo" }));
  expect(screen.getByRole("alert").textContent).toMatch(
    /Enter a page directory/,
  );

  await user.clear(screen.getByRole("textbox", { name: "Toast message" }));
  await user.click(screen.getByRole("button", { name: "Run quickToast" }));
  expect(screen.getByRole("alert").textContent).toMatch(
    /Enter a toast message/,
  );
});

test("reports scroll adapter failures accessibly", async () => {
  const user = userEvent.setup();
  const publicApi = api();
  publicApi.quickScrollTo.mockImplementation(() => {
    throw new Error("Scroll unavailable");
  });
  render(<App api={publicApi} />);

  await user.click(screen.getByRole("button", { name: "Run quickScrollTo" }));

  expect(screen.getByRole("alert").textContent).toBe("Scroll unavailable");
});
