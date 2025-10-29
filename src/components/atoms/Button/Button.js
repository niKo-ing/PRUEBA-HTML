import { jsx as _jsx } from "react/jsx-runtime";
export default function Button({ label, onClick }) {
    return _jsx("button", { onClick: onClick, children: label });
}
