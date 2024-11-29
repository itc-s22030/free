"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/Listing.module.css";
import { useRouter } from "next/navigation";

import {
  collection,
  addDoc,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";
import { app } from "../../firebaseConfig";


import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
  uploadBytes,
} from "firebase/storage";

import LoginModal from "@/components/loginModal";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

//出品
const ListingForm = () => {
  const router = useRouter();

  const [productName, setProductName] = useState(""); //商品名
  const [productDetails, setProductDetails] = useState(""); //商品の詳細
  const [category, setCategory] = useState("ファッション"); //カテゴリー
  const [price, setPrice] = useState(""); //金額
  const [location, setLocation] = useState(""); //受取場所

  const [isModalOpen, setIsModalOpen] = useState(false); //ログインモーダル

  const [user, setUser] = useState(null); //ユーザー情報
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [confirmationImage, setConfirmation] = useState(null)

  const [cropSize, setCropSize] = useState(300);
  const imageContainerRef = useRef(null); // 画像コンテナの参照を保持する
  const cropperRef = useRef(null);

  const previewCanvasRef = useRef(null);


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

  const categoryselect = [
    { name: "ファッション" },
    { name: "家電・デジタル機器" },
    { name: "家具インテリア" },
    { name: "ホビー・本" },
    { name: "スポーツ・アウトドア" },
    { name: "美容・健康" },
    { name: "チケット・サービズ" },
    { name: "その他" },
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 画像を指定位置で正方形にトリミングする
  const cropImage = () => {
    // if (!selectedImage || !previewCanvasRef.current) return;

    const image = new Image();
    image.src = selectedImage;

    image.onload = () => {
      // const canvas = previewCanvasRef.current;
        const canvas = document.createElement("canvas");
        canvas.width = cropSize;
        canvas.height = cropSize;
        const ctx = canvas.getContext("2d");

        const scrollX = imageContainerRef.current.scrollLeft; // X軸のスクロール位置
        const scrollY = imageContainerRef.current.scrollTop; // Y軸のスクロール位置

        ctx.clearRect(0, 0, cropSize, cropSize);

        ctx.drawImage(
            image,
            scrollX, // スクロールした位置をX軸の開始位置にする
            scrollY, // スクロールした位置をY軸の開始位置にする
            cropSize, // 切り取りサイズ
            cropSize,
            0,
            0,
            cropSize,
            cropSize
        );

        // EXIF データを削除するために Blob に変換
        canvas.toBlob((blob) => {
            setCroppedImage(blob); // Blobをセット
        }, "image/jpeg");
        const croppedImageUrl = canvas.toDataURL("image/jpeg");
        setConfirmation(croppedImageUrl);

    };
};

  useEffect(() => {
    cropImage();
  }, [selectedImage, cropSize]);

  const handleScroll = () => {
    cropImage();
  };

  //出品商品情報をアップロート
  const handleSubmit = async (e) => {
    e.preventDefault();
    // 出品処理をここに追加
    console.log({
      name: productName,
      description: productDetails,
      category,
      price,
      statas: "販売中",
      receive: location,
    });

    if (!croppedImage) return;
  

    const storageRef = ref(storage, `images/${Date.now()}.jpg`);
    await uploadBytes(storageRef, croppedImage);

    // アップロード後にダウンロードURLを取得
    const downloadURL = await getDownloadURL(storageRef);

    if (!productName && !productDetails && !price && !location) {
      alert("入力されていない項目があります");
      return;
    }
    setLoading(true)
    try {
      //Firebaseにデータの送信
      const docRef = await addDoc(collection(db, "Produts"), {
        productName,
        productDetails,
        category,
        price: Number(price),
        location,
        statas: "販売中",
        create_at: serverTimestamp(),
        image: downloadURL,
        seller_id: user.uid,
      });
      setLoading(false)


      //入力を空にする
      alert("データがアップロードされました");
      setProductName("");
      setProductDetails("");
      setCategory("option1");
      setPrice("");
      setLocation("");
      setSelectedImage(null);
      setCroppedImage(null);
    } catch (error) {
      console.error("アップロード中にエラーが発生しました:", error);
      alert("アップロードに失敗しました。");
    }
  };

  //カテゴリーの選択
  const handleCategory = (event) => {
    setCategory(event.target.value);
  };

  //ログインモーダルの表示
  const openModal = () => {
    setIsModalOpen(true);
  };

  //ログインモーダルの非表示
  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return <p>Loading...</p>; // ロード中の表示
  }

  return (
    <>
      <div className={styles.icon2} onClick={() => router.back("/")}>
        <img
          src="/back.png" // publicフォルダ内の画像ファイルパス
          alt="サンプル画像"
          width={25} // 必須: 画像の幅を指定
          height={25} // 必須: 画像の高さを指定
        />
      </div>
      <div className={styles.container}>
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
        <div className={styles.containerUpImage}>
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            className={styles.imageInput}
          />
          {selectedImage && (
            <>
              <div ref={imageContainerRef} className={styles.imageContainer} onScroll={handleScroll}>
                <img src={selectedImage} alt="Selected" />
              </div>
              <div className={styles.controls}>
                <div className={styles.controlGroup}>
                  <label>トリミングサイズ:</label>
                  <input
                    type="range"
                    min="75"
                    max="1500"
                    value={cropSize}
                    onChange={(e) => setCropSize(parseInt(e.target.value))}
                    className={styles.rangeInput}
                  />
                  <span>{cropSize}px</span>
                </div>
              </div>
              <button className={styles.uploadButton} onClick={cropImage}>
                トリミング
              </button>
            </>
          )}
          {confirmationImage && (
            <>
              <h3>トリミング後の画像</h3>
              <img
                src={confirmationImage}
                alt="Cropped"
                className={styles.croppedImage}
              />
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>商品名と詳細</label>
            <input
              type="text"
              placeholder="商品名"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className={styles.input}
            />
            <textarea
              placeholder="商品詳細"
              value={productDetails}
              onChange={(e) => setProductDetails(e.target.value)}
              className={styles.textarea}
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            出品
          </button>

          <div className={styles.inputGroup}>
            <label htmlFor="dropdown">カテゴリー</label>
            <select
              id="dropdown"
              value={category}
              onChange={handleCategory}
              className={styles.input}
            >
              {categoryselect.map((val, index) => (
                <option key={index} value={val.name}>
                  {val.name}
                </option>
              ))}
            </select>
            <p>選択された値: {category}</p>
          </div>

          <div className={styles.inputGroup}>
            <label>出品金額</label>
            <input
              type="text"
              placeholder="出品金額記入"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>受取受取方法</label>
            <input
              type="text"
              placeholder="受取場所"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={styles.input}
            />
          </div>
        </form>
      </div>
    </>
  );
};
export default ListingForm;

