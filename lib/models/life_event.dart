class LifeEvent {
  final String id;
  final String label;
  final String emoji;
  final String promptHint;

  const LifeEvent({
    required this.id,
    required this.label,
    required this.emoji,
    required this.promptHint,
  });

  static const List<LifeEvent> presets = [
    LifeEvent(
      id: 'heartbreak',
      label: 'Heartbreak',
      emoji: '💔',
      promptHint: 'just went through a breakup, feeling raw and lonely',
    ),
    LifeEvent(
      id: 'new_job',
      label: 'New Job',
      emoji: '🚀',
      promptHint: 'starting a new job, excited and a bit nervous',
    ),
    LifeEvent(
      id: 'late_night',
      label: 'Late Night',
      emoji: '🌙',
      promptHint: 'up late, reflective and a little melancholic',
    ),
    LifeEvent(
      id: 'celebration',
      label: 'Celebration',
      emoji: '🎉',
      promptHint: 'celebrating a win, high energy and grateful',
    ),
    LifeEvent(
      id: 'sunday_scaries',
      label: 'Sunday Scaries',
      emoji: '😰',
      promptHint: 'sunday evening anxiety before the work week',
    ),
    LifeEvent(
      id: 'rainy_day',
      label: 'Rainy Day',
      emoji: '🌧️',
      promptHint: 'cozy rainy day, wanting something soft and atmospheric',
    ),
  ];
}
