"use client";

import Image from "next/image";
import styles from "./styles/Header.module.css";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";

const Header = () => {
  const router = useRouter();
  const [category, setCategory] = useState("ファッション"); //カテゴリー

  const [isOpen, setIsOpen] = useState(false);

  // メニューの表示状態を切り替える関数
  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

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
  //カテゴリーの選択
  const handleCategory = (event) => {
    setCategory(event.target.value);
  };

  const selectCategory = (c) => {
    setIsOpen(false)
    router.push(`/list?category=${c}`)
    }
  return (
    <header className={styles.header}>
      <div className={styles.icon} onClick={() => router.push("/")}>
        <Image
          src="/home.png" // publicフォルダ内の画像ファイルパス
          alt="サンプル画像"
          width={50} // 必須: 画像の幅を指定
          height={50} // 必須: 画像の高さを指定
        />
      </div>
      <div className={styles.dropdownContainer}>
        <button onClick={toggleMenu} className={styles.dropdownButton}>
          カテゴリー
        </button>
        {isOpen && (
          <div className={styles.dropdownMenu}>
            {categoryselect.map((val, index) => (
              <div
                key={index}
                value={val.name}
                className={styles.menuItem}
                onClick={() => selectCategory(val.name)}
              >
                {val.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.icon} onClick={() => router.push("/profile")}>
        <Image
          src="/people.png" // publicフォルダ内の画像ファイルパス
          alt="サンプル画像"
          width={50} // 必須: 画像の幅を指定
          height={50} // 必須: 画像の高さを指定
        />
      </div>
      <button
        className={styles.uploadButton}
        onClick={() => router.push("/listing")}
      >
        出品
      </button>
    </header>
  );
};

export default Header;
