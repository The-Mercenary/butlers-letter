export function extractStoragePathFromPublicUrl(url: string, bucket: string) {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const markerIndex = url.indexOf(marker);

  if (markerIndex === -1) {
    return "";
  }

  return decodeURIComponent(url.slice(markerIndex + marker.length).split("?")[0]);
}
