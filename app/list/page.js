"use client";

import Header from "@/components/header";
import List from "@/components/List";
import { useSearchParams } from "next/navigation";
import styles from "../styles/Home.module.css";


//カテゴリー一覧
const Lists = () => {
    const searchParams = useSearchParams()
    const category = searchParams.get('category')
  return (
    <div className = {styles.container}>
      <Header />
      <h3>{category}・カテゴリー一覧</h3>
      <List category = {category}/>
    </div>
  );
};
export default Lists;
