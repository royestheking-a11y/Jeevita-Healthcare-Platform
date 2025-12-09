import React, { useState } from 'react';
import { Upload, Shield, Clock, Pill, FileText, CheckCircle, X, Sparkles, ShoppingCart, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useCart } from '../contexts/CartContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { ImageUploadWithCrop } from './ImageUploadWithCrop';
import { toast } from 'sonner';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';
import { prescriptionsAPI } from '../utils/api';

interface PrescriptionUploadSectionProps {
  onNavigate: (page: string) => void;
}

interface AnalyzedMedicine {
  name: string;
  dosage: string | null;
  quantity: string | number | null;
  form: string | null;
  verified: boolean;
  matchId?: string;
  matchName?: string;
  matchPrice?: number;
  matchImage?: string;
}

export function PrescriptionUploadSection({ onNavigate }: PrescriptionUploadSectionProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { addPrescription } = useData();
  const { addToCart } = useCart();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [prescriptionImage, setPrescriptionImage] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{ verified: AnalyzedMedicine[], unverified: AnalyzedMedicine[] } | null>(null);

  const features = [
    { icon: Shield, title: 'Secure Upload', description: 'Your prescription is safely encrypted' },
    { icon: Clock, title: 'Quick Processing', description: 'Get medicines delivered in 24-48 hours' },
    { icon: Pill, title: 'Verified Medicines', description: 'Only authentic medicines from licensed pharmacies' },
  ];

  const handleAnalyze = async () => {
    if (!prescriptionImage) return;

    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      // 1. Upload image first if it's base64
      let imageUrl = prescriptionImage;
      if (prescriptionImage.startsWith('data:')) {
        imageUrl = await uploadToCloudinary(prescriptionImage, 'prescriptions');
      }

      // 2. Call AI Analysis API
      const result = await prescriptionsAPI.analyze(imageUrl);

      if (result.success) {
        setAnalysisResult({
          verified: result.verifiedMedicines,
          unverified: result.unverifiedItems
        });
        toast.success(`Found ${result.verifiedMedicines.length} verified medicines!`);
      }

    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Failed to analyze prescription. Please try manual upload.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddToCart = (item: AnalyzedMedicine) => {
    if (item.matchId && item.matchName && item.matchPrice) {
      addToCart({
        id: item.matchId,
        name: item.matchName,
        price: item.matchPrice,
        image: item.matchImage || '',
      });
      toast.success(`${item.matchName} added to cart`);
    }
  };

  const handleManualUpload = async () => {
    if (!user) {
      toast.error('Please login to upload prescription');
      onNavigate('login');
      return;
    }

    if (!prescriptionImage) {
      toast.error('Please upload a prescription image first');
      return;
    }

    setUploading(true);

    try {
      // Upload to Cloudinary if it's a base64 image
      let imageUrl = prescriptionImage;
      if (prescriptionImage.startsWith('data:')) {
        toast.info('Uploading prescription...');
        imageUrl = await uploadToCloudinary(prescriptionImage, 'prescriptions');
      }

      // Add prescription to DataContext (which calls the API)
      await addPrescription({
        userId: user.id || user._id || '', // Handle potential missing id
        userName: user.name,
        userEmail: user.email,
        image: imageUrl,
        status: 'pending',
        uploadDate: new Date().toLocaleString(),
        notes: user ? 'Uploaded via AI Assistant' : 'Manual Upload',
      });

      setUploading(false);
      setShowUploadDialog(false);
      setPrescriptionImage('');
      setAnalysisResult(null);

      toast.success('Prescription uploaded successfully! Our pharmacist will review it soon.');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload prescription. Please try again.');
      setUploading(false);
    }
  };

  const handleOpenDialog = () => {
    if (!user) {
      toast.error('Please login to upload prescription');
      onNavigate('login');
      return;
    }
    setShowUploadDialog(true);
    setAnalysisResult(null);
    setPrescriptionImage('');
  };

  return (
    <>
      <section className="py-16 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 text-amber-700 px-4 py-2 rounded-full mb-6">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm">New: AI Prescription Analysis</span>
              </div>

              <h2 className="text-gray-900 mb-4">
                Upload Your Prescription
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Upload your prescription and let our AI instantly identify your medicines. Verify availability and add to cart in seconds!
              </p>

              {/* Features */}
              <div className="space-y-6 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/30">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-gray-900 mb-1">{feature.title}</p>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleOpenDialog}
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 shadow-lg shadow-amber-500/30"
              >
                Upload & Analyze Prescription
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Right: Upload Preview */}
            <div className="relative">
              <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-amber-500/20 border-2 border-amber-200">
                {/* Upload Area */}
                <div
                  onClick={handleOpenDialog}
                  className="border-2 border-dashed border-amber-300 rounded-2xl p-12 text-center bg-gradient-to-br from-amber-50 to-orange-50 hover:border-amber-400 transition-colors group cursor-pointer"
                >
                  <div className="bg-gradient-to-br from-amber-500 to-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/30">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-gray-900 mb-2">Click to analyze prescription</p>
                  <p className="text-sm text-gray-500">Supports handwritten & printed</p>
                  <p className="text-xs text-gray-400 mt-3">PNG, JPG, PDF up to 10MB</p>
                </div>

                {/* Steps */}
                <div className="mt-6 space-y-3">
                  {[
                    'Upload prescription image',
                    'AI identifies medicines instantly',
                    'Verify and add to cart',
                    'Fast delivery to your doorstep',
                  ].map((step, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-md shadow-amber-500/30">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-gray-700">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-200 rounded-full opacity-50 blur-2xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-orange-200 rounded-full opacity-50 blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Upload & Analyze Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-600" />
              AI Prescription Analysis
            </DialogTitle>
            <DialogDescription>
              Upload your prescription. Our AI will identify medicines and check availability.
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Upload Section */}
            <div className="space-y-4">
              <Label>Prescription Image</Label>
              <ImageUploadWithCrop
                currentImage={prescriptionImage}
                onImageSelected={(image) => {
                  setPrescriptionImage(image);
                  setAnalysisResult(null); // Reset analysis on new image
                }}
                aspectRatio={4 / 3}
                label=""
              />

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleAnalyze}
                  disabled={!prescriptionImage || analyzing || !!analysisResult}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg"
                >
                  {analyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {analysisResult ? 'Analysis Complete' : 'Analyze Prescription'}
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleManualUpload}
                  disabled={!prescriptionImage || uploading}
                  className="w-full"
                >
                  {uploading ? 'Uploading...' : 'Submit for Manual Review'}
                </Button>
              </div>
            </div>

            {/* Right: Analysis Results */}
            <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100 min-h-[400px]">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                Analysis Results
              </h3>

              {!analysisResult && !analyzing && (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center py-12">
                  <Sparkles className="h-12 w-12 mb-4 opacity-20" />
                  <p>Upload an image and click "Analyze" <br />to see identified medicines here</p>
                </div>
              )}

              {analyzing && (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex gap-4 bg-white p-3 rounded-lg border">
                      <div className="h-12 w-12 bg-gray-200 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {analysisResult && (
                <div className="space-y-6">
                  {/* Verified Medicines */}
                  {analysisResult.verified.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-green-700 mb-3 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Available Matches ({analysisResult.verified.length})
                      </h4>
                      <div className="space-y-3">
                        {analysisResult.verified.map((item: AnalyzedMedicine, idx: number) => (
                          <div key={idx} className="bg-white p-3 rounded-lg border border-green-100 shadow-sm flex items-center gap-3">
                            {item.matchImage && (
                              <img src={item.matchImage} alt={item.matchName} className="h-12 w-12 object-contain rounded bg-gray-50" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.matchName}</p>
                              <p className="text-xs text-gray-500">{item.form} • {item.dosage}</p>
                              <p className="text-sm font-bold text-amber-600">৳{item.matchPrice}</p>
                            </div>
                            <Button size="sm" onClick={() => handleAddToCart(item)} className="bg-green-600 hover:bg-green-700 h-8">
                              <ShoppingCart className="h-3 w-3 mr-1" /> Add
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Unverified Items */}
                  {analysisResult.unverified.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-amber-700 mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Unverified Items ({analysisResult.unverified.length})
                      </h4>
                      <div className="space-y-2">
                        {analysisResult.unverified.map((item: AnalyzedMedicine, idx: number) => (
                          <div key={idx} className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-sm">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              {item.dosage} {item.form} - Not available in stock
                            </p>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2 italic">
                        * Please submit for manual review to process unverified items.
                      </p>
                    </div>
                  )}

                  {analysisResult.verified.length === 0 && analysisResult.unverified.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No medicines identified clearly.</p>
                      <p className="text-sm">Please try a clearer image or submit for manual review.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
