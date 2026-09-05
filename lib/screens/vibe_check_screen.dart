import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/life_event.dart';
import '../providers/vibe_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/equalizer_logo.dart';
import '../widgets/life_event_chip.dart';
import '../widgets/vibe_input_bar.dart';
import 'mix_result_screen.dart';

class VibeCheckScreen extends StatefulWidget {
  const VibeCheckScreen({super.key});

  @override
  State<VibeCheckScreen> createState() => _VibeCheckScreenState();
}

class _VibeCheckScreenState extends State<VibeCheckScreen> {
  final _controller = TextEditingController();
  LifeEvent? _selectedEvent;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final provider = context.read<VibeProvider>();
    final text = _controller.text.trim();

    await provider.analyzeVibe(text, lifeEvent: _selectedEvent);

    if (!mounted) return;
    if (provider.result != null) {
      Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => const MixResultScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<VibeProvider>();

    return Scaffold(
      backgroundColor: AppColors.bg,
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(24, 32, 24, 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Center(child: EqualizerLogo()),
                    const SizedBox(height: 28),
                    Text(
                      'How are you feeling?',
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.8,
                          ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Type a vibe, drop an emoji, or tap a life event',
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 15,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 32),
                    Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      alignment: WrapAlignment.center,
                      children: LifeEvent.presets.map((event) {
                        final selected = _selectedEvent?.id == event.id;
                        return LifeEventChip(
                          event: event,
                          selected: selected,
                          onTap: () {
                            setState(() {
                              _selectedEvent = selected ? null : event;
                            });
                          },
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
              child: VibeInputBar(
                controller: _controller,
                enabled: !provider.isLoading,
                onSubmit: _submit,
              ),
            ),
            if (provider.isLoading)
              const LinearProgressIndicator(
                minHeight: 2,
                backgroundColor: Colors.transparent,
              ),
          ],
        ),
      ),
    );
  }
}
