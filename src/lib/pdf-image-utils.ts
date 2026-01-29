/**
 * Converts an image URL to base64 data URI
 * This is necessary for @react-pdf/renderer which cannot access external URLs
 */
export async function urlToBase64(url: string): Promise<string | null> {
  try {
    // If already a data URI, return as-is
    if (url.startsWith("data:")) {
      return url;
    }

    // Fetch the image
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch image: ${url}`, response.statusText);
      return null;
    }

    // Convert to blob
    const blob = await response.blob();
    
    // Convert blob to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Error converting image URL to base64: ${url}`, error);
    return null;
  }
}

/**
 * Processes all images in a project report and converts URLs to base64
 */
export async function processReportImages(report: {
  project: {
    latestProjectVersion?: {
      sheet1?: Array<{
        blockages?: Array<{
          blockagePhotos?: Array<{ url?: string; [key: string]: unknown }>;
          [key: string]: unknown;
        }>;
        yesterdayProgressPhotos?: Array<{
          photos?: Array<{ url?: string; [key: string]: unknown }>;
          [key: string]: unknown;
        }>;
        [key: string]: unknown;
      }>;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}): Promise<void> {
  const sheet1 = report.project.latestProjectVersion?.sheet1;
  if (!sheet1) return;

  // Process all images in parallel
  const imagePromises: Promise<void>[] = [];

  for (const item of sheet1) {
    // Process blockage photos
    if (item.blockages) {
      for (const blockage of item.blockages) {
        if (blockage.blockagePhotos) {
          for (const photo of blockage.blockagePhotos) {
            if (photo.url && photo.url.trim() !== "") {
              imagePromises.push(
                urlToBase64(photo.url).then((base64) => {
                  if (base64) {
                    photo.url = base64;
                  }
                })
              );
            }
          }
        }
      }
    }

    // Process progress photos
    if (item.yesterdayProgressPhotos) {
      for (const photoSet of item.yesterdayProgressPhotos) {
        if (photoSet.photos) {
          for (const photo of photoSet.photos) {
            if (photo.url && photo.url.trim() !== "") {
              imagePromises.push(
                urlToBase64(photo.url).then((base64) => {
                  if (base64) {
                    photo.url = base64;
                  }
                })
              );
            }
          }
        }
      }
    }
  }

  // Wait for all images to be processed
  await Promise.all(imagePromises);
}
