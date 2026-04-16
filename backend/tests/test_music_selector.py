from app.services.adapters.music_selector import MockMusicSelectorAdapter


def test_music_selector_prefers_birthday_track():
    adapter = MockMusicSelectorAdapter()

    track = adapter.select_track("Je veux une story pour un anniversaire", None)

    assert track.name == "Birthday"
    assert track.external_url.endswith(track.track_id)


def test_music_selector_returns_fallback_track():
    adapter = MockMusicSelectorAdapter()

    track = adapter.select_track("A calm generic moment", None)

    assert track.name == "Take On Me"

