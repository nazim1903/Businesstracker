import { Download, Upload } from 'lucide-react';
import { dbOperations } from '../utils/db';

interface DataBackupProps {
  onImport: () => void;
}

export function DataBackup({ onImport }: DataBackupProps) {
  const handleExport = async () => {
    try {
      await dbOperations.exportData();
      alert('Backup created successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to create backup. Please try again.');
    }
  };

  const handleImport = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const success = await dbOperations.importData(file);
          if (success) {
            alert('Data imported successfully!');
            onImport();
          }
        }
      };
      
      input.click();
    } catch (error) {
      console.error('Error importing data:', error);
      alert('Failed to import data. Please try again.');
    }
  };

  return (
    <div className="flex justify-end gap-2 mb-4">
      <button
        onClick={handleExport}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        <Download className="w-4 h-4" />
        Export Data
      </button>
      <button
        onClick={handleImport}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <Upload className="w-4 h-4" />
        Import Data
      </button>
    </div>
  );
}