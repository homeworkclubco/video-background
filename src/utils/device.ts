export function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Windows Phone/i.test(
    navigator.userAgent
  );
}
