export interface User {
  id: number;
  username: string;
  email: string;
  role: "ADMIN" | "USER";
  avatar?: string | null;
  githubId?: string | null;
  createdAt?: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  _count?: {
    posts: number;
  };
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: number;
  author: Pick<User, "id" | "username">;
  tags?: Tag[];
  _count?: {
    comments: number;
    likes: number;
  };
  comments?: Comment[];
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  postId: number;
  authorId: number;
  author: Pick<User, "id" | "username">;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PostsResponse {
  posts: Post[];
  pagination: Pagination;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LikeResponse {
  liked: boolean;
  likesCount: number;
}

export interface LikeStatusResponse {
  liked: boolean;
  likesCount: number;
}

export interface TagsResponse {
  tags: Tag[];
}
