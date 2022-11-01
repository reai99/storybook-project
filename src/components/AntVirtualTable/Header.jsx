import React, { useMemo, useContext } from "react";
import classNames from "classnames";
import { dealStickyOffset } from "./utils";
import useResize from "./hooks/useResize";
import { useDrag, useDrop } from "./hooks/useDragAndDrop";
import { VirtualTableContext } from './index';

const HeaderCell = ({
  column,
  offset,
  index,
  resizeProps,
  enableSorting,
  onDropStop,
  gridResizeConfig,
}) => {
  const isFixedColum = column.fixed === "left" || column.fixed === "right";
  const resizeOffset = gridResizeConfig.current.offsetWidth[column.dataIndex] || 0;

  const getDragProps = useDrag({
    handleDrag: () => {},
  });

  const { dropProps, hoverProp, setHoverProp } = useDrop({
    handleDrop: (dragProp, dropProp) => {
      if (dragProp !== dropProp) {
        onDropStop && onDropStop(dragProp, dropProp);
      }
      setHoverProp("");
    },
  });

  const sortingProps = useMemo(
    () =>
      enableSorting
        ? {
            ...getDragProps(index + ""),
            ...dropProps,
          }
        : {},
    [enableSorting, index, getDragProps, dropProps]
  );
  
  const style = {
    width: column.width + resizeOffset,
  };

  if (column.fixed === "left") {
    style.left = offset + "px";
  }

  if (column.fixed === "right") {
    style.right = offset + "px";
  }
  return (
    <div
      key={column.key || column.dataIndex || index}
      className={classNames("virtual-table-cell virtual-table-header-cell", {
        "table-sticky-cell": isFixedColum,
      })}
      data-prop={index}
      style={{
        ...style,
        outline:
          hoverProp === index + "" && !isFixedColum
            ? "2px dashed #bbb"
            : "none",
        outlineOffset: -2,
      }}
      {...(isFixedColum ? {} : sortingProps)}
      {...resizeProps}
    >
    {column.title}
    </div>
  );
};

const Header = React.forwardRef(({ onResizeStop, onDropStop }, ref) => {
    const {
      columns = [],
      tableRef,
      colResizeProxyRef,
      enableResize,
      enableSorting,
      stickyLeftIndices,
      stickyRightIndices,
      gridResizeConfig,
    } = useContext(VirtualTableContext)

    // 调整列宽
    const { handleMouseMove, handleMouseOut, handleMouseDown } = useResize({
      tableRef,
      colResizeProxyRef,
      onResizeStop,
    });
    const resizeProps = useMemo(
      () =>
        enableResize
          ? {
              onMouseMove: handleMouseMove,
              onMouseOut: handleMouseOut,
              onMouseDown: handleMouseDown,
            }
          : {},
      [enableResize, handleMouseMove, handleMouseOut, handleMouseDown]
    );

    const commonConfig = { left: dealStickyOffset(stickyLeftIndices, columns), right: dealStickyOffset(stickyRightIndices, columns) };

    return (
      <div className="virtual-table-header" ref={ref}>
        {columns.map((v, index) => {
          const offset = v.fixed === 'left' ? commonConfig.left.shift() : ( v.fixed === 'right' ? commonConfig.right.pop() : 0) 
          const props = {
            key: v.dataIndex || index,
            column: v,
            offset,
            colResizeProxyRef,
            enableSorting,
            resizeProps,
            index,
            onDropStop,
            gridResizeConfig,
          };
          return <HeaderCell {...props}/>;
        })}
      </div>
    );
  }
);

export default Header;
