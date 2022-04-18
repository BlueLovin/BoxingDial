import React from "react";
import { Link } from "react-router-dom";

export default function HighlightedContent({ content = "", userList = [] }) {
  const regex = /(@[0-9a-z]*)/gi;
  const parts = content.split(regex);
  const mentionedUsers = userList.map((u) => u.username);
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
