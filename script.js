const audio = document.getElementById('audio');
const titleElement = document.getElementById('title');
const artistElement = document.getElementById('artist');
const coverImage = document.getElementById('cover');
const playButton = document.getElementById('play-btn');
const prevButton = document.getElementById('prev-btn');
const nextButton = document.getElementById('next-btn');
const progressContainer = document.getElementById('progress-container');
const progress = document.getElementById('progress');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const volumeControl = document.getElementById('volume');
const playlistElement = document.getElementById('playlist');
const newTitleInput = document.getElementById('new-title');
const newArtistInput = document.getElementById('new-artist');
const newUrlInput = document.getElementById('new-url');
const newFileInput = document.getElementById('new-file');
const addSongButton = document.getElementById('add-song-btn');
const statusMessage = document.getElementById('status');

const songs = [
  {
    title: 'SoundHelix Song 1',
    artist: 'SoundHelix',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    cover: 'https://images.unsplash.com/photo-1511376777868-611b54f68947?auto=format&fit=crop&w=600&q=80'
  },
  {
    title: 'SoundHelix Song 2',
    artist: 'SoundHelix',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    cover: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80'
  },
  {
    title: 'SoundHelix Song 3',
    artist: 'SoundHelix',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    cover: 'https://images.unsplash.com/photo-1495562569060-2eec283d3391?auto=format&fit=crop&w=600&q=80'
  },
  {
    title: 'SoundHelix Song 4',
    artist: 'SoundHelix',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    cover: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=600&q=80'
  },
  {
    title: 'SoundHelix Song 5',
    artist: 'SoundHelix',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80'
  }
];

let songIndex = 0;
let isPlaying = false;

function loadSong(index) {
  const song = songs[index];
  titleElement.textContent = song.title;
  artistElement.textContent = song.artist;
  coverImage.src = song.cover;
  audio.src = song.src;
  statusMessage.textContent = 'Ready to play: ' + song.title;
  updatePlaylistUI();
}

function playSong() {
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch((error) => {
      console.error('Audio play failed:', error);
      statusMessage.textContent = 'Unable to play audio. Check the track source or browser settings.';
    });
  }
  isPlaying = true;
  playButton.textContent = '❚❚';
  playButton.title = 'Pause';
}

function pauseSong() {
  audio.pause();
  isPlaying = false;
  playButton.textContent = '▶';
  playButton.title = 'Play';
}

function prevSong() {
  songIndex = (songIndex - 1 + songs.length) % songs.length;
  loadSong(songIndex);
  playSong();
}

function nextSong() {
  songIndex = (songIndex + 1) % songs.length;
  loadSong(songIndex);
  playSong();
}

function updateProgress() {
  if (!audio.duration) return;
  const percent = (audio.currentTime / audio.duration) * 100;
  progress.style.width = `${percent}%`;
  currentTimeEl.textContent = formatTime(audio.currentTime);
}

function setProgress(e) {
  const width = this.clientWidth;
  const clickX = e.offsetX;
  const newTime = (clickX / width) * audio.duration;
  audio.currentTime = newTime;
}

function setVolume(e) {
  audio.volume = e.target.value;
}

function formatTime(time) {
  const minutes = Math.floor(time / 60) || 0;
  const seconds = Math.floor(time % 60) || 0;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function updatePlaylistUI() {
  const items = playlistElement.querySelectorAll('.playlist-item');
  items.forEach((item, index) => {
    item.classList.toggle('active', index === songIndex);
  });
}

function removeSong(removeIndex) {
  if (removeIndex < 0 || removeIndex >= songs.length) return;
  const removedSong = songs.splice(removeIndex, 1)[0];

  if (songIndex === removeIndex) {
    if (songs.length > 0) {
      songIndex = removeIndex >= songs.length ? 0 : removeIndex;
      loadSong(songIndex);
      if (isPlaying) playSong();
    } else {
      audio.src = '';
      titleElement.textContent = 'No song selected';
      artistElement.textContent = '';
      coverImage.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80';
      progress.style.width = '0%';
      durationEl.textContent = '0:00';
      currentTimeEl.textContent = '0:00';
      statusMessage.textContent = 'Playlist is empty. Add a song to start.';
      isPlaying = false;
      playButton.textContent = '▶';
    }
  } else if (songIndex > removeIndex) {
    songIndex -= 1;
  }

  buildPlaylist();
  statusMessage.textContent = `Removed "${removedSong.title}" from playlist.`;
}

function addSong() {
  const url = newUrlInput.value.trim();
  const file = newFileInput.files[0];
  if (!url && !file) {
    statusMessage.textContent = 'Please enter a remote URL or choose an audio file.';
    return;
  }

  const title = newTitleInput.value.trim() || (file ? file.name.replace(/\.[^.]+$/, '') : 'Remote song');
  const artist = newArtistInput.value.trim() || 'Unknown Artist';
  const song = {
    title,
    artist,
    src: url || URL.createObjectURL(file),
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80'
  };

  songs.push(song);
  buildPlaylist();
  songIndex = songs.length - 1;
  loadSong(songIndex);
  playSong();
  statusMessage.textContent = `Added "${title}" to playlist.`;
  newTitleInput.value = '';
  newArtistInput.value = '';
  newUrlInput.value = '';
  newFileInput.value = '';
}

function buildPlaylist() {
  playlistElement.innerHTML = '';
  songs.forEach((song, index) => {
    const trackItem = document.createElement('li');
    trackItem.className = 'playlist-item';
    trackItem.innerHTML = `
      <div>
        <p class="playlist-item-title">${song.title}</p>
        <p class="playlist-item-artist">${song.artist}</p>
      </div>
      <div class="playlist-item-actions">
        <button class="remove-btn" type="button">Remove</button>
      </div>
    `;

    const removeBtn = trackItem.querySelector('.remove-btn');
    removeBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      removeSong(index);
    });

    trackItem.addEventListener('click', () => {
      songIndex = index;
      loadSong(songIndex);
      playSong();
    });
    playlistElement.appendChild(trackItem);
  });
}

playButton.addEventListener('click', () => {
  if (isPlaying) {
    pauseSong();
  } else {
    playSong();
  }
});

prevButton.addEventListener('click', prevSong);
nextButton.addEventListener('click', nextSong);

audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('loadedmetadata', () => {
  durationEl.textContent = formatTime(audio.duration);
  currentTimeEl.textContent = formatTime(audio.currentTime);
});
audio.addEventListener('ended', nextSong);
audio.addEventListener('error', () => {
  statusMessage.textContent = 'Audio source error. Try another track or use a local MP3 file.';
});

progressContainer.addEventListener('click', setProgress);
volumeControl.addEventListener('input', setVolume);
addSongButton.addEventListener('click', addSong);

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    if (isPlaying) pauseSong(); else playSong();
  }
  if (event.code === 'ArrowRight') nextSong();
  if (event.code === 'ArrowLeft') prevSong();
});

buildPlaylist();
loadSong(songIndex);
audio.volume = Number(volumeControl.value);
