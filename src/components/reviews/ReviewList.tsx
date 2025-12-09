import React, { useEffect, useState } from 'react';
import { Star, User } from 'lucide-react';
import { reviewsAPI } from '../../utils/api';
import { Review } from '../../contexts/DataContext';
import { format } from 'date-fns';

interface ReviewListProps {
    targetId: string;
}

export const ReviewList: React.FC<ReviewListProps> = ({ targetId }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const data = await reviewsAPI.getByTargetId(targetId);
                setReviews(data);
            } catch (error) {
                console.error('Failed to fetch reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        if (targetId) {
            fetchReviews();
        }
    }, [targetId]);

    if (loading) {
        return <div className="text-gray-500 text-center py-4">Loading reviews...</div>;
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
                <p className="text-gray-500">No reviews yet. Be the first to review!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => (
                <div key={review._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-100 p-2 rounded-full">
                                <User className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                                <p className="text-xs text-gray-500">
                                    {review.createdAt ? format(new Date(review.createdAt), 'MMM d, yyyy') : 'Recent'}
                                </p>
                            </div>
                        </div>
                        <div className="flex bg-amber-50 px-2 py-1 rounded-md">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                                />
                            ))}
                        </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                </div>
            ))}
        </div>
    );
};
