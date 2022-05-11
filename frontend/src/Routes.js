import { Switch, Route } from "react-router";
import Login from "./components/accounts/Login";
import Register from "./components/accounts/Register";
import PopularFights from "./components/fights/PopularFights";
import RecentFights from "./components/fights/RecentFights";
import ShowUser from "./components/navbar/ShowUser";
import PopularPosts from "./components/posts/PopularPosts";
import { NotFound } from "./NotFound404";
import FightPage from "./pages/fights/FightPage";
import Home from "./pages/home/HomePage";
import Comments from "./pages/posts/PostPage";
import ChatRoom from "./pages/chat/ChatPage";
import EditProfile from "./pages/profiles/EditProfile";
import Inbox from "./pages/profiles/Inbox";
import UserProfile from "./pages/profiles/UserProfile";

export default function Routes() {
  return (
    <Switch>
      <Route path="/" exact>
        <Home />
      </Route>

      <Route path="/post/:postID/:highlightCommentID?" exact>
        <Comments />
      </Route>

      <Route path="/posts/popular" exact>
        <PopularPosts />
      </Route>

      <Route path="/user/:username" exact>
        <UserProfile />
      </Route>

      <Route path="/edit-profile" exact>
        <EditProfile />
      </Route>

      <Route path="/inbox" exact>
        <Inbox />
      </Route>

      <Route path="/register" exact>
        <Register />
      </Route>

      <Route path="/login" exact>
        <Login />
      </Route>

      <Route path="/user" exact>
        <ShowUser />
      </Route>

      <Route path="/fight/:fightID" exact>
        <FightPage />
      </Route>

      <Route path="/fights/popular" exact>
        <PopularFights />
      </Route>

      <Route path="/fights/recent" exact>
        <RecentFights />
      </Route>

      
      <Route path="/chat/:userToContact" exact>
        <ChatRoom />
      </Route>

      <Route path="*" exact={true} component={NotFound} />
    </Switch>
  );
}
