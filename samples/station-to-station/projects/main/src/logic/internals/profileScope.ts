
export const profileScope = async <R>(inCallback: () => Promise<R> | R, inDoneCallback: (elapsed: number) => void): Promise<R> => {
  const startTime = Date.now();

  const val = await inCallback();

  const endTime = Date.now();

  inDoneCallback(endTime - startTime);

  return val;
};
