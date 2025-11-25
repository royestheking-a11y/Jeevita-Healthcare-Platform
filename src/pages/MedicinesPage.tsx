import React, { useState } from 'react';
import { MedicineCard } from '../components/MedicineCard';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Search, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';

interface MedicinesPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function MedicinesPage({ onNavigate }: MedicinesPageProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { medicines, addPrescription } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const categories = ['all', 'Pain Relief', 'Digestive Health', 'Blood Pressure', 'Antibiotics', 'Allergy', 'Cholesterol'];

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || medicine.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handlePrescriptionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPrescriptionFile(file);
    }
  };

  const submitPrescription = async () => {
    if (!user) {
      toast.error('Please login to upload prescription');
      onNavigate('login');
      return;
    }

    if (prescriptionFile) {
      setUploading(true);
      try {
        // Convert file to base64 for storage (mock implementation usually expects string)
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result as string;

          await addPrescription({
            userId: user.id || user._id || '',
            userName: user.name,
            userEmail: user.email,
            image: base64String,
            status: 'pending',
            uploadDate: new Date().toLocaleString(),
            notes: '',
          });

          toast.success('Prescription uploaded successfully! Our team will review it shortly.');
          setPrescriptionFile(null);
          setUploading(false);
          setShowDialog(false);
        };
        reader.readAsDataURL(prescriptionFile);
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload prescription');
        setUploading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-sky-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-gray-900 mb-2">{t('medicines.title')}</h1>
            <p className="text-gray-600">
              Order medicines online with fast delivery
            </p>
          </div>

          {/* Upload Prescription Button */}
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30">
                <Upload className="h-4 w-4 mr-2" />
                {t('medicines.uploadPrescription')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Prescription</DialogTitle>
                <DialogDescription>
                  Upload your prescription image or PDF. Our team will verify and add the medicines to your account.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handlePrescriptionUpload}
                    className="hidden"
                    id="prescription-upload"
                  />
                  <label htmlFor="prescription-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG or PDF (max. 10MB)
                    </p>
                  </label>
                  {prescriptionFile && (
                    <p className="mt-4 text-sm text-[#2A9D8F]">
                      Selected: {prescriptionFile.name}
                    </p>
                  )}
                </div>
                <Button
                  onClick={submitPrescription}
                  disabled={!prescriptionFile || uploading}
                  className="w-full bg-[#2A9D8F] hover:bg-[#238176]"
                >
                  {uploading ? 'Uploading...' : 'Submit Prescription'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search medicines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder={t('medicines.filter.category')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Showing {filteredMedicines.length} medicine{filteredMedicines.length !== 1 ? 's' : ''}
        </p>

        {/* Medicines Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMedicines.map((medicine) => (
            <MedicineCard
              key={medicine.id}
              medicine={medicine}
              onViewDetails={(id) => onNavigate('medicine-details', { medicineId: id })}
            />
          ))}
        </div>

        {/* No Results */}
        {filteredMedicines.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No medicines found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
