class Movie {
  final String id;
  final String title;
  final String overview;
  final String? posterPath;
  final double? voteAverage;
  final String? releaseDate;
  final List<String> genres;

  const Movie({
    required this.id,
    required this.title,
    required this.overview,
    this.posterPath,
    this.voteAverage,
    this.releaseDate,
    this.genres = const [],
  });

  String get posterUrl {
    if (posterPath == null || posterPath!.isEmpty) {
      return '';
    }
    if (posterPath!.startsWith('http')) return posterPath!;
    return 'https://image.tmdb.org/t/p/w500$posterPath';
  }

  factory Movie.fromTmdb(Map<String, dynamic> json) {
    return Movie(
      id: json['id'].toString(),
      title: json['title'] as String? ?? json['name'] as String? ?? 'Unknown',
      overview: json['overview'] as String? ?? '',
      posterPath: json['poster_path'] as String?,
      voteAverage: (json['vote_average'] as num?)?.toDouble(),
      releaseDate: json['release_date'] as String? ?? json['first_air_date'] as String?,
      genres: (json['genre_ids'] as List?)?.map((e) => e.toString()).toList() ?? [],
    );
  }

  factory Movie.mock({
    String title = 'Eternal Sunshine of the Spotless Mind',
    String overview =
        'A couple undergoes a procedure to erase each other from their memories when their relationship turns sour.',
  }) {
    return Movie(
      id: 'mock-movie',
      title: title,
      overview: overview,
      posterPath: null,
      voteAverage: 8.3,
      releaseDate: '2004-03-19',
      genres: ['Romance', 'Sci-Fi', 'Drama'],
    );
  }
}
