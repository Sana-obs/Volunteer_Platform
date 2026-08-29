import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { NavLink } from "react-router-dom";
import { FIELD_LABEL, FIELD_ERROR } from "../../utils/fieldStyles";
import useClickOutside from "../../hooks/useClickOutside";

export default function Dropdown({
  label = "",
  // accessible name when there's no visible label (compact toolbars)
  ariaLabel = "",
  triggerLabel = "Select",
  items = [],
  onItemClick,
  value,
  onChange,
  placeholder = "",
  icon: Icon = null,
  error = "",
  required = false,
  as = "div",
  fullWidth = true,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const generatedLabelId = useId();
  const labelId = label ? generatedLabelId : undefined;
  const rootRef = useClickOutside(isOpen, () => setIsOpen(false));

  const handleTriggerKeyDown = (event) => {
    if (event.key === "Escape") setIsOpen(false);
  };

  // Arrow/Home/End navigation between options (listbox pattern)
  const handleMenuKeyDown = (event) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();

    // disabled items stay visible but are skipped by keyboard nav
    const options = Array.from(
      event.currentTarget.querySelectorAll('[role="option"]:not([disabled])'),
    );
    if (options.length === 0) return;

    const currentIndex = options.indexOf(document.activeElement);

    let nextIndex;
    if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = options.length - 1;
    else if (event.key === "ArrowDown") nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
    else nextIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;

    options[nextIndex].focus();
  };

  const isSelectionMode = typeof onChange === "function";
  const selectedItem = isSelectionMode
    ? items.find((i) => i.value === value)
    : null;

  const triggerText = selectedItem ? selectedItem.name : placeholder || triggerLabel;

  const handleItemClick = (item) => {
    if (isSelectionMode) {
      onChange(item.value);
    }
    onItemClick?.(item);
    setIsOpen(false);
  };

  const Root = as;

  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? "w-full" : ""}`}>
      {label && (
        <label id={labelId} className={FIELD_LABEL}>
          {label}
          {required && <span className="text-primary ml-1">*</span>}
        </label>
      )}

      <Root ref={rootRef} className={`relative ${fullWidth ? "w-full" : ""} ${className}`}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          onKeyDown={handleTriggerKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={labelId}
          aria-label={!label && ariaLabel ? ariaLabel : undefined}
          className={`flex items-center justify-between w-full gap-2
            px-4 py-3 rounded-xl bg-field
            transition-colors duration-200
            border ${error ? "border-danger" : "border-heading/10 hover:border-primary/30"}
            focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary`}
        >
          <span className="flex items-center gap-2 truncate">
            {Icon && (
              <Icon
                size={18}
                className={error ? "text-danger" : "text-primary"}
              />
            )}
            <span className={!selectedItem ? "text-body/60" : "text-heading"}>
              {triggerText}
            </span>
          </span>

          <ChevronDown
            size={16}
            className={`transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            } text-heading/40`}
          />
        </button>

        <div
          className={`absolute z-20 mt-2 w-full overflow-hidden
            transition-all duration-300 ease-out
            ${isOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0"}`}
        >
          <ul
            role="listbox"
            onKeyDown={handleMenuKeyDown}
            className="py-2 px-1 space-y-1 text-sm font-medium
              rounded-xl backdrop-blur-md bg-field/95
              border border-heading/10 shadow-lg max-h-64 overflow-y-auto"
          >
            {items.map((item) =>
              item.href ? (
                <li key={item.name} role="presentation">
                  <NavLink
                    to={item.href}
                    role="option"
                    aria-selected="false"
                    onClick={() => handleItemClick(item)}
                    className="block px-4 py-3 hover:bg-primary hover:text-white rounded-md transition-colors"
                  >
                    {item.name}
                  </NavLink>
                </li>
              ) : (
                <li key={item.value ?? item.name} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={selectedItem?.value === item.value}
                    aria-disabled={item.disabled || undefined}
                    disabled={item.disabled}
                    // hard-block selection when disabled
                    onClick={() => {
                      if (item.disabled) return;
                      handleItemClick(item);
                    }}
                    className={`w-full text-left block px-4 py-3 rounded-md transition-colors ${
                      item.disabled
                        ? "text-body/40 cursor-not-allowed"
                        : selectedItem?.value === item.value
                          ? "bg-primary/15 text-primary border border-primary/30"
                          : "hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    {item.name}
                    {item.disabled && <span className="ml-1.5 text-xs text-body/40">(Inactive)</span>}
                  </button>
                </li>
              )
            )}
          </ul>
        </div>

        {error && <p className={FIELD_ERROR}>{error}</p>}
      </Root>
    </div>
  );
}