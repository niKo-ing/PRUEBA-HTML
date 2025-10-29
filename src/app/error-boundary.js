import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";
export default function ErrorBoundary() {
    const err = useRouteError();
    if (isRouteErrorResponse(err)) {
        return (_jsxs("div", { className: "container py-5", children: [_jsxs("h1", { className: "h3", children: ["Error ", err.status] }), _jsx("p", { className: "text-body-secondary", children: err.statusText })] }));
    }
    return (_jsxs("div", { className: "container py-5", children: [_jsx("h1", { className: "h3", children: "Algo sali\u00F3 mal" }), _jsx("pre", { className: "small text-body-secondary", children: String(err?.message ?? err) })] }));
}
