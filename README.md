# Xúc Xắc May Mắn (Lucky Dice) 🎲

Trò chơi mô phỏng xác suất xúc xắc 3 hột (Sic Bo / Tài Xỉu) giải trí vui vẻ, giao diện hiện đại được xây dựng bằng **ReactJS**, **Tailwind CSS**, và tích hợp cơ sở dữ liệu **Supabase**. Sẵn sàng để triển khai trực tiếp lên **Vercel**.

---

## 🌟 Tính Năng Nổi Bật

1. **Thuật toán xúc xắc ngẫu nhiên minh bạch (Fair RNG):**
   - 3 xúc xắc độc lập với xác suất tự nhiên từ 1 đến 6.
   - Các cửa cược: **Tài** (11-17), **Xỉu** (4-10), **Chẵn**, **Lẻ**, **Bão** (Bộ ba đồng nhất tỷ lệ 1:30), và **Tổng điểm chính xác** (4 đến 17).

2. **Giao diện & Trải nghiệm sống động:**
   - Đĩa vàng và Bát úp 3D tương tác: lắc xúc xắc sinh động và chế độ "Mở Bát" hồi hộp.
   - Hiệu ứng âm thanh chân thực bằng **Web Audio API** (không phụ thuộc file MP3 ngoài).
   - Hiệu ứng pháo hoa ăn mừng (Confetti) khi chiến thắng.

3. **Hai chế độ chơi linh hoạt:**
   - **Chơi Tự Do (Lắc Ngay):** Đặt cược và lắc bất cứ lúc nào bạn muốn.
   - **Phiên Tự Động (Đếm ngược 30s):** Mô phỏng sảnh chơi theo phiên thời gian thực.

4. **Hệ thống Xu May Mắn & Thống kê:**
   - Bắt đầu với 100,000 Xu.
   - Điểm danh nhận thưởng hàng ngày (+20,000 Xu).
   - Nhập mã Giftcode: `XUCXACMAYMAN`, `TANTHU`, `FREEXU`, `LUCKYDICE`.
   - Bảng soi cầu & Lịch sử 30 phiên gần nhất với tỷ lệ phần trăm trực quan.
   - Bảng xếp hạng người chơi (Leaderboard).

5. **Kết nối Supabase & Chế độ Offline:**
   - Nếu chưa nhập API Key Supabase, game tự động chạy trên `LocalStorage` mà không bị gián đoạn.
   - Khi cấu hình Supabase, hệ thống tự động lưu trữ thông tin người chơi, số dư và lịch sử các phiên lên PostgreSQL Cloud.

---

## 🚀 Cài Đặt & Chạy Cục Bộ

### 1. Yêu cầu môi trường
* Node.js >= 18
* npm hoặc yarn / pnpm

### 2. Cài đặt các thư viện
```bash
npm install
```

### 3. Chạy môi trường phát triển (Dev)
```bash
npm run dev
```
Mở trình duyệt tại: `http://localhost:5173`

---

## 🗄️ Cấu Hình Supabase (Database)

1. Đăng ký tài khoản và tạo dự án mới tại [supabase.com](https://supabase.com).
2. Vào mục **SQL Editor** trong Dashboard của dự án, sao chép nội dung trong file [supabase_schema.sql](./supabase_schema.sql) và bấm **Run**.
3. Tạo file `.env` từ `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Điền URL và Anon Key từ **Project Settings -> API**:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

---

## 🌐 Hướng Dẫn Deploy Lên Vercel

Dự án đã có sẵn cấu hình [vercel.json](./vercel.json) cho Single Page Application (SPA).

### Cách 1: Deploy qua Vercel Dashboard
1. Đẩy mã nguồn lên GitHub.
2. Truy cập [vercel.com](https://vercel.com) -> Bấm **Add New Project** -> Chọn repository vừa tạo.
3. Thiết lập:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Trong mục **Environment Variables**, thêm 2 biến của Supabase:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Bấm **Deploy**.

### Cách 2: Deploy qua Vercel CLI
```bash
npm i -g vercel
vercel
```

---

## ⚖️ Lưu ý pháp lý
Trò chơi mang tính chất giải trí và mô phỏng xác suất toán học. Xu trong game không có giá trị quy đổi thành tiền mặt hoặc hiện vật dưới bất kỳ hình thức nào.
