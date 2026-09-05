class Track {
  final String id;
  final String name;
  final String artist;
  final String? album;
  final String? imageUrl;
  final String? url;
  final List<String> tags;

  const Track({
    required this.id,
    required this.name,
    required this.artist,
    this.album,
    this.imageUrl,
    this.url,
    this.tags = const [],
  });

  factory Track.fromLastFm(Map<String, dynamic> json) {
    final images = json['image'] as List? ?? [];
    String? imageUrl;
    for (final img in images.reversed) {
      final text = img['#text'] as String? ?? '';
      if (text.isNotEmpty) {
        imageUrl = text;
        break;
      }
    }

    final artistRaw = json['artist'];
    String artistName;
    if (artistRaw is Map) {
      artistName = artistRaw['name'] as String? ?? artistRaw['#text'] as String? ?? 'Unknown';
    } else if (artistRaw is String) {
      artistName = artistRaw;
    } else {
      artistName = 'Unknown';
    }

    return Track(
      id: json['mbid'] as String? ?? '${json['name']}-$artistName',
      name: json['name'] as String? ?? 'Unknown',
      artist: artistName,
      album: (json['album'] is Map) ? (json['album']['#text'] as String?) : null,
      imageUrl: imageUrl,
      url: json['url'] as String?,
      tags: [],
    );
  }

  factory Track.mock({
    String name = 'Motion Picture Soundtrack',
    String artist = 'Radiohead',
  }) {
    return Track(
      id: 'mock-track',
      name: name,
      artist: artist,
      album: 'Kid A',
      imageUrl: null,
      url: null,
      tags: ['alternative', 'melancholy', 'atmospheric'],
    );
  }
}
