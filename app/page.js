"use client";

import React from "react";
import styles from "./styles/Home.module.css";
import Header from "@/components/header";
import List from "@/components/List";
import { useRouter } from "next/navigation";

const Home = () => {
  const router = useRouter();

  const categoryselect = [
    { name: "ファッション", image: "pa-ka-.png" },
    { name: "家電・デジタル機器", image: "psc.png" },
    { name: "家具インテリア", image: "tannsu.png" },
    { name: "ホビー・本", image: "hobi-.png" },
    { name: "スポーツ・アウトドア", image: "tento.png" },
    { name: "美容・健康", image: "sapuri.png" },
    { name: "チケット・サービズ", image: "tiketto.png" },
    { name: "その他", image: "sonota.png" },
  ];

  return (
    <div className={styles.container}>
      <Header />
      <section className={styles.popularCategory}>
        <h2>人気カテゴリー</h2>
        <div className={styles.circleContainer}>
          {categoryselect.map(({ name, image }, index) => (
            <div
              key={index}
              className={styles.circle}
              onClick={() => router.push(`/list?category=${name}`)}
            >
              <img
                src={image} // publicフォルダ内の画像ファイルパス
                alt="サンプル画像"
                width={100} // 必須: 画像の幅を指定
                height={100} // 必須: 画像の高さを指定
              />
              <label>{name}</label>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.products}>
        <h2>商品</h2>
        <List />
      </section>
    </div>
  );
};
export default Home;
