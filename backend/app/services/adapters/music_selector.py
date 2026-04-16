from __future__ import annotations

from dataclasses import dataclass

from app.models.spotify_connection import SpotifyConnection


@dataclass
class SelectedTrack:
    track_id: str
    name: str
    artist: str
    external_url: str
    embed_url: str
    album_art_url: str


class MockMusicSelectorAdapter:
    def select_track(self, context_text: str, _: SpotifyConnection | None) -> SelectedTrack:
        normalized = context_text.lower()

        if "anniversaire" in normalized or "birthday" in normalized:
            return self._track(
                "7iN1s7xHE4ifF5povM6A48",
                "Birthday",
                "Disclosure, Kehlani, Syd",
                "https://i.scdn.co/image/ab67616d0000b273648cf2f0e978c5d5a4ef0b2b",
            )
        if "souvenir" in normalized or "memory" in normalized:
            return self._track(
                "3AJwUDP919kvQ9QcozQPxg",
                "Yellow",
                "Coldplay",
                "https://i.scdn.co/image/ab67616d0000b2736e63d7d431d0e1cf4b08ab1b",
            )
        if "amis" in normalized or "friends" in normalized or "sortie" in normalized:
            return self._track(
                "2takcwOaAZWiXQijPHIx7B",
                "Dreams",
                "Fleetwood Mac",
                "https://i.scdn.co/image/ab67616d0000b273e3e3b64cea452c2f1d9c24f5",
            )

        return self._track(
            "4iV5W9uYEdYUVa79Axb7Rh",
            "Take On Me",
            "a-ha",
            "https://i.scdn.co/image/ab67616d0000b273fc5471d61dbe3d0cb2643833",
        )

    def _track(self, track_id: str, name: str, artist: str, album_art_url: str) -> SelectedTrack:
        return SelectedTrack(
            track_id=track_id,
            name=name,
            artist=artist,
            external_url=f"https://open.spotify.com/track/{track_id}",
            embed_url=f"https://open.spotify.com/embed/track/{track_id}",
            album_art_url=album_art_url,
        )

