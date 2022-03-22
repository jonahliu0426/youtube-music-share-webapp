import { useSubscription } from "@apollo/client";
import {
    CircularProgress,
} from "@material-ui/core";
import React from "react";
import { GET_SONGS } from "../graphql/subscriptions";
import Song from "./Song";


function SongList() {
    const { data, loading, error } = useSubscription(GET_SONGS);


    if (loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: 50,
                }}
            >
                <CircularProgress />
            </div>
        )
    }

    if (error) {
        console.dir(error)
        return (
            <div>Error fetching songs</div>
        )
    }

    return (
        <div>
            {data.songs.map(song => (
                <Song key={song.id} song={song} />
            ))}
        </div>
    );
}

export default SongList;



