'use client'

import React, { useState, useEffect} from 'react';
import Modal from 'react-modal';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider} from 'firebase/auth'; // Firebaseのログイン機能をインポート
import {app} from '../firebaseConfig'
import styles from './styles/loginModal.module.css'

export const googleProvider = new GoogleAuthProvider();
const auth = getAuth(app)
Modal.setAppElement('body')

// モーダルのスタイルを設定
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

const LoginModal = ({ isOpen, onRequestClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // メールアドレスとパスワードでログイン
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onRequestClose();  // ログイン成功後にモーダルを閉じる
    } catch (error) {
      setError('ログインに失敗しました: ' + error.message);
    }
  };

  // Googleアカウントでログイン
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      onRequestClose();  // ログイン成功後にモーダルを閉じる
    } catch (error) {
      setError('Googleでのログインに失敗しました: ' + error.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className={styles.modalOverlay}
      overlayClassName={styles.modalOverlay}
    >
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>ログイン</h2>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <form onSubmit={handleEmailLogin}>
          <div className={styles.formGroup}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.formInput}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.formInput}
              required
            />
          </div>
          <button type="submit" className={styles.primaryButton}>
            メールアドレスでログイン
          </button>
        </form>
        <button className={styles.googleButton} onClick={handleGoogleLogin}>
          Googleでログイン
        </button>
      </div>
    </Modal>
  );
};

export default LoginModal;