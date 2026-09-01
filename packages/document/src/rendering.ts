import type { SlideElement } from './schema';

export function sortElementsForRender(elements: SlideElement[]) {
  return [...elements].sort((left, right) => left.zIndex - right.zIndex);
}

export function elementTransform(element: SlideElement) {
  return {
    position: 'absolute' as const,
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    opacity: element.visible ? element.opacity : 0,
    transform: element.rotation === 0 ? undefined : `rotate(${element.rotation}deg)`,
    transformOrigin: 'center',
    zIndex: element.zIndex,
    pointerEvents: element.locked ? ('none' as const) : undefined,
  };
}
