import React from "react";
import Image from "next/image";

interface AppImageProps {
  src: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  onError?: () => void;
}

function AppImage({
  src,
  alt = "Image Name",
  className = "",
  width = 400,
  height = 300,
  fill = false,
  priority = false,
  quality = 75,
  onError,
  ...props
}: AppImageProps) {
  const [imgSrc, setImgSrc] = React.useState(src);

  const handleError = () => {
    setImgSrc("/assets/images/no_image.png");
    onError?.();
  };

  if (imgSrc.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p>No image found</p>
      </div>
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      className={className}
      fill={fill}
      priority={priority}
      quality={quality}
      onError={handleError}
      {...props}
      {...(!fill && { width, height })}
    />
  );
}

export default AppImage;
