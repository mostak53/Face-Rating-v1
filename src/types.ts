export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: any;
}

export interface Photo {
  id: string;
  name: string;
  angle: 'Front' | 'Left' | 'Right' | 'Top' | '45 degree';
  url: string;
  uploadedBy: string;
  createdAt: any;
}

export interface Rating {
  id: string;
  userId: string;
  username: string;
  photoId: string;
  photoName: string;
  angle: string;
  rating: number;
  timestamp: any;
}
