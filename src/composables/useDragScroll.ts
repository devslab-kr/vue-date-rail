import type { Ref } from 'vue';

/**
 * 데스크톱 입력 지원: 세로 휠 → 가로 스크롤 변환 + 마우스 드래그 스크롤.
 * 터치는 브라우저 네이티브 스크롤에 맡기고 마우스 포인터만 처리한다.
 * 드래그 후 발생하는 click은 capture 단계에서 삼켜 셀이 오선택되지 않게 한다.
 */
export function useDragScroll(containerRef: Ref<HTMLElement | null>) {
  let dragging = false;
  let dragged = false;
  let startX = 0;
  let startScrollLeft = 0;

  const onWheel = (event: WheelEvent) => {
    const el = containerRef.value;
    if (!el) return;
    // 트랙패드 가로 제스처(deltaX 우세)는 네이티브에 맡긴다
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();
    el.scrollLeft += event.deltaY;
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    const el = containerRef.value;
    if (!el) return;
    dragging = true;
    dragged = false;
    startX = event.clientX;
    startScrollLeft = el.scrollLeft;
    try {
      el.setPointerCapture?.(event.pointerId);
    } catch {
      // 비활성 pointerId(합성 이벤트 등)면 캡처 없이 진행
    }
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!dragging) return;
    const el = containerRef.value;
    if (!el) return;
    const dx = event.clientX - startX;
    if (Math.abs(dx) > 4) dragged = true;
    if (dragged) {
      el.scrollLeft = startScrollLeft - dx;
    }
  };

  const onPointerUp = () => {
    dragging = false;
  };

  const onClickCapture = (event: MouseEvent) => {
    if (!dragged) return;
    // 드래그 직후의 click은 선택이 아니라 스크롤 종료다
    event.preventDefault();
    event.stopPropagation();
    dragged = false;
  };

  return { onWheel, onPointerDown, onPointerMove, onPointerUp, onClickCapture };
}
