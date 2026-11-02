export type User = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  postsCount: number;
  followersCount: number;
  vibesCount: number;
  isFollowing: boolean;
  verified?: boolean;
  statusEmoji?: string;
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
  reposts: number;
  likedByMe: boolean;
  repostedByMe?: boolean;
  vibe?: VibeEmbed;
  imageUrl?: string;
};

export type Story = {
  id: string;
  userId: string;
  seen: boolean;
  isOwn?: boolean;
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
    statusEmoji: '⚡',
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
    statusEmoji: '🌙',
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
  {
    id: 'u5',
    name: 'Mira Chen',
    handle: 'mirachen',
    avatar: 'https://i.pravatar.cc/150?u=mirachen',
    bio: 'Golden hour collector.',
    postsCount: 90,
    followersCount: 1500,
    vibesCount: 55,
    isFollowing: true,
  },
];

export const stories: Story[] = [
  { id: 's0', userId: 'u0', seen: true, isOwn: true },
  { id: 's1', userId: 'u3', seen: false },
  { id: 's2', userId: 'u4', seen: false },
  { id: 's3', userId: 'u5', seen: false },
  { id: 's4', userId: 'u2', seen: true },
];

export const posts: Post[] = [
  {
    id: 'p1',
    userId: 'u3',
    body: 'Some days feel like a playlist and a movie scene all at once. This is mine tonight.',
    createdAt: '2h ago',
    likes: 128,
    comments: 23,
    shares: 4,
    reposts: 6,
    likedByMe: false,
    vibe: {
      moodTitle: 'Saturn Nights',
      moodSubtitle: 'MY VIBE',
      trackName: 'Saturn Nights',
      trackArtist: 'beabadoobee',
      movieTitle: 'Lost in Translation',
      movieYear: '2003',
      movieDirector: 'Sofia Coppola',
      coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
    },
  },
  {
    id: 'p2',
    userId: 'u2',
    body: 'Finally watched something that hit different. Need more days like this.',
    createdAt: '5h ago',
    likes: 86,
    comments: 12,
    shares: 3,
    reposts: 5,
    likedByMe: true,
    vibe: {
      moodTitle: 'Alone Again',
      moodSubtitle: 'MY VIBE',
      trackName: 'Alone Again',
      trackArtist: 'The Weeknd',
      movieTitle: 'Moonlight',
      movieYear: '2016',
      movieDirector: 'Barry Jenkins',
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
    },
  },
  {
    id: 'p3',
    userId: 'u1',
    body: 'Some quiet evenings just hit different. This scene, this song. Exactly the mood I needed.',
    createdAt: '8h ago',
    likes: 124,
    comments: 18,
    shares: 7,
    reposts: 9,
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
    id: 'p4',
    userId: 'u5',
    body: 'Sunsets and silence. Nothing else needed.',
    createdAt: '1d ago',
    likes: 210,
    comments: 34,
    shares: 11,
    reposts: 14,
    likedByMe: false,
    imageUrl: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800',
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
