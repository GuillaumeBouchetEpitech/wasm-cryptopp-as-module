
export const scriptLoadingUtility = (inSrc: string) => {
  return new Promise((resolve, reject) => {
    const scriptElement = document.createElement("script");
    scriptElement.src = inSrc;
    // scriptElement.onprogress = (event) => logger.log("event", event);
    scriptElement.addEventListener('load', resolve);
    scriptElement.addEventListener('error', reject);
    document.head.appendChild(scriptElement);
  });
};
