"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  getFirestore,
  where,
  limit,
} from "firebase/firestore";
import { app } from "../firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import LoginModal from "@/components/loginModal";
import styles from "./styles/Chat.module.css";
import { useSearchParams } from "next/navigation";


const db = getFirestore(app);
const auth = getAuth(app);

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); //ログインモーダル
  const [user, setUser] = useState(null); //ユーザー情報
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef(null);
  const searchParams = useSearchParams();
  const transactions = searchParams.get("t");


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // ログインしている場合
        setUser(user);
      } else {
        // ログインしていない場合
        setUser(null);
        setIsModalOpen(true);
      }
      setLoading(false);
    });

    // クリーンアップ
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // メッセージの取得（リアルタイムで更新）
  useEffect(() => {
    const q = query(
      collection(db, "Messages"),
      where("pid", "==", transactions),
      orderBy("timestamp", "desc"),
      limit(20)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messages.reverse());
    });
    return () => unsubscribe();
  }, []);

  // メッセージの送信
  const sendMessage = async (e) => {
    e.preventDefault();
    if (message.trim() === "") return;

    await addDoc(collection(db, "Messages"), {
      text: message,
      timestamp: new Date(),
      uid: user.uid,
      pid: transactions,
    });
    setMessage("");
  };
  if (loading) {
    return <p>Loading...</p>; // ロード中の表示
  }
  //ログインモーダルの表示
  const openModal = () => {
    setIsModalOpen(true);
  };

  //ログインモーダルの非表示
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {user ? (
        <></>
      ) : (
        <div>
          <LoginModal isOpen={isModalOpen} onRequestClose={closeModal} />
        </div>
      )}
      <div className={styles.chatContainer}>
        <div className={styles.messages}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={
                msg.uid === auth.currentUser.uid ? styles.sent : styles.received
              }
            >
              <strong>{msg.displayName}</strong> {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef}></div>
        </div>

        <form onSubmit={sendMessage} className={styles.inputForm}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="メッセージを入力"
            className={styles.input}
          />
          <button type="submit" className={styles.sendButton}>
            送信
          </button>
        </form>
      </div>
    </>
  );
};

export default Chat;
