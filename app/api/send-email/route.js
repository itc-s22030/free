import nodemailer from "nodemailer";

//メール送信のAPI
export async function POST(request) {
  try {
    const { email,subject, text } = await request.json();

    // Nodemailer設定
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email, // 通知を送りたいメールアドレス
      subject: subject || "ボタンが押されました",
      text: text || "通知内容を記載します。",
    };

    // メール送信
    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ message: "メールが送信されました" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("メール送信エラー:", error);
    return new Response(
      JSON.stringify({ error: "メール送信に失敗しました", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}