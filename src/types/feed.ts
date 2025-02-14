export type PostType = {
  id: string;
  userName: string;
  userImage: string;
  content: string;
  postImage?: string;
  likes: number;
  comments: number;
  timeAgo: string;
}; 