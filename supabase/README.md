# Supabase Schema & Migrations

## Resources
- Bucket: `images` (public)
- Tables: `analyses`, `feedback`, `likes`

## Migrations
Apply in order:
1. 0001_init.sql
2. 0002_feedback_likes.sql

## Policies
Current policies are permissive (public read/insert) for rapid prototyping. Before production:
- Restrict insert to authenticated users.
- Add rate limits or server-side checks.
- Consider separating anonymous session tracking.

## Potential Enhancements
- Add materialized view for top analyses (likes per recent window).
- Add trigger to maintain like counts in `analyses` (cached score).
- Add moderation flags (nsfw, flagged, hidden).
