const getDynamicColumns = (num = 10) => {
  return new Array(num).fill(1).map((_, index) => ({
    dataIndex: "row" + index,
    title: "row" + index,
    width: 130
  }));
}

const getDynamicDataSource = (num = 10, columnNum = 10) => {
  return new Array(num).fill(1).map((v, index) => {
    const obj = {};
    getDynamicColumns(columnNum).forEach((v) => {
      obj[v.dataIndex] = v.dataIndex + "-" + index;
    });
    return obj;
  })
}


export {
  getDynamicColumns,
  getDynamicDataSource,
}