import React, {
  forwardRef,
  useMemo,
  useCallback,
  useEffect,
  useContext,
} from "react";
import classNames from "classnames";
import { VariableSizeGrid as Grid } from "react-window";
import { VirtualTableContext } from "./index";
import { dealStickyOffset } from './utils';

const VirtualTable = forwardRef(({ gridRef }, ref) => {
  const {
    rawData,
    columns,
    tableWidth,
    rowHeight,
    totalHeight,
    scroll,
    gridKeyRef,
    tableRef,
    gridHeaderRef,
    tableScrollOffset,
    stickyLeftIndices,
    stickyRightIndices,
    gridResizeConfig,
  } = useContext(VirtualTableContext);

  useEffect(() => {
    const isScroll = getGridScrollPercentage(0).isScroll;
    if (isScroll) {
      const container = tableRef.current;
      container.classList.add("table-fix-right-bar");
    }
  });

  const containerHeight = useMemo(
    () => (totalHeight < scroll.y ? totalHeight + 10 : scroll.y),
    [totalHeight, scroll]
  );

  const getColumnWidth = useCallback(
    (index, totalHeight) => {
      const { width, dataIndex } = columns[index];
      const resizeOffset = gridResizeConfig.current.offsetWidth[dataIndex] || 0;

      return totalHeight > scroll.y && (index === columns.length - 1)
        ? width + resizeOffset - 10
        : width + resizeOffset;
    },
    [scroll, columns, gridResizeConfig]
  );

  // 获取行高
  const getRowHeight = useCallback(
    (rowIndex) => {
      return rowHeight;
    },
    [rowHeight]
  );

  // 滚动位置计算
  const getGridScrollPercentage = (scrollLeft) => {
    const gridDom = gridRef.current._outerRef;
    const gridRect = gridDom.getBoundingClientRect();
    const gridChildRect = gridDom.firstChild?.getBoundingClientRect();
    return {
      percent: Number(
        (scrollLeft / (gridChildRect.width - gridRect.width)).toFixed(2)
      ),
      isScroll: gridChildRect.width - gridRect.width > 0,
    };
  };

  // 获取每一个列表项
  const generateFieldItem = ({
    record,
    props,
    columnProps,
    columnIndex,
    rowIndex,
  }) => {
    const key = columnProps.dataIndex || columnProps.key;
    return (
      <div key={key} {...props}>
        {columnProps.render
          ? columnProps.render(record[key], record, rowIndex, columnIndex)
          : record[key]}
      </div>
    );
  };

  // 固定列渲染
  const renderStickyCells = ({
    stickyIndices = [],
    record,
    rowIndex,
    fixed,
  }) => {

    let offestArr = dealStickyOffset(stickyIndices, columns, true);
    return stickyIndices.map((key, index) => {
      const columnProps = columns[key];
      const columnWidth = getColumnWidth(key, totalHeight);
      const props = {
        className: classNames("virtual-table-body-cell table-sticky-cell", {
          "stick-item-left-last":
            fixed === "left" && stickyIndices.length - 1 === index,
          "stick-item-right-last": fixed === "right" && index === 0,
          "virtual-table-data-last": rowIndex === rawData.length - 1,
        }),
        style: {
          left:
            fixed === "left"
              ? offestArr[index]
              : `calc(100% - ${offestArr[stickyIndices.length - index - 1] + columnWidth}px)`,
          width: columnWidth,
        },
      };
      return generateFieldItem({ record, props, columnProps });
    });
  };

  // 滚动列渲染
  const renderStaticCells = (dataList = []) => {
    return dataList.map((arr, index) => {
      return (arr || []).map(
        ({ props: { columnIndex, rowIndex, style } }) => {
          if (
            stickyLeftIndices.includes(columnIndex) ||
            stickyRightIndices.includes(columnIndex)
          ) {
            return null;
          }
          const columnProps = columns[columnIndex];
          const record = rawData[rowIndex];
          const _props = {
            className: classNames(
              "virtual-table-cell virtual-table-body-cell",
              {
                "virtual-table-cell-last": columnIndex === columns.length - 1,
                "virtual-table-data-last": rowIndex === rawData.length - 1,
              }
            ),
            style: {
              ...style,
              height: getRowHeight(rowIndex),
            },
          };
          return generateFieldItem({
            record,
            props: _props,
            columnProps,
            columnIndex,
            rowIndex,
          });
        }
      );
    });
  };

  // 表格渲染前回调
  const innerElementType = forwardRef(({ children, ...rest }, ref) => {
    const nowRenderRowItems = [
      ...new Set((children || []).map((v) => v.props.rowIndex)),
    ];

    const staticRenderRowItems = Object.values(
      (children || []).reduce((a, b) => {
        if (a[b.props.rowIndex]) {
          a[b.props.rowIndex].push(b);
        } else {
          a[b.props.rowIndex] = [b];
        }
        return a;
      }, {})
    );

    return (
      <div ref={ref} {...rest}>
        {nowRenderRowItems.map((rowIndex) => {
          const record = rawData[rowIndex];
          const rowIndexHeight = getRowHeight(rowIndex);
          return (
            <div
              key={rowIndex}
              className="table-sticky-contianer"
              style={{
                height: rowIndexHeight + "px",
                top: nowRenderRowItems[0] * rowIndexHeight + "px",
              }}
            >
              {renderStickyCells({
                stickyIndices: stickyLeftIndices,
                record,
                rowIndex,
                fixed: "left",
                totalHeight,
              })}
              {renderStickyCells({
                stickyIndices: stickyRightIndices,
                record,
                rowIndex,
                fixed: "right",
                totalHeight,
              })}
            </div>
          );
        })}
        {renderStaticCells(staticRenderRowItems)}
      </div>
    );
  });

  const $props = {
    key: gridKeyRef.current,
    ref: gridRef,
    className: "virtual-grid",
    initialScrollLeft: tableScrollOffset.left,
    initialScrollTop: tableScrollOffset.top,
    columnCount: columns.length,
    columnWidth: (index) => getColumnWidth(index, totalHeight),
    height: containerHeight,
    rowCount: rawData.length,
    width: tableWidth,
    rowHeight: (index) => getRowHeight(index),
    innerElementType,
    onScroll: ({ scrollLeft }) => {
      if (gridHeaderRef.current) {
        gridHeaderRef.current.scrollLeft = scrollLeft;
      }
      if (gridRef.current) {
        const container = tableRef.current;
        const percent = getGridScrollPercentage(scrollLeft).percent;
        container && percent === 1
          ? container.classList.remove("table-fix-right-bar")
          : container.classList.add("table-fix-right-bar");
        container && scrollLeft > 0
          ? container.classList.add("table-fix-left-bar")
          : container.classList.remove("table-fix-left-bar");
        gridRef.current.scrollTo({
          scrollLeft,
        });
      }
    },
  };

  return (
    <div className="virtual-scroll-container" ref={ref}>
      <Grid {...$props}>{() => null}</Grid>
    </div>
  );
});

export default VirtualTable;
