
const dealColumns = (columns, width, count) => {
  const stickyLeftIndices = [], stickyRightIndices= [];
  const mergedColumns = columns.map((column, index) => {
    if (column.fixed) {
      column.fixed === "left" && stickyLeftIndices.push(index);
      column.fixed === "right" && stickyRightIndices.push(index);
    }
    if (column.width) {
      return column;
    }
    return { ...column, width: Math.floor(width / count) };
  });

  return {
    mergedColumns,
    stickyLeftIndices,
    stickyRightIndices
  };
};

const arrayMoveImmutable = (array, fromIndex, toIndex) => {
  const newArray = array;
  const startIndex = fromIndex < 0 ? array.length + fromIndex : fromIndex;
  if (startIndex >= 0 && startIndex < newArray.length) {
    const endIndex = toIndex < 0 ? newArray.length + toIndex : toIndex;
    const [item] = newArray.splice(fromIndex, 1);
    newArray.splice(endIndex, 0, item);
  }
  return newArray;
}

const dealStickyOffset = (stickyIndices, columns, isComputedOffset = false) => {
  return stickyIndices.map((v, index) => {
    const { fixed } = columns[v];
    const offset = (isComputedOffset && fixed === 'right' && index > 0) ? 10 : 0;
    return stickyIndices.slice(0, index).reduce((a, b) => a + columns[b].width ,0) - offset;
  });
}



export { 
  dealColumns,
  dealStickyOffset,
  arrayMoveImmutable 
};
