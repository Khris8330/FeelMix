export type User = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  postsCount: number;
  friendsCount: number;
  vibesCount: number;
  isFollowing: boolean;
  verified?: boolean;
};

export type VibeEmbed = {
  moodTitle: string;
  moodSubtitle?: string;
  trackName: string;
  trackArtist: string;
  movieTitle: string;
  movieYear: string;
  movieDirector?: string;
  coverUrl?: string;
};

export type Post = {
  id: string;
  userId: string;
  body: string;
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  likedByMe: boolean;
  vibe?: VibeEmbed;
  imageUrl?: string;
};

export const currentUser: User = {
  id: 'u0',
  name: 'Alex Rivers',
  handle: 'alexrivers',
  avatar: 'https://i.pravatar.cc/150?u=alexrivers',
  bio: 'Moods, music, and late night scenes.',
  postsCount: 42,
  followersCount: 318,
  vibesCount: 27,
  isFollowing: false,
};

export const users: User[] = [
  currentUser,
  {
    id: 'u1',
    name: 'Sofia Alvarez',
    handle: 'sofiaa',
    avatar: 'https://i.pravatar.cc/150?u=sofiaa',
    bio: 'Quiet evenings and loud soundtracks.',
    postsCount: 128,
    followersCount: 2400,
    vibesCount: 89,
    isFollowing: true,
    verified: true,
  },
  {
    id: 'u2',
    name: 'Miles Thompson',
    handle: 'milesthomp',
    avatar: 'https://i.pravatar.cc/150?u=milesthomp',
    bio: 'Films on repeat. Coffee on loop.',
    postsCount: 64,
    followersCount: 890,
    vibesCount: 41,
    isFollowing: false,
  },
  {
    id: 'u3',
    name: 'Luna Marlowe',
    handle: 'lunavibes',
    avatar: 'https://i.pravatar.cc/150?u=lunavibes',
    bio: 'Mixing moods, music and moments.',
    postsCount: 248,
    followersCount: 1200,
    vibesCount: 312,
    isFollowing: true,
    verified: true,
  },
  {
    id: 'u4',
    name: 'Kai Bennett',
    handle: 'kaibennett',
    avatar: 'https://i.pravatar.cc/150?u=kaibennett',
    bio: 'Night drives and neon scores.',
    postsCount: 51,
    followersCount: 640,
    vibesCount: 33,
    isFollowing: false,
  },
];

export const posts: Post[] = [
  {
    id: 'p1',
    userId: 'u1',
    body: 'Some quiet evenings just hit different. This scene, this song. Exactly the mood I needed.',
    createdAt: '2h ago',
    likes: 124,
    comments: 18,
    shares: 7,
    likedByMe: false,
    vibe: {
      moodTitle: 'Afterglow',
      moodSubtitle: 'The feeling when the world slows down.',
      trackName: 'Summertime Sadness',
      trackArtist: 'Lana Del Rey',
      movieTitle: 'Call Me by Your Name',
      movieYear: '2017',
      movieDirector: 'Luca Guadagnino',
      coverUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    },
  },
  {
    id: 'p2',
    userId: 'u2',
    body: 'Found this old film and it has been on repeat in my mind since.',
    createdAt: '5h ago',
    likes: 86,
    comments: 12,
    shares: 3,
    likedByMe: true,
    vibe: {
      moodTitle: 'Midnight in rewind',
      trackName: 'Motion Picture Soundtrack',
      trackArtist: 'Radiohead',
      movieTitle: 'Lost in Translation',
      movieYear: '2003',
      movieDirector: 'Sofia Coppola',
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
    },
  },
  {
    id: 'p3',
    userId: 'u3',
    body: 'Sunsets and silence. Nothing else needed.',
    createdAt: '1d ago',
    likes: 210,
    comments: 34,
    shares: 11,
    likedByMe: false,
    imageUrl: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800',
  },
  {
    id: 'p4',
    userId: 'u4',
    body: 'Rain on the windshield. City lights smeared. Perfect score night.',
    createdAt: '1d ago',
    likes: 67,
    comments: 9,
    shares: 2,
    likedByMe: false,
    vibe: {
      moodTitle: 'Neon haze',
      trackName: 'Blinding Lights',
      trackArtist: 'The Weeknd',
      movieTitle: 'Drive',
      movieYear: '2011',
      movieDirector: 'Nicolas Winding Refn',
      coverUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400',
    },
  },
];

export const lifeEvents = [
  { id: 'heartbreak', label: 'Heartbreak', emoji: 'broken-heart' },
  { id: 'late-night', label: 'Late Night', emoji: 'moon' },
  { id: 'celebration', label: 'Celebration', emoji: 'party' },
  { id: 'new-job', label: 'New Job', emoji: 'rocket' },
  { id: 'sunday', label: 'Sunday Scaries', emoji: 'worried' },
  { id: 'rainy', label: 'Rainy Day', emoji: 'rain' },
];

export function getUser(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

export function getPostsByUser(userId: string): Post[] {
  return posts.filter((p) => p.userId === userId);
}

export function getFollowers(): User[] {
  return users.filter((u) => u.id !== currentUser.id && u.isFollowing);
}

export function getSuggested(): User[] {
  return users.filter((u) => u.id !== currentUser.id && !u.isFollowing);
}
