import React,{
  useState,
  useRef,
  createContext,
  useMemo,
} from "react";
import PropTypes from 'prop-types';
import { unstable_batchedUpdates } from 'react-dom';

import ResizeObserver from "rc-resize-observer";
import Header from "./Header";
import VirtualTable from "./VirtualTable";
import { dealColumns, arrayMoveImmutable } from "./utils";
import useForceUpdate from "./hooks/useForceUpdate";
import { Spin } from 'antd';

import "./style.css";

const VirtualTableContext = createContext({});
VirtualTableContext.displayName = "VirtualTableContext";

/**
 * 基于react-window开发的虚拟滚动表格
 */
function AntVirtualTable(props) {
  const {
    columns = [],
    scroll,
    loading,
    dataSource: rawData,
    rowHeight = 36,
    enableResize = false,
    enableSorting = false,
    headHeight = 36,
    onCurrentRef,
  } = props;

  const initColumnWidth = useMemo(() => columns.reduce((a,b) => a + (b.width || 0), 0), [columns]);

  const [tableWidth, setTableWidth] = useState(0);
  const [tableScrollOffset, setTableScrollOffset] = useState({ top: 0, left: 0 });
  
  const gridRef = useRef(null);
  const gridContainerRef = useRef(null);
  const gridHeaderRef = useRef(null);
  const colResizeProxyRef = useRef(null);
  const gridContainerWidth = useRef(0);
  const gridKeyRef = useRef("table-grid");
  const gridResizeConfig = useRef({ initWidth: {}, offsetWidth: {} });
  const { createNewKey } = useForceUpdate();

  const columnCount = columns.filter(({ width, dataIndex }) => {
    gridResizeConfig.current.initWidth[dataIndex] = width;
    return !width
  }).length;
  
  const { mergedColumns, stickyLeftIndices, stickyRightIndices } = dealColumns(columns, tableWidth, columnCount);

  // 更新
  const customForceUpdate = (extraKey, offset, isResize = false) => {
    gridKeyRef.current = "table-grid-" + extraKey;
    const gridState = gridRef.current.state;
    handleTableResize({
      width: gridContainerWidth.current,
      top: gridState.scrollTop,
      left: gridState.scrollLeft,
      isResize,
    });
  };

  // 自适应
  const handleTableResize = ({ width, top, left, isResize }) => {
    const realWidth = scroll.x || width;
    gridContainerWidth.current = realWidth;
    unstable_batchedUpdates(() => {
      if(realWidth > initColumnWidth && !isResize) {
        const averageWidth = Math.floor((realWidth - initColumnWidth)/ columns.length);
        columns.forEach(column => {
          gridResizeConfig.current.offsetWidth[column.dataIndex] = averageWidth;
        });
        gridKeyRef.current = "table-grid-" + averageWidth;
      }
      setTableScrollOffset({ top, left });
      setTableWidth(realWidth);
    })
  };

  // 调整列宽
  const handleTableResizeStop = (offset, draggingProp) => {
    const { dataIndex } = columns[draggingProp];
    let offsetWidth = (gridResizeConfig.current.offsetWidth[dataIndex] || 0) + offset;
    if(offsetWidth < 0 ) {
      offsetWidth = 0;
    };
    gridResizeConfig.current.offsetWidth[dataIndex] = offsetWidth;
    customForceUpdate(offsetWidth, 0, true);
  };

  // 列排序
  const handleTableSortColumns = (dragIndex, dropIndex) => {
    arrayMoveImmutable(columns, dragIndex, dropIndex);
    customForceUpdate(createNewKey("update"), 0);
  };

  const getGridRef = () => {
    return gridRef.current
  }

  // 回调当前组件方法
  onCurrentRef && onCurrentRef({ customForceUpdate, getGridRef })

  const generateTable = () => {
    const tableContext = {
      rawData: [...rawData],
      columns: mergedColumns,
      stickyLeftIndices: stickyLeftIndices,
      stickyRightIndices: stickyRightIndices,
      scroll: scroll,
      rowHeight: rowHeight,
      headHeight: headHeight,
      tableWidth: tableWidth,
      totalHeight: rawData.length * rowHeight,
      tableScrollOffset: tableScrollOffset,
      enableResize: enableResize,
      enableSorting: enableSorting,
      gridKeyRef: gridKeyRef,
      tableRef: gridContainerRef,
      gridHeaderRef: gridHeaderRef,
      colResizeProxyRef: colResizeProxyRef,
      gridResizeConfig,
    };
    return (
      <VirtualTableContext.Provider value={tableContext}>
        <Spin spinning={loading || false}>
        <div className="virtual-grid-item-container">
          {
            <Header
              ref={gridHeaderRef}
              onDropStop={handleTableSortColumns}
              onResizeStop={handleTableResizeStop}
            />
          }
          {
            <VirtualTable ref={gridContainerRef} gridRef={gridRef}/>
          }
          <div
            className="resize-col-proxy"
            ref={colResizeProxyRef}
            style={{ visibility: "hidden" }}
          />
        </div>
        </Spin>
      </VirtualTableContext.Provider>
    );
  };

  const genenrateContent = () => {
    const $props = {
      onResize: handleTableResize,
    };
    return <ResizeObserver {...$props}>{generateTable()}</ResizeObserver>;
  };

  return genenrateContent();
}

AntVirtualTable.propTypes = {
  /**
   * Table行标识
   */
  rowKey: PropTypes.string,
  /**
   * 列配置项
   */
  columns: PropTypes.array,
  /**
   * 滚动配置
   */
  scroll: PropTypes.object,
  /**
   * 加载loading
   */
  loading: PropTypes.bool,
  /**
   * 数据源
   */
  dataSource: PropTypes.array,
  /**
   * 表头高度
   */
  headHeight: PropTypes.number,
  /**
   * 表行高度
   */
  rowHeight: PropTypes.number,
  /**
   * 是否支持调整列宽
   */
  enableResize: PropTypes.bool,
  /**
   * 是否支持拖动列头进行排序
   */
  enableSorting: PropTypes.bool,
}

AntVirtualTable.defaultProps = {
  rowKey: 'id',
  columns: [],
  scroll: { y: 300 },
  loading: false,
  dataSource: [],
  headHeight: 36,
  rowHeight: 36,
  enableResize: false,
  enableSorting: false
}

export default AntVirtualTable;




export {
  VirtualTableContext,
}
