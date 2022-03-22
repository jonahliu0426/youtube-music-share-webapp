import React from "react";
import AddSong from "./components/AddSong";
import Header from "./components/Header";
import SongList from "./components/SongList";
import SongPlayer from "./components/SongPlayer";
import { Grid, useMediaQuery, Hidden } from "@material-ui/core";
import songReducer from "./reducer";

// context 
export const SongContext = React.createContext({
  song: {
    id: null,
    title: null,
    artist: null,
    thumbnail: null,
    url: null,
    duration: 0,
  },
  isPlaying: false
})

function App() {
  const initialSongState = React.useContext(SongContext);
  const [state, dispatch] = React.useReducer(songReducer, initialSongState);
  const greaterThanMd = useMediaQuery(theme => theme.breakpoints.up("md"));
  const greaterThanSm = useMediaQuery(theme => theme.breakpoints.up("sm"))

  return (
    <SongContext.Provider value={{ state, dispatch }}>
      <Hidden only="xs">
        <Header />
      </Hidden>
      <Grid container={true} spacing={3}>
        <Grid
          style={{
            paddingTop: greaterThanSm ? 80 : 10,
            paddingBottom: greaterThanMd ? 0 : 212
          }}
          item xs={12} md={7}>
          <AddSong />
          <SongList />
        </Grid>
        <Grid item xs={12} md={5}
          style={greaterThanMd ? {
            position: 'fixed',
            width: '100%',
            top: 70,
            right: 0
          } : {
            position: 'fixed',
            width: '100%',
            left: 0,
            bottom: 0
          }}>
          <SongPlayer />
        </Grid>
      </Grid>
    </SongContext.Provider>
  );
}

export default App;
