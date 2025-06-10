import { submissionFileRef } from "@/lib/firebase";
import { getDownloadURL } from "firebase/storage";
import { useEffect, useState } from "react";

const useFireFilePreview = (imagePath: string) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        setLoading(true);

        const storageRef = submissionFileRef(imagePath);
        const url = await getDownloadURL(storageRef);
        setFileUrl(url);
      } catch (error) {
        setError(error instanceof Error ? error : new Error(String(error)));
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [imagePath]);

  return { fileUrl, loading, error };
};

type FireImagePreviewProps = {
  filePath: string;
  fileType: "image" | "video";
};

export function FireFilePreview({ filePath, fileType }: FireImagePreviewProps) {
  const { fileUrl, loading, error } = useFireFilePreview(filePath);

  return (
    <div className="w-full overflow-hidden rounded-md aspect-square">
      {loading && (
        <div className="w-full h-full bg-gray-200 animate-pulse"></div>
      )}
      {error && <div className="w-full h-full bg-red-200 animate-pulse"></div>}
      {fileUrl && fileType === "image" && (
        <img
          src={fileUrl}
          className="bg-gray-200 w-full h-full object-cover transition-all hover:scale-105"
        />
      )}
      {fileUrl && fileType === "video" && (
        <video
          src={fileUrl}
          className="bg-gray-200 w-full h-full object-cover"
          controls
        />
      )}
    </div>
  );
}
