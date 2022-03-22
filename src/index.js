import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import theme from './theme';
import { MuiThemeProvider, CssBaseline } from '@material-ui/core';
import { ApolloProvider } from "@apollo/client";
import client from "./graphql/client";

ReactDOM.render(
  <ApolloProvider client={client}>
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </MuiThemeProvider>
  </ApolloProvider>,
  document.getElementById('root')
);
