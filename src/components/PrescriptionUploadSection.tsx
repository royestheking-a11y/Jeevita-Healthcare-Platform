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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent py-1">
              <Sparkles className="h-6 w-6 text-amber-500 flex-shrink-0" />
              AI Prescription Analysis
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-base">
              Our advanced AI is ready to scan your prescription.
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-8 mt-4">
            {/* Left: Upload Section */}
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-amber-100">
                <Label className="text-gray-700 font-semibold mb-2 block">1. Upload Image</Label>
                <ImageUploadWithCrop
                  currentImage={prescriptionImage}
                  onImageSelected={(image) => {
                    console.log('Image selected, length:', image.length);
                    setPrescriptionImage(image);
                    setAnalysisResult(null); // Reset analysis on new image
                  }}
                  aspectRatio={4 / 3}
                  label=""
                />
              </div>

              <div className="flex flex-col gap-4">
                <Button
                  onClick={handleAnalyze}
                  disabled={!prescriptionImage || analyzing}
                  className={`w-full h-14 text-lg font-bold text-white shadow-xl transition-all duration-300 rounded-xl flex items-center justify-center gap-3 ${prescriptionImage && !analysisResult && !analyzing
                      ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/30 animate-pulse scale-[1.02]'
                      : 'bg-gray-300 cursor-not-allowed'
                    } ${analyzing ? 'bg-gradient-to-r from-amber-400 to-orange-400 cursor-wait' : ''}`}
                >
                  {analyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-6 w-6" />
                      {analysisResult ? 'Analyze Again' : 'Analyze Now'}
                    </>
                  )}
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase font-medium">
                    <span className="bg-gray-50 px-3 text-gray-400 tracking-wider">Options</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleManualUpload}
                  disabled={!prescriptionImage || uploading}
                  className="w-full border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                >
                  {uploading ? 'Uploading...' : 'Skip to Manual Submission'}
                </Button>
              </div>
            </div>

            {/* Right: Analysis Results */}
            <div className="space-y-4 bg-white p-6 rounded-2xl shadow-lg border border-amber-100 flex flex-col min-h-[500px]">
              <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2 border-b border-gray-100 pb-4">
                <FileText className="h-5 w-5 text-amber-500 flex-shrink-0" />
                Analysis Results
              </h3>

              {!analysisResult && !analyzing && (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center space-y-4">
                  <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-2">
                    <Sparkles className="h-10 w-10 text-amber-300" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-gray-600 text-lg">Ready to Analyze</p>
                    <p className="text-sm">Upload an image and click the button to start</p>
                  </div>
                </div>
              )}

              {analyzing && (
                <div className="space-y-6 py-8">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex gap-4">
                      <div className="h-16 w-16 bg-gray-100 rounded-xl"></div>
                      <div className="flex-1 space-y-3 py-1">
                        <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                  <div className="text-center text-sm text-gray-400 mt-4 animate-bounce">
                    Identifying medicines...
                  </div>
                </div>
              )}

              {analysisResult && (
                <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {/* Verified Medicines */}
                  {analysisResult.verified.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-green-700 uppercase tracking-wide flex items-center gap-2 mb-3 bg-green-50 p-2 rounded-lg">
                        <CheckCircle className="h-5 w-5 flex-shrink-0" />
                        Identified & Available ({analysisResult.verified.length})
                      </h4>
                      <div className="space-y-4">
                        {analysisResult.verified.map((item, idx) => (
                          <div key={idx} className="group bg-white p-4 rounded-xl border border-green-100 shadow-sm hover:shadow-md hover:border-green-300 transition-all flex flex-col">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 w-16 h-16 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                                {item.matchImage ? (
                                  <img src={item.matchImage} alt={item.matchName} className="w-full h-full object-contain" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Pill className="h-6 w-6 text-gray-300" />
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 text-lg leading-tight break-words">{item.matchName}</p>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1.5">
                                  <span className="bg-gray-100 px-2.5 py-1 rounded-full">{item.form || 'Medicine'}</span>
                                  {item.dosage && (<span>• {item.dosage}</span>)}
                                </div>
                                <p className="text-xl font-bold text-amber-600 mt-2">৳{item.matchPrice}</p>
                              </div>
                            </div>

                            <Button
                              onClick={() => handleAddToCart(item)}
                              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white shadow-green-200 shadow-md rounded-lg h-11 flex items-center justify-center gap-2 text-sm font-semibold"
                            >
                              <ShoppingCart className="h-4 w-4" />
                              Add to Cart
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Unverified Items */}
                  {analysisResult.unverified.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-bold text-amber-700 uppercase tracking-wide flex items-center gap-2 mb-3 bg-amber-50 p-2 rounded-lg">
                        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                        Needs Review ({analysisResult.unverified.length})
                      </h4>
                      <div className="bg-white rounded-xl border border-amber-100 divide-y divide-amber-100/50">
                        {analysisResult.unverified.map((item, idx) => (
                          <div key={idx} className="p-3 hover:bg-amber-50/30 transition-colors">
                            <div className="flex items-start gap-3">
                              <div className="mt-1.5">
                                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                              </div>
                              <div>
                                <p className="font-medium text-amber-900">{item.name}</p>
                                <p className="text-xs text-amber-700 mt-0.5">
                                  {item.dosage} {item.form}
                                  {(!item.dosage && !item.form) ? 'Details unclear' : ''}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-center text-amber-600/80 italic mt-2">
                        * Submit for manual review so our pharmacist can find these for you.
                      </p>
                    </div>
                  )}

                  {analysisResult.verified.length === 0 && analysisResult.unverified.length === 0 && (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <p className="font-medium text-gray-900">No medicines identified</p>
                      <p className="text-sm text-gray-500 mt-1">Try a clearer image or use manual submission.</p>
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
