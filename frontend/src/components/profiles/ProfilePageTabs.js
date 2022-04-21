import React from "react";
import ProfileComments from "../../components/profiles/ProfileComments";
import {
  Nav,
  NavItem,
  TabContent,
  TabPane,
  NavLink,
  Container,
} from "reactstrap";
export function ProfilePageTabs({
  activeTab,
  setActiveTab,
  renderProfilePosts,
  username,
  renderProfileFollowing,
  renderProfileFollowers,
}) {
  return (
    <>
      <Nav tabs className="justify-content-center">
        <NavItem>
          <NavLink
            className={activeTab === "1" ? "active" : ""}
            onClick={() => setActiveTab("1")}
          >
            Posts
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={activeTab === "2" ? "active" : ""}
            onClick={() => setActiveTab("2")}
          >
            Comments and Replies
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={activeTab === "3" ? "active" : ""}
            onClick={() => setActiveTab("3")}
          >
            Following
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={activeTab === "4" ? "active" : ""}
            onClick={() => setActiveTab("4")}
          >
            Followers
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={activeTab}>
        <TabPane tabId="1">
          <Container>{renderProfilePosts()}</Container>
        </TabPane>
        <TabPane tabId="2">
          {activeTab === "2" ? <ProfileComments username={username} /> : null}
        </TabPane>
        <TabPane tabId="3">{renderProfileFollowing()}</TabPane>
        <TabPane tabId="4">{renderProfileFollowers()}</TabPane>
      </TabContent>
    </>
  );
}
