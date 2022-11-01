
import { useCallback, useRef } from 'react';

export default function useResize({
  tableRef,
  colResizeProxyRef,
  onResizeStop,
}) {

  const isDraggingRef = useRef(false);
  const draggingColRef = useRef(''); 
  const draggingTypeRef = useRef('col');
  const startPosRef = useRef(0);

  const handleResizeStart = useCallback(
    (e) => {
      if (!tableRef.current || !colResizeProxyRef.current) return;
      if (draggingTypeRef.current === 'col') {
        const movedDistance = e.clientX - tableRef.current.getBoundingClientRect().left;
        colResizeProxyRef.current.style.left = movedDistance + 'px';
        document.body.style.cursor = 'col-resize';
      }
    },
    [colResizeProxyRef, tableRef],
  );

  const handleResizeStop = useCallback(
    (e) => {
      if (colResizeProxyRef && colResizeProxyRef.current) {
        colResizeProxyRef.current.style.visibility = 'hidden';
      }

      document.body.style.cursor = '';
      document.removeEventListener('mousemove', handleResizeStart);
      document.removeEventListener('mouseup', handleResizeStop);
      isDraggingRef.current = false;
      document.onselectstart = null;
      document.ondragstart = null;
      const offsetX = e.clientX - startPosRef.current;
      const offsetY = e.clientY - startPosRef.current;
      onResizeStop &&
      onResizeStop(
        draggingTypeRef.current === 'col' ? offsetX : offsetY,
        draggingColRef.current,
        draggingTypeRef.current,
      );
    },
    [colResizeProxyRef, onResizeStop, handleResizeStart],
  );

  const handleMouseMove = useCallback((e) => {
    if (isDraggingRef.current) return;
    const currHeader = e.currentTarget;
    const rect = currHeader.getBoundingClientRect();
    const bodyStyle = document.body.style;
    const cha = rect.right - e.pageX;
    if ( cha < 5 && colResizeProxyRef) {
      bodyStyle.cursor = 'col-resize';
      draggingTypeRef.current = 'col';
      draggingColRef.current = currHeader.dataset.prop;
    } else {
      bodyStyle.cursor = '';
      draggingColRef.current = '';
    }
  }, [colResizeProxyRef]);

  const handleMouseDown = useCallback((e) => {
    if (!draggingColRef.current || !tableRef?.current || !colResizeProxyRef?.current) return;
    isDraggingRef.current = true;
    const currTarget = e.currentTarget;
    if (draggingTypeRef.current === 'col') {
      const container = tableRef.current.getBoundingClientRect();
      const startPos = currTarget.getBoundingClientRect().right - container.left;
      colResizeProxyRef.current.style.visibility = 'visible';
      colResizeProxyRef.current.style.left = startPos + 'px';
      startPosRef.current = currTarget.getBoundingClientRect().right;
    }
    document.onselectstart = () => false;
    document.ondragstart = () => false;
    document.addEventListener('mousemove', handleResizeStart);
    document.addEventListener('mouseup', handleResizeStop);

  }, [tableRef, colResizeProxyRef, handleResizeStart, handleResizeStop ]);

  const handleMouseOut = useCallback((e) => {
    document.body.style.cursor = '';
  }, []);

  return {
    handleMouseMove,
    handleMouseOut,
    handleMouseDown,
  }
}