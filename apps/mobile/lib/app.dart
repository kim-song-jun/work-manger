import 'package:flutter/material.dart';

import 'web_shell.dart';

/// Root widget. Single screen: a full-bleed WebView host. The React SPA inside
/// owns its own router/navigation, so we don't ship MaterialApp routes here.
class WorkManagerApp extends StatelessWidget {
  const WorkManagerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Work Manager',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF1F6FEB)),
        useMaterial3: true,
        scaffoldBackgroundColor: Colors.white,
      ),
      home: const WebShellScreen(),
    );
  }
}
