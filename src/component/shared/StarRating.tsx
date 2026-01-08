import React from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';

interface StarRatingProps {
    rating: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
    const totalStars = 5;
    return (
        <div className="flex">
            {[...Array(totalStars)].map((_, index) =>
                index < rating ? <FaStar key={index} className="text-yellow-400" /> : <FaRegStar key={index} className="text-gray-500" />
            )}
        </div>
    );
};

export default StarRating;