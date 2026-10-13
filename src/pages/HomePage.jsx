import React from "react";

function HomePage() {

  const dakboardUrl = localStorage.getItem("touch-display.dakboardUrl");

  return (
    <main className="home-page" id="main">
      <iframe
        title="Home dashboard"
        src={dakboardUrl}
        className="dakboard-frame"
      ></iframe>
    </main> 
  );
}

export default HomePage;