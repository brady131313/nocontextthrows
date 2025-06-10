import { submissionFileRef } from "@/lib/firebase";
import { getDownloadURL } from "firebase/storage";
import { useEffect, useState } from "react";

const useFireImagePreview = (imagePath: string) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        setLoading(true);

        const storageRef = submissionFileRef(imagePath);
        const url = await getDownloadURL(storageRef);
        setImageUrl(url);
      } catch (error) {
        setError(error instanceof Error ? error : new Error(String(error)));
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [imagePath]);

  return { imageUrl, loading, error };
};

type FireImagePreviewProps = {
  imagePath: string;
};

export function FireImagePreview({ imagePath }: FireImagePreviewProps) {
  const { imageUrl, loading, error } = useFireImagePreview(imagePath);

  return (
    <div className="w-full overflow-hidden rounded-md aspect-square">
      {loading && (
        <div className="w-full h-full bg-gray-200 animate-pulse"></div>
      )}
      {error && <div className="w-full h-full bg-red-200 animate-pulse"></div>}
      {imageUrl && (
        <img
          src={imageUrl}
          className="bg-gray-200 w-full h-full object-cover transition-all hover:scale-105"
        />
      )}
    </div>
  );
}
