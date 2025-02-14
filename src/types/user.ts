export type UserRating = {
  id: string;
  rating: number;
  ratedBy: string;
  ratedAt: Date;
};

export type User = {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  mainPhoto: string;
  ratings: UserRating[];
  averageRating: number;
  totalRatings: number;
  location?: {
    city: string;
    state: string;
  };
  interests?: string[];
}; 