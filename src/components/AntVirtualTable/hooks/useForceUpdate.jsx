import { useState, useCallback } from 'react';

const UseForceUpdate =  () => {
  const [updateCount, update] = useState(0);


  const createNewKey = (prefix) => {
    forceUpdate();
    return prefix + '_' + updateCount;
  }

  const forceUpdate = useCallback(() => {
    update((p) => p + 1);
  }, [update]);

  return {
    createNewKey,
    forceUpdate,
  };
};

export default UseForceUpdate;
