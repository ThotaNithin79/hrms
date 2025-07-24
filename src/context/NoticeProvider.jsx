import React, { useState } from "react";
import { NoticeContext } from "./NoticeContext";

const initialNotices = [
  {
    id: 1,
    title: "Welcome to HRMS!",
    message: "This is your new HRMS portal. Please update your profile information.",
    date: "2025-07-22",
    author: "Admin",
  },
];

export const NoticeProvider = ({ children }) => {
  const [notices, setNotices] = useState(initialNotices);

  // Always keep notices sorted by date descending (latest first)
  const getSortedNotices = (arr) => {
    return [...arr].sort((a, b) => {
      // Compare by date (ISO string), fallback to id
      if (a.date && b.date) {
        return new Date(b.date) - new Date(a.date);
      }
      return b.id - a.id;
    });
  };

  const addNotice = (title, message, author = "Admin") => {
    const newNotice = {
      id: Date.now(),
      title,
      message,
      date: new Date().toISOString().slice(0, 10),
      author,
    };
    setNotices(prev => getSortedNotices([...prev, newNotice]));
  };

  const editNotice = (id, newTitle, newMessage) => {
    setNotices(prev => getSortedNotices(
      prev.map((n) =>
        n.id === id ? { ...n, title: newTitle, message: newMessage } : n
      )
    ));
  };

  const deleteNotice = (id) => {
    setNotices(prev => getSortedNotices(prev.filter((n) => n.id !== id)));
  };

  // Provide sorted notices so latest is always first
  return (
    <NoticeContext.Provider value={{ notices: getSortedNotices(notices), addNotice, editNotice, deleteNotice }}>
      {children}
    </NoticeContext.Provider>
  );
};
