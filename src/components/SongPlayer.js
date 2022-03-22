import { Card, CardContent, CardMedia, IconButton, makeStyles, Slider, Typography } from "@material-ui/core";
import { PlayArrow, SkipNext, SkipPrevious, Pause, VolumeDown, VolumeUp } from "@material-ui/icons";
import React from "react";
import { SongContext } from "../App";
import QueuedSongList from "./QueuedSongList";
// import songReducer from "../reducer";
import { useQuery } from "@apollo/client";
import { GET_QUEUED_SONGS } from "../graphql/queries";
import ReactPlayer from "react-player";
import { Stack } from "@mui/material";


const useStyles = makeStyles(theme => ({
    container: {
        display: "flex",
        justifyContent: "space-between"
    },
    details: {
        display: "flex",
        flexDirection: "column",
        padding: "0px 15px"
    },
    content: {
        flex: "1 0 auto"
    },
    thumbnail: {
        width: 150
    },
    controls: {
        display: "flex",
        alignItems: "center",
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1)
    },
    playIcon: {
        height: 38,
        width: 38
    }
}));

function SongPlayer() {
    const { state, dispatch } = React.useContext(SongContext);
    const { data } = useQuery(GET_QUEUED_SONGS);
    const classes = useStyles();
    const [played, setPlayed] = React.useState(0);
    const [playedSeconds, setPlayedSeconds] = React.useState(0);
    const [seeking, setSeeking] = React.useState(false);
    const [positionInQueue, setPositionInQueue] = React.useState(0);
    const reactPlayerRef = React.useRef();
    const [volume, setVolume] = React.useState(0.5);

    React.useEffect(() => {
        const songIndex = data.queue.findIndex(song => song.id === state.song.id);
        setPositionInQueue(songIndex);
    }, [data.queue, state.song.id])

    React.useEffect(() => {
        const nextSong = data.queue[positionInQueue + 1];
        if (played >= 0.99 && nextSong) {
            setPlayed(0);
            dispatch({ type: "SET_SONG", payload: { song: nextSong } })
        }
    }, [data.queue, played, dispatch, positionInQueue])

    function handleTogglePlay() {
        dispatch(state.isPlaying ? { type: "PAUSE_SONG" } : { type: "PLAY_SONG" });
    }

    function handleProgressChange(event, newValue) {
        setPlayed(newValue);
    }

    function handleVolumeChange(event, newValue) {
        setVolume(newValue);
    }

    function handleSeekMouseDown() {
        setSeeking(true);
    }

    function handleSeekMouseUp() {
        setSeeking(false);
        reactPlayerRef.current.seekTo(played);
    }

    function handlePlayPrevSong() {
        const prevSong = data.queue[positionInQueue - 1];
        if (prevSong) {
            dispatch({ type: "SET_SONG", payload: { song: prevSong } });
        }
    }

    function handlePlayNextSong() {
        const nextSong = data.queue[positionInQueue + 1];
        if (nextSong) {
            dispatch({ type: "SET_SONG", payload: { song: nextSong } });
        }
    }

    function formatDuration(seconds) {
        return new Date(seconds * 1000).toISOString().substr(11, 8);
    }

    return (
        <>
            <Card variant="outlined" className={classes.container}>
                <div className={classes.details}>
                    <CardContent className={classes.content}>
                        <Typography variant="h5" component="h3">
                            {state.song.title || data.queue && data.queue[0]?.title}
                        </Typography>
                        <Typography variant="subtitle1" component="p" color="textSecondary">
                            {state.song.artist || data.queue && data.queue[0]?.artist}
                        </Typography>
                    </CardContent>
                    <div className={classes.controls}>
                        <IconButton onClick={handlePlayPrevSong}>
                            <SkipPrevious />
                        </IconButton>
                        <IconButton onClick={handleTogglePlay}>
                            {state.isPlaying ? (
                                <Pause className={classes.playIcon} />
                            ) : (
                                <PlayArrow className={classes.playIcon} />
                            )}
                        </IconButton>
                        <IconButton onClick={handlePlayNextSong}>
                            <SkipNext />
                        </IconButton>
                        <Typography variant="subtitle1" component="p" color="textSecondary">
                            {formatDuration(playedSeconds)}
                        </Typography>
                    </div>
                    <Slider
                        onMouseDown={handleSeekMouseDown}
                        onMouseUp={handleSeekMouseUp}
                        onChange={handleProgressChange}
                        value={played}
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                    />
                    <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
                        <VolumeDown />
                        <Slider aria-label="Volume"
                            min={0}
                            max={1}
                            step={0.01}
                            value={volume}
                            onChange={handleVolumeChange} />
                        <VolumeUp />
                    </Stack>
                </div>
                <ReactPlayer
                    ref={reactPlayerRef}
                    onProgress={({ played, playedSeconds }) => {
                        if (!seeking) {
                            setPlayed(played);
                            setPlayedSeconds(playedSeconds);
                        }
                    }}
                    hidden
                    url={state.song.url}
                    playing={state.isPlaying}
                    volume={volume}
                />
                <CardMedia
                    className={classes.thumbnail}
                    image={state.song.thumbnail || data.queue && data.queue[0]?.thumbnail}
                />
            </Card>
            <QueuedSongList queue={data.queue} />
        </>
    );
}

export default SongPlayer;
