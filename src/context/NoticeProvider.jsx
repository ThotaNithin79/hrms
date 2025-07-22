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

  const addNotice = (title, message, author = "Admin") => {
    setNotices([
      {
        id: Date.now(),
        title,
        message,
        date: new Date().toISOString().slice(0, 10),
        author,
      },
      ...notices,
    ]);
  };

  const editNotice = (id, newTitle, newMessage) => {
    setNotices(
      notices.map((n) =>
        n.id === id ? { ...n, title: newTitle, message: newMessage } : n
      )
    );
  };

  const deleteNotice = (id) => {
    setNotices(notices.filter((n) => n.id !== id));
  };

  return (
    <NoticeContext.Provider value={{ notices, addNotice, editNotice, deleteNotice }}>
      {children}
    </NoticeContext.Provider>
  );
};
