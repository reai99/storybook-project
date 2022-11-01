import React, { useCallback, useMemo, useRef, useState } from 'react';

export const useDrop = (opts) => {
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const [hoverProp, setHoverProp] = useState('');

  const dropProps = useMemo(
    () => ({
      onDrop: (e) => {
        e.preventDefault();
        e.persist();
        if (optsRef.current.handleDrop) {
          optsRef.current.handleDrop(
            e.dataTransfer.getData('dragProp'),
            e.currentTarget.dataset.prop || '',
          );
        }
      },
      onDragEnter: (e) => {
        e.preventDefault();
        setHoverProp(e.currentTarget.dataset.prop || '');
      },
      onDragLeave: () => {
        setHoverProp('');
      },
      onDragOver: (e) => {
        e.preventDefault();
      },
    }),
    [optsRef, setHoverProp],
  );

  return { dropProps, hoverProp, setHoverProp };
};

export const useDrag = (opts) => {
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const getDragProps = useCallback(
    (prop) => {
      return {
        draggable: true,
        onDragStart: (e) => {
          optsRef.current.handleDrag && optsRef.current.handleDrag(prop);
          e.dataTransfer.setData('dragProp', prop);
        },
      };
    },
    [optsRef],
  );

  return getDragProps;
};
