// Lightweight, dependency-free "material style" click ripple effect.
// Usage: add className `ripple-parent` (position:relative; overflow:hidden)
// to any clickable element, then onMouseDown={createRipple}.
export function createRipple(event) {
  const target = event.currentTarget;
  if (!target) return;

  const rect = target.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  const ripple = document.createElement("span");
  ripple.className = "ripple-effect";
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;

  target.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove());
}

// Shared CSS string components can inject via a <style> tag.
export const rippleCSS = `
  .ripple-parent { position: relative; overflow: hidden; }
  .ripple-effect {
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,0.45);
    transform: scale(0);
    animation: rippleAnim 0.6s ease-out;
    pointer-events: none;
    z-index: 5;
  }
  @keyframes rippleAnim {
    to { transform: scale(2.8); opacity: 0; }
  }
`;
