import React from 'react';
import { Purchase } from '../types';
import { Download, Calendar, FileBox } from 'lucide-react';

interface PurchasesProps {
  purchases: Purchase[];
  loading: boolean;
}

export const Purchases: React.FC<PurchasesProps> = ({ purchases, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Loading your library...</p>
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <div className="bg-gray-800 inline-flex p-6 rounded-full mb-6">
          <FileBox className="w-12 h-12 text-gray-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No purchases yet</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          You haven't purchased any STL files yet. Visit the store to find your next printing project!
        </p>
      </div>
    );
  }

  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

  const handleDownload = async (productId: string, downloadLink?: string) => {
    try {
      if (downloadLink && downloadLink.startsWith('http')) {
        window.open(downloadLink, '_blank');
        return;
      }

      setDownloadingId(productId);
      const { getSecureDownloadUrl } = await import('../services/firebaseService');
      const url = await getSecureDownloadUrl(productId);
      window.open(url, '_blank');
    } catch (error: any) {
      console.error("Failed to download", error);
      let msg = "Failed to download file.";
      if (error.message?.includes('permission') || error.code === 'storage/unauthorized') {
        msg = "Permission denied. Please refresh and try again.";
      }
      alert(msg);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        My Library
        <span className="bg-gray-800 text-sm font-normal py-1 px-3 rounded-full text-gray-400">
          {purchases.length} items
        </span>
      </h2>

      <div className="space-y-4">
        {purchases.map((purchase) => (
          <div
            key={purchase.id || purchase.transactionId + purchase.productId}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-brand-500/30 transition-colors"
          >
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">{purchase.productName}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {purchase.purchaseDate.toDate().toLocaleDateString()}
                </span>
                <span className="bg-gray-700/50 px-2 py-0.5 rounded text-xs font-mono">
                  ID: {purchase.transactionId.substring(0, 12)}...
                </span>
              </div>
            </div>

            <button
              onClick={() => handleDownload(purchase.productId, purchase.downloadLink)}
              disabled={downloadingId === purchase.productId}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-700 hover:bg-brand-600 text-white px-5 py-3 rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloadingId === purchase.productId ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {downloadingId === purchase.productId ? 'Preparing...' : 'Download STL'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
