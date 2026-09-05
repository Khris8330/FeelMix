import 'package:flutter/material.dart';

import '../models/movie.dart';
import '../theme/app_theme.dart';
import 'glass_container.dart';

class MovieCard extends StatelessWidget {
  final Movie movie;

  const MovieCard({super.key, required this.movie});

  @override
  Widget build(BuildContext context) {
    return GlassContainer(
      padding: const EdgeInsets.all(14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 90,
            height: 130,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              color: AppColors.surfaceElevated,
              image: movie.posterUrl.isNotEmpty
                  ? DecorationImage(
                      image: NetworkImage(movie.posterUrl),
                      fit: BoxFit.cover,
                    )
                  : null,
            ),
            child: movie.posterUrl.isEmpty
                ? const Icon(Icons.movie_outlined, color: AppColors.textSecondary, size: 32)
                : null,
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.secondary.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text(
                        'MOVIE',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: AppColors.secondary,
                          letterSpacing: 0.8,
                        ),
                      ),
                    ),
                    if (movie.voteAverage != null) ...[
                      const Spacer(),
                      Icon(Icons.star_rounded, size: 16, color: Colors.amber.shade400),
                      const SizedBox(width: 3),
                      Text(
                        movie.voteAverage!.toStringAsFixed(1),
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  movie.title,
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    height: 1.2,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                if (movie.releaseDate != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    movie.releaseDate!.length >= 4 ? movie.releaseDate!.substring(0, 4) : movie.releaseDate!,
                    style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                  ),
                ],
                const SizedBox(height: 8),
                Text(
                  movie.overview,
                  style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 13,
                    height: 1.35,
                  ),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
