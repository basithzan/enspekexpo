import React from "react";
import TopBar from "../../components/TopBar/TopBar";
import TabNavigatorClient from "../../components/TabNavigatorClient";
import SingleNotification from "../../components/LatestNotification/SingleNotification/SingleNotification";
import TabNavigatorInspector from "../../components/TabNavigatorInspector";

const LatestNotification = () => {
  return (
    <>
      <TopBar title={"Latest Notifications"} show_back />
      <div className="grid gap-3">
        <SingleNotification/>
        <SingleNotification/>
        <SingleNotification/>
      </div>

      <TabNavigatorInspector current={"home"} />
    </>
  );
};

export default LatestNotification;
