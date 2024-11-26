# VideoPsalm to plain text
Web App to check if a song is present in VideoPsalm or verify the content of its files without opening the program.

## Features
- [x] rclone + cron to sync .json files from VideoPsalm with Google Drive 
- [x] web UI to display synced files
- [x] file picker + drag and drop
- [ ] fuzzy search

### Usage
SongBooks folder on Google Drive is synced periodically to always have the most recent files available. The operation of converting those files or user-picked ones is done on the client's browser.
