import React, { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { reviewsAPI } from '../../utils/api';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

interface ReviewFormProps {
    targetId: string;
    targetType: 'doctor' | 'hospital';
    onSuccess?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ targetId, targetType, onSuccess }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const { user } = useAuth();

    const handleSubmit = async () => {
        if (!comment.trim()) {
            toast.error('Please write a comment');
            return;
        }

        if (!user) {
            toast.error('You must be logged in to review');
            return;
        }

        setLoading(true);
        try {
            await reviewsAPI.create({
                userId: user.id || user._id, // Handle different user object structures
                targetId,
                targetType,
                rating,
                comment
            });
            toast.success('Review submitted successfully! It will be visible after approval.');
            setOpen(false);
            setComment('');
            setRating(5);
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error('Review submission error:', error);
            toast.error(error.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                    Write a Review
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Write a Review</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="flex flex-col items-center gap-2 mb-4">
                        <span className="text-sm font-medium text-gray-700">Your Rating</span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`h-8 w-8 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                                    />
                                </button>
                            ))}
                        </div>
                        <span className="text-sm text-gray-500">
                            {rating === 5 ? 'Excellent' : rating === 4 ? 'Very Good' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Your Review</label>
                        <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience..."
                            rows={4}
                            className="resize-none focus:border-amber-500 focus:ring-amber-500"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Review
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
