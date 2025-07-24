import React, { useState, useContext } from "react";
import { NoticeContext } from "../context/NoticeContext";

const AdminNotices = () => {
  const noticeContext = useContext(NoticeContext);
  const notices = noticeContext && Array.isArray(noticeContext.notices) ? noticeContext.notices : [];
  const addNotice = noticeContext && noticeContext.addNotice;
  const deleteNotice = noticeContext && noticeContext.deleteNotice;
  const editNotice = noticeContext && noticeContext.editNotice;
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMessage, setEditMessage] = useState("");

  const handlePostNotice = (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim() || !message.trim()) {
      setError("Title and message are required.");
      return;
    }
    setPosting(true);
    setTimeout(() => {
      addNotice(title, message, "Admin");
      setTitle("");
      setMessage("");
      setPosting(false);
    }, 600);
  };

  const handleDelete = (id) => {
    deleteNotice(id);
  };

  const startEdit = (notice) => {
    setEditId(notice.id);
    setEditTitle(notice.title);
    setEditMessage(notice.message);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditTitle("");
    setEditMessage("");
  };

  const handleEditSave = (id) => {
    if (!editTitle.trim() || !editMessage.trim()) {
      setError("Title and message are required.");
      return;
    }
    editNotice(id, editTitle, editMessage);
    cancelEdit();
    setError("");
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-gray-50 py-10">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow p-8">
        <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-2">
          <span className="inline-block bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-base font-semibold">
            <svg className="inline-block mr-1" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01"/></svg>
            Notices
          </span>
          Admin Notices
        </h2>
        <form onSubmit={handlePostNotice} className="mb-8">
          <div className="mb-4">
            <label className="block font-semibold text-gray-700 mb-2">Title</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notice title"
              disabled={posting}
            />
          </div>
          <div className="mb-4">
            <label className="block font-semibold text-gray-700 mb-2">Message</label>
            <textarea
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Notice message"
              rows={4}
              disabled={posting}
            />
          </div>
          {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
            disabled={posting}
          >
            {posting ? "Posting..." : "Post Notice"}
          </button>
        </form>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">All Notices</h3>
        <div className="space-y-4">
          {notices.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No notices posted yet.</div>
          ) : (
            notices.map((notice) => (
              <div key={notice.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm group relative">
                {editId === notice.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200 font-bold text-blue-700 mb-2"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Edit title"
                    />
                    <textarea
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200 mb-2"
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value)}
                      placeholder="Edit message"
                      rows={3}
                    />
                    <div className="flex gap-2 mt-4 justify-center">
                      <button
                        className="px-4 py-1 rounded bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition"
                        onClick={() => handleEditSave(notice.id)}
                        type="button"
                      >
                        Save
                      </button>
                      <button
                        className="px-4 py-1 rounded bg-gray-300 text-gray-700 font-semibold shadow hover:bg-gray-400 transition"
                        onClick={cancelEdit}
                        type="button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-blue-700 text-lg">{notice.title}</span>
                      <span className="text-xs text-gray-500 font-mono">{notice.date}</span>
                    </div>
                    <div className="text-gray-700 mb-2">{notice.message}</div>
                    <div className="text-xs text-gray-400">Posted by {notice.author}</div>
                    <div className="absolute left-0 bottom-0 w-full flex gap-2 justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="px-3 py-1 rounded bg-yellow-400 text-white text-xs font-semibold shadow hover:bg-yellow-500 transition"
                        onClick={() => startEdit(notice)}
                        title="Edit"
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 rounded bg-red-500 text-white text-xs font-semibold shadow hover:bg-red-600 transition"
                        onClick={() => handleDelete(notice.id)}
                        title="Delete"
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotices;
