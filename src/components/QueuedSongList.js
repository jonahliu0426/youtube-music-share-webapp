import { useMutation } from "@apollo/client";
import { Avatar, IconButton, makeStyles, Typography, useMediaQuery } from "@material-ui/core";
import { Delete } from "@material-ui/icons";
import React from "react";
import { ADD_OR_REMOVE_FROM_QUEUE } from "../graphql/mutation";


const useStyles = makeStyles(theme => ({
    avatar: {
        width: 44,
        height: 44,
    },
    text: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
    container: {
        display: 'grid',
        gridAutoFlow: 'column',
        gridTemplateColumns: '50px auto 50px',
        gridGap: 12,
        alignItems: 'center',
        marginTop: 10
    },
    songInfoContainer: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    }

}))


function QueuedSongList({ queue }) {
    const greaterThanMd = useMediaQuery(theme => theme.breakpoints.up("md"));


    return (
        greaterThanMd && (
            <div style={{ margin: '10px 0' }}>
                <Typography color="textSecondary">
                    QUEUE ({queue.length})
                </Typography>
                {queue.map((song, i) => (
                    <QueuedSong key={i} song={song} />
                ))}
            </div>
        ));
}

function QueuedSong({ song }) {
    const [addOrRemoveFromQueue] = useMutation(ADD_OR_REMOVE_FROM_QUEUE, {
        onCompleted: data => {
            localStorage.setItem('queue', JSON.stringify(data.addOrRemoveFromQueue))
        }
    })

    const classes = useStyles();
    const { title, artist, thumbnail } = song;

    function handleAddOrRemoveFromQueue() {
        addOrRemoveFromQueue({
            variables: { input: { ...song, __typename: 'Song' } }
        });
    }

    return (
        <div className={classes.container}>
            <Avatar classesName={classes.avatar} src={thumbnail} alt="Song thumbnail" />
            <div>
                <Typography classesName={classes.text} variant="subtitle2">
                    {title}
                </Typography>
                <Typography classesName={classes.text} variant="body2" color="textSecondary">
                    {artist}
                </Typography>
            </div>
            <IconButton onClick={handleAddOrRemoveFromQueue}>
                <Delete color="error" />
            </IconButton>
        </div>
    )
}

export default QueuedSongList;
