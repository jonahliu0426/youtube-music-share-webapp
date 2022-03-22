import { useMutation } from "@apollo/client";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputAdornment,
    Link,
    TextField,
    makeStyles,
} from "@material-ui/core";
import { AddBoxOutlined } from "@material-ui/icons";
import React from "react";
import ReactPlayer from "react-player";
// import SoundCloudPlayer from "react-player/lib/players/SoundCloud";
import YouTubePlayer from "react-player/lib/players/YouTube";
import { ADD_SONG } from "../graphql/mutation";


const DEFAULT_SONG_STATE = {
    duration: null,
    title: "",
    artist: "",
    thumbnail: "",
}

const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        alignItems: 'center',
    },
    urlInput: {
        margin: theme.spacing(1)
    },
    addSongButton: {
        margin: theme.spacing(1)
    },
    dialog: {
        textAlign: 'center',
    },
    thumbnail: {
        width: '90%'
    }
}))

function AddSong() {
    const [url, setUrl] = React.useState('');
    const [playable, setPlayable] = React.useState(false);
    const [dialog, setDialog] = React.useState(false);
    const classes = useStyles();
    const [song, setSong] = React.useState(DEFAULT_SONG_STATE)
    const [addSong, { error }] = useMutation(ADD_SONG);

    // isPlayable to control add button, 
    // if isPlayable is true, click function is enabled,
    // else disabled
    React.useEffect(() => {
        const isPlayable = YouTubePlayer.canPlay(url);
        setPlayable(isPlayable);
    }, [url])

    function handleChangeSong(event) {
        event.preventDefault();
        const { name, value } = event.target;
        setSong(prevSong => ({
            ...prevSong,
            [name]: value,
        }))
    }

    async function handleAddSong() {
        try {
            const { title, artist, duration, url, thumbnail } = song;
            await addSong({
                variables: {
                    url: url.length > 0 ? url : null,
                    title: title.length > 0 ? title : null,
                    artist: artist.length > 0 ? artist : null,
                    duration: duration > 0 ? duration : null,
                    thumbnail: thumbnail.length > 0 ? thumbnail : null,
                }
            })
            handleCloseDialog();
            setSong(DEFAULT_SONG_STATE);
            setUrl('');
        } catch (error) {
            console.error('Error adding song', error);
        }

    }

    function handleCloseDialog() {
        setDialog(false)
    }

    async function handleEditSong({ player }) {
        const nestedPlayer = player.player.player;
        let songData;
        if (nestedPlayer.getVideoData) {
            songData = getYoutubeInfo(nestedPlayer);
        } else if (nestedPlayer.getCurrentSound) {
            songData = await getSoundCloudInfo(nestedPlayer);
        }
        setSong({ ...songData, url });
    }

    function getYoutubeInfo(player) {
        const duration = player.getDuration();
        const { title, video_id, author } = player.getVideoData();
        const thumbnail = `http://img.youtube.com/vi/${video_id}/0.jpg`;
        return {
            duration,
            title,
            artist: author,
            thumbnail,
        }
    }

    function getSoundCloudInfo(player) {
        return new Promise(resolve => {
            player.getCurrentSound(songData => {
                if (songData) {
                    resolve({
                        duration: Number(songData.duration / 1000),
                        title: songData.title,
                        artist: songData.user.username,
                        thumbnail: songData.artwork_url.replace('-large', '-t500x500')
                    })
                }
            })
        })
    }

    function handleError(field) {
        return error?.graphQLErrors[0]?.extensions?.path?.includes(field);
    }

    const { title, thumbnail, artist } = song;
    return (
        <div className={classes.container}>
            <Dialog
                open={dialog}
                onClose={handleCloseDialog}
                className={classes.dialog}
            >
                <DialogTitle>Edit Song</DialogTitle>
                <DialogContent>
                    <img src={thumbnail}
                        alt="Song thumnail"
                        className={classes.thumbnail}
                    />
                    <TextField
                        value={title}
                        onChange={handleChangeSong}
                        margin="dense"
                        name="title"
                        label="Title"
                        fullWidth
                        error={handleError('title')}
                        helperText={handleError('title') && 'Fill out field'}
                    />
                    <TextField
                        value={artist}
                        onChange={handleChangeSong}
                        margin="dense"
                        name="artist"
                        label="Artist"
                        fullWidth
                        error={handleError('artist')}
                        helperText={handleError('artist') && 'Fill out field'}
                    />
                    <TextField
                        value={thumbnail}
                        onChange={handleChangeSong}
                        margin="dense"
                        name="thumbnail"
                        label="thumbnail link"
                        fullWidth
                        error={handleError('thumbnail')}
                        helperText={handleError('thumbnail') && 'Fill out field'}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="secondary">Cancel</Button>
                    <Button onClick={handleAddSong} variant="outlined" color="primary">Add Song</Button>
                </DialogActions>
            </Dialog>
            <TextField
                className={classes.urlInput}
                placeholder="Add Youtube or Songcloud url"
                onChange={event => setUrl(event.target.value)}
                value={url}
                fullWidth
                margin="normal"
                type="url"
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Link />
                        </InputAdornment>
                    )
                }}
            />
            <Button
                disabled={!playable}
                className={classes.addSongButton}
                onClick={() => setDialog(true)}
                variant="contained"
                color="primary"
                endIcon={<AddBoxOutlined />}
            >
                Add
            </Button>
            <ReactPlayer url={url} hidden onReady={handleEditSong} />
        </div>
    );
}

export default AddSong;
