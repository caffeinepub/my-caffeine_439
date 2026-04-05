import { useEffect, useState } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";

const MOTOKO_DEDUPLICATION_SENTINEL = "!caf!";

export function useBlobUrl(imageId: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!imageId) {
      setUrl(null);
      return;
    }
    loadConfig().then((config) => {
      const hash = imageId.startsWith(MOTOKO_DEDUPLICATION_SENTINEL)
        ? imageId.substring(MOTOKO_DEDUPLICATION_SENTINEL.length)
        : imageId;
      const gatewayUrl = `${config.storage_gateway_url}/v1/blob/?blob_hash=${encodeURIComponent(hash)}&owner_id=${encodeURIComponent(config.backend_canister_id)}&project_id=${encodeURIComponent(config.project_id)}`;
      setUrl(gatewayUrl);
    });
  }, [imageId]);

  return url;
}

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File): Promise<string> => {
    setUploading(true);
    setError(null);
    try {
      const config = await loadConfig();
      // Use anonymous HttpAgent for uploads
      const { HttpAgent } = await import("@icp-sdk/core/agent");
      const agent = new HttpAgent({
        host: config.backend_host,
      });
      if (config.backend_host?.includes("localhost")) {
        await agent.fetchRootKey().catch(() => {});
      }
      const storageClient = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes);
      return MOTOKO_DEDUPLICATION_SENTINEL + hash;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "আপলোড ব্যর্থ হয়েছে";
      setError(msg);
      throw e;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, error };
}
