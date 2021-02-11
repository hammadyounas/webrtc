import React from "react";
import Socket from "socket.io-client";

// import { STRAPI_DEVELOPMENT, STRAPI_PRODUCTION } from "../../constants/Api";

const socket = Socket(
    'http://localhost:8080',
);

export const withSocket = (Component) => {
  return class extends React.Component {
    render() {
      return <Component {...this.props} socket={socket} />;
    }
  };
};
