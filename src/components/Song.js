import { useMutation } from "@apollo/client";
import {
    Card,
    CardActions,
    CardContent,
    CardMedia,
    IconButton,
    makeStyles,
    Typography
} from "@material-ui/core";
import { Delete, Pause, PlayArrow, Save } from "@material-ui/icons";
import React from "react";
import { SongContext } from "../App";
import { ADD_OR_REMOVE_FROM_QUEUE, DELETE_SONG } from "../graphql/mutation";
// import songReducer from "../reducer";

const useStyles = makeStyles(theme => ({
    container: {
        margin: theme.spacing(3)
    },
    songInfoContainer: {
        display: 'flex',
        alignItems: 'center'
    },
    songInfo: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
    },
    thumbnail: {
        objectFit: 'cover',
        width: 140,
        height: 140,
    }
}))


export default function Song({ song }) {
    const { state, dispatch } = React.useContext(SongContext)
    const [currentSongPlaying, setCurrentSongPlaying] = React.useState(false);
    const classes = useStyles();
    const { id, thumbnail, title, artist } = song
    const [addOrRemoveFromQueue] = useMutation(ADD_OR_REMOVE_FROM_QUEUE, {
        onCompleted: data => {
            localStorage.setItem('queue', JSON.stringify(data.addOrRemoveFromQueue))
        }
    })

    const [deleteFromList] = useMutation(DELETE_SONG);

    React.useEffect(() => {
        console.log(id === state.song.id);
        const isSongPlaying = state.isPlaying && id === state.song.id;
        setCurrentSongPlaying(isSongPlaying);
    }, [id, state.song.id, state.isPlaying])

    function handleTogglePlay() {
        console.log('song', song)
        dispatch({ type: "SET_SONG", payload: { song } });
        dispatch(state.isPlaying ? { type: "PAUSE_SONG" } : { type: "PLAY_SONG" })
    }

    function handleAddOrRemoveFromQueue() {
        addOrRemoveFromQueue({
            variables: { input: { ...song, __typename: 'Song' } }
        });
    }

    async function handleAddOrRemoveFromList() {
        try {
            await deleteFromList({
                variables: {
                    id: song.id.length > 0 && song.id
                }
            })
        } catch (error) {
            console.error('Error deleting song from list', error);
        }
    }

    return (
        <Card className={classes.container}>
            <div className={classes.songInfoContainer}>
                <CardMedia className={classes.thumbnail} image={thumbnail} />
                <div className={classes.songInfo}>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="h2">
                            {title}
                        </Typography>
                        <Typography variant="body1" component="p" color="textSecondary">
                            {artist}
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <IconButton onClick={handleTogglePlay} size="small" color="primary">
                            {currentSongPlaying ? <Pause /> : <PlayArrow />}
                        </IconButton>
                        <IconButton onClick={handleAddOrRemoveFromQueue} size="small" color="secondary">
                            <Save />
                        </IconButton>
                        <IconButton onClick={handleAddOrRemoveFromList} size="small" color="secondary">
                            <Delete color="error" />
                        </IconButton>
                    </CardActions>

                </div>
            </div>
        </Card>
    )
}