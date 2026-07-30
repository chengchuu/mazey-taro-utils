import { FormEvent, useEffect, useMemo, useState } from "react";

interface WindowSize {
  width: number;
  height: number;
  ratio: number;
  hwRatio: number;
}

interface PlaygroundApi {
  getEnv(): string;
  getWindowSize(): WindowSize;
  isH5(): boolean;
  isMiniProgram(): boolean;
  quickNavigateTo(
    page: string,
    options?: { params?: Record<string, string> },
  ): void;
  quickRedirectTo(
    page: string,
    options?: { params?: Record<string, string> },
  ): void;
  quickScrollTo(selector: string, duration?: number): void;
  quickToast(message: string): void;
}

interface TaroActionDetail {
  method: string;
  payload: unknown;
}

export interface AppProps {
  api: PlaygroundApi;
}

const taroActionEvent = "mazey-taro-utils:taro-action";

function actionText(detail: TaroActionDetail): string {
  return `${detail.method}: ${JSON.stringify(detail.payload, null, 2)}`;
}

export function App({ api }: AppProps) {
  const [page, setPage] = useState("profile");
  const [parameterName, setParameterName] = useState("userId");
  const [parameterValue, setParameterValue] = useState("42");
  const [toastMessage, setToastMessage] = useState("Hello from Taro");
  const [error, setError] = useState("");
  const [result, setResult] = useState(
    "Choose an action to inspect the Taro request.",
  );

  useEffect(() => {
    const handleAction = (event: Event) => {
      const detail = (event as CustomEvent<TaroActionDetail>).detail;
      setResult(actionText(detail));
    };
    window.addEventListener(taroActionEvent, handleAction);
    return () => window.removeEventListener(taroActionEvent, handleAction);
  }, []);

  const environment = useMemo(() => {
    try {
      const size = api.getWindowSize();
      return {
        env: api.getEnv() || "unspecified",
        h5: api.isH5(),
        miniProgram: api.isMiniProgram(),
        size: `${size.width} × ${size.height}`,
      };
    } catch (caught) {
      return {
        env: "unavailable",
        h5: false,
        miniProgram: false,
        size: caught instanceof Error ? caught.message : "Unknown error",
      };
    }
  }, [api]);

  const params = parameterName.trim()
    ? { [parameterName.trim()]: parameterValue }
    : {};

  const runNavigation = (
    event: FormEvent,
    navigate: PlaygroundApi["quickNavigateTo"],
  ) => {
    event.preventDefault();
    const normalizedPage = page.trim().replace(/^\/+|\/+$/g, "");
    if (!normalizedPage) {
      setError("Enter a page directory name before running navigation.");
      return;
    }
    setError("");
    try {
      navigate(normalizedPage, { params });
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Navigation request failed.",
      );
    }
  };

  const runToast = () => {
    if (!toastMessage.trim()) {
      setError("Enter a toast message before showing it.");
      return;
    }
    setError("");
    try {
      api.quickToast(toastMessage);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Toast request failed.",
      );
    }
  };

  const runScroll = () => {
    setError("");
    try {
      api.quickScrollTo("#playground-title", 300);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Scroll request failed.",
      );
    }
  };

  return (
    <div className="row g-4 align-items-start">
      <section className="col-lg-7" aria-labelledby="controls-title">
        <div className="playground-panel p-4">
          <h2 id="controls-title" className="h4">
            Public API controls
          </h2>
          <form
            className="row g-3"
            onSubmit={(event) => runNavigation(event, api.quickNavigateTo)}
          >
            <div className="col-12">
              <label className="form-label" htmlFor="page-name">
                Taro page directory
              </label>
              <input
                id="page-name"
                className="form-control"
                value={page}
                onChange={(event) => setPage(event.target.value)}
              />
              <div className="form-text">
                The helper produces a route below <code>/pages</code>.
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="parameter-name">
                Parameter name
              </label>
              <input
                id="parameter-name"
                className="form-control"
                value={parameterName}
                onChange={(event) => setParameterName(event.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="parameter-value">
                Parameter value
              </label>
              <input
                id="parameter-value"
                className="form-control"
                value={parameterValue}
                onChange={(event) => setParameterValue(event.target.value)}
              />
            </div>
            <div className="col-12 d-flex flex-wrap gap-2">
              <button className="btn btn-primary" type="submit">
                Run quickNavigateTo
              </button>
              <button
                className="btn btn-outline-primary"
                type="button"
                onClick={(event) => runNavigation(event, api.quickRedirectTo)}
              >
                Run quickRedirectTo
              </button>
            </div>
          </form>

          <hr className="my-4" />

          <div className="row g-3 align-items-end">
            <div className="col-md-8">
              <label className="form-label" htmlFor="toast-message">
                Toast message
              </label>
              <input
                id="toast-message"
                className="form-control"
                value={toastMessage}
                onChange={(event) => setToastMessage(event.target.value)}
              />
            </div>
            <div className="col-md-4">
              <button
                className="btn btn-outline-primary w-100"
                type="button"
                onClick={runToast}
              >
                Run quickToast
              </button>
            </div>
            <div className="col-12">
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={runScroll}
              >
                Run quickScrollTo
              </button>
            </div>
          </div>

          {error ? (
            <p className="alert alert-danger mt-3 mb-0" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </section>

      <section className="col-lg-5" aria-labelledby="output-title">
        <div className="playground-panel p-4">
          <h2 id="output-title" className="h4">
            Controlled Taro output
          </h2>
          <pre
            className="playground-output"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <code>{result}</code>
          </pre>
          <dl className="row mb-0">
            <dt className="col-6">Taro environment</dt>
            <dd className="col-6">{environment.env}</dd>
            <dt className="col-6">isH5()</dt>
            <dd className="col-6">{String(environment.h5)}</dd>
            <dt className="col-6">isMiniProgram()</dt>
            <dd className="col-6">{String(environment.miniProgram)}</dd>
            <dt className="col-6">getWindowSize()</dt>
            <dd className="col-6">{environment.size}</dd>
          </dl>
        </div>
      </section>
    </div>
  );
}
