export function portal(node: HTMLElement, target: HTMLElement | string = 'body') {
  let targetEl: HTMLElement | null;
  
  if (typeof target === 'string') {
    targetEl = document.querySelector(target);
    if (!targetEl) {
      targetEl = document.body;
    }
  } else {
    targetEl = target;
  }
  
  targetEl.appendChild(node);
  
  return {
    destroy() {
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    }
  };
}
