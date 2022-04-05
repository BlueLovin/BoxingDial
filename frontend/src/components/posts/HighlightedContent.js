import React from "react";
import { Link } from "react-router-dom";

export default function HighlightedContent({ post = {} }) {
  const regex = new RegExp("(@[0-9a-z]*)", "gi");
  const content = post.content;
  const parts = content.split(regex);
  const mentionedUsers = post.entities.mentioned_users.map((u) => u.username);
  console.log(mentionedUsers);

  return (
    <span>
      {parts.filter(String).map((word, i) => {
        const userMention = regex.test(word);
        
        // regular word
        if (!userMention) {
          return <span key={i}>{word}</span>;
        }

        // user mention
        const username = word.substring(1);
        const validUserMention = mentionedUsers.includes(username);
        if (validUserMention) {
          return (
            <Link to={`/user/${username}`} key={i}>
              {word}
            </Link>
          );
        } else {
          return <span key={i}>{word}</span>;
        }
      })}
    </span>
  );
}
