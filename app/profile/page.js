"use client"; // クライアントコンポーネントとして指定

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  doc,
  setDoc,
  getFirestore,
  getDocs,
  query,
  collection,
  where,
  addDoc,
} from "firebase/firestore";
import { app } from "../../firebaseConfig";
import styles from "../styles/Profile.module.css";
import Image from "next/image";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import LoginModal from "@/components/loginModal";

const db = getFirestore(app);
const auth = getAuth(app);
//プロフィール
export default function Profile() {
  const router = useRouter();
  const [profileInfo, setProfileInfo] = useState({
    name: "",
    studentId: "",
    school: "",
  });
  const [isSaved, setIsSaved] = useState(false); // 保存成功フラグ
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(""); //ユーザー情報
  const [isData, setIsData] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); //ログインモーダル

  const [merchandises, setMerchandise] = useState([]);
  const [negotiatingMerchandises, setNegotiatingMerchandises] = useState([]);
  const [purchaseMerchandises, setPurchaseMerchandises] = useState([]);
  const [purchaseTransactions, setPurchaseTransactions] = useState([]);
  const [productPurchase, setProductPurchase] = useState([]);

  // ユーザー情報の取得
  useEffect(() => {
    let uid = "";
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        uid = authUser.uid;
        fetchProfile(uid);
        setUser(authUser);
        getMerchandiseCategoryList(uid);
        getNegotiatingMerchandiseCategoryList(uid);
        getPurchaseMerchandiseCategoryList(uid);
        getPurchaseTransactionsCategoryList(uid);
        getPurchaseTransactionsCategorywaList(uid);
      } else {
        uid = null;
        console.log("not data");
        setIsModalOpen(true);
      }
    });

    const fetchProfile = async (uid) => {
      const q = query(collection(db, "Users"), where("user_id", "==", uid));
      try {
        const querySnapshot = await getDocs(q);
        const merchandise = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        if (merchandise.length > 0) {
          const data = merchandise[0];
          setProfileInfo({
            name: data.name || "",
            studentId: data.student_id || "",
            school: data.school || "",
          });
          setUserId(merchandise[0].id);
          setIsData(true);
        } else {
          console.log("No such document!");
        }
        return merchandise;
      } catch (error) {
        console.error("Error fetching merchandise:", error);
      }
    };
    return () => unsubscribe();
  }, []);

  //出品した商品一覧
  const getMerchandiseCategoryList = async (uid) => {
    const q = query(collection(db, "Produts"), where("seller_id", "==", uid));
    try {
      const querySnapshot = await getDocs(q);
      const merchandise = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMerchandise(merchandise);
      return merchandise;
    } catch (error) {
      console.error("Error fetching merchandise:", error);
    }
  };

  //交渉中の商品一覧
  const getNegotiatingMerchandiseCategoryList = async (uid) => {
    const q = query(
      collection(db, "Produts"),
      where("seller_id", "==", uid),
      where("statas", "==", "交渉中")
    );
    try {
      const querySnapshot = await getDocs(q);
      const merchandise = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNegotiatingMerchandises(merchandise);
      return merchandise;
    } catch (error) {
      console.error("Error fetching merchandise:", error);
    }
  };

  //購入された商品一覧
  const getPurchaseMerchandiseCategoryList = async (uid) => {
    const q = query(
      collection(db, "Produts"),
      where("seller_id", "==", uid),
      where("statas", "==", "購入")
    );
    try {
      const querySnapshot = await getDocs(q);
      const merchandise = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPurchaseMerchandises(merchandise);
      return merchandise;
    } catch (error) {
      console.error("Error fetching merchandise:", error);
    }
  };

  //購入した商品一覧
  const getPurchaseTransactionsCategoryList = async (uid) => {
    const q = query(
      collection(db, "Produts"),
      where("buyer_id", "==", uid),
      where("statas", "==", "購入")
    );
    try {
      const querySnapshot = await getDocs(q);
      const merchandise = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPurchaseTransactions(merchandise);
      return merchandise;
    } catch (error) {
      console.error("Error fetching merchandise:", error);
    }

    //購入する交渉中の商品
  };

  const getPurchaseTransactionsCategorywaList = async (uid) => {
    const q = query(
      collection(db, "Produts"),
      where("buyer_id", "==", uid),
      where("statas", "==", "交渉中")
    );
    try {
      const querySnapshot = await getDocs(q);
      const merchandise = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProductPurchase(merchandise);
      return merchandise;
    } catch (error) {
      console.error("Error fetching merchandise:", error);
    }
  };

  //ログインモーダルの表示
  const openModal = () => {
    setIsModalOpen(true);
  };

  //ログインモーダルの非表示
  const closeModal = () => {
    setIsModalOpen(false);
  };
  // フォームの入力を変更したときの処理
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // 保存ボタンがクリックされたときの処理
  const handleSave = async () => {
    try {
      if (isData) {
        const docRef = doc(db, "Users", userId); // user_id 1 のデータを保存
        await setDoc(
          docRef,
          {
            name: profileInfo.name,
            student_id: profileInfo.studentId,
            school: profileInfo.school,
          },
          { merge: true }
        );
        alert("プロフィールが保存されました！");
        setIsSaved(true); // 保存成功フラグを更新
      } else {
        const docRef = await addDoc(collection(db, "Users"), {
          name: profileInfo.name,
          student_id: profileInfo.studentId,
          school: profileInfo.school,
          user_id: user.uid,
          email: user.email,
        });
        alert("プロフィールが保存されました！");
        setIsSaved(true); // 保存成功フラグを更新
      }
    } catch (error) {
      console.error("Error updating document: ", error);
      alert("プロフィールの保存に失敗しました。");
    }
  };

  const handleHomeClick = () => {
    router.push("/");
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.icon} onClick={handleHomeClick}>
          <Image
            src="/home.png" // publicフォルダ内の画像ファイルパス
            alt="サンプル画像"
            width={50} // 必須: 画像の幅を指定
            height={50} // 必須: 画像の高さを指定
          />
        </div>
        <h1 className={styles.title}>プロフィール(PROFILE)</h1>
        {isSaved && ( // 保存後に名前、学籍番号、所属校を表示
          <div className={styles.profileDetails}>
            <span className={styles.profileName}>{profileInfo.name}</span>
            <span className={styles.profileSchool}>{profileInfo.school}</span>
            <span className={styles.profileStudentId}>
              {profileInfo.studentId}
            </span>
          </div>
        )}
      </header>
      <div className={styles.icon2} onClick={() => router.back("/")}>
        <Image
          src="/back.png" // publicフォルダ内の画像ファイルパス
          alt="サンプル画像"
          width={25} // 必須: 画像の幅を指定
          height={25} // 必須: 画像の高さを指定
        />
      </div>
      {user ? (
        <div>
          {/* <p>{user.email}</p>
          <button onClick={() => auth.signOut()}>ログアウト</button> */}
        </div>
      ) : (
        <div>
          <LoginModal isOpen={isModalOpen} onRequestClose={closeModal} />
        </div>
      )}
      <section className={styles.profileSection}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>名前</label>
          <input
            className={styles.input}
            type="text"
            name="name"
            placeholder="名前を入力"
            value={profileInfo.name}
            onChange={handleChange}
          />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>学籍番号</label>
          <input
            className={styles.input}
            type="text"
            name="studentId"
            placeholder="学籍番号を入力"
            value={profileInfo.studentId}
            onChange={handleChange}
          />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>所属校</label>
          <input
            className={styles.input}
            type="text"
            name="school"
            placeholder="所属校を入力"
            value={profileInfo.school}
            onChange={handleChange}
          />
        </div>
      </section>

      <button className={styles.saveButton} onClick={handleSave}>
        保存
      </button>
      <h2>商品一覧</h2>
      <div className={styles.selle}>
        <div>
          {merchandises === 0 ? (
            <p>No Data</p>
          ) : (
            <>
              {merchandises && (
                <div className={styles.merchandiseList}>
                  {merchandises.map((merchandise) => (
                    <div
                      key={merchandise.id}
                      className={styles.merchandiseCard}
                      onClick={() => router.push(`/detail?m=${merchandise.id}`)}
                    >
                      <img src={merchandise.image} alt="Uploaded" width={130} />
                      <p>{merchandise.productName}</p>
                      <p>{merchandise.price}円</p>
                      <p>{merchandise.productDetails}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <div>
          <h3>交渉中の商品一覧</h3>
          {negotiatingMerchandises.length === 0 ? (
            <p>No Data</p>
          ) : (
            <>
              {negotiatingMerchandises && (
                <div className={styles.merchandiseList}>
                  {negotiatingMerchandises.map((merchandise) => (
                    <div
                      key={merchandise.id}
                      className={styles.merchandiseCard}
                      onClick={() => router.push(`/detail?m=${merchandise.id}`)}
                    >
                      <img src={merchandise.image} alt="Uploaded" width={130} />
                      <p>{merchandise.productName}</p>
                      <p>{merchandise.price}円</p>
                      <p>{merchandise.productDetails}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <div>
          <h3>購入されたの商品一覧</h3>
          {purchaseMerchandises.length === 0 ? (
            <p>No data</p>
          ) : (
            <>
              {purchaseMerchandises && (
                <div className={styles.merchandiseList}>
                  {purchaseMerchandises.map((merchandise) => (
                    <div
                      key={merchandise.id}
                      className={styles.merchandiseCard}
                      onClick={() => router.push(`/detail?m=${merchandise.id}`)}
                    >
                      <img src={merchandise.image} alt="Uploaded" width={130} />
                      <p>{merchandise.productName}</p>
                      <p>{merchandise.price}円</p>
                      <p>{merchandise.productDetails}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <div className={styles.buyer}>
        <div>
          <h3>購入したい商品</h3>
          {productPurchase.length === 0 ? (
            <p>No data</p>
          ) : (
            <>
              {productPurchase && (
                <div className={styles.merchandiseList}>
                  {productPurchase.map((merchandise) => (
                    <div
                      key={merchandise.id}
                      className={styles.merchandiseCard}
                      onClick={() => router.push(`/detail?m=${merchandise.id}`)}
                    >
                      <img src={merchandise.image} alt="Uploaded" width={130} />
                      <p>{merchandise.productName}</p>
                      <p>{merchandise.price}円</p>
                      <p>{merchandise.productDetails}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <div>
          <h3>購入した商品一覧</h3>
          {purchaseTransactions.length === 0?(
            <p>No data</p>
          ):(
            <>
            {purchaseTransactions && (
            <div className={styles.merchandiseList}>
              {purchaseTransactions.map((merchandise) => (
                <div
                  key={merchandise.id}
                  className={styles.merchandiseCard}
                  onClick={() => router.push(`/detail?m=${merchandise.id}`)}
                >
                  <img src={merchandise.image} alt="Uploaded" width={130} />
                  <p>{merchandise.productName}</p>
                  <p>{merchandise.price}円</p>
                  <p>{merchandise.productDetails}</p>
                </div>
              ))}
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
