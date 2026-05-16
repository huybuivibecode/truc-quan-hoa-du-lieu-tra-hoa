# Trực Quan Hóa Dữ Liệu - Trà Hoa 🍵🌸

Đây là kho lưu trữ tổng hợp cho đồ án/bài tập môn học **Trực Quan Hóa Dữ Liệu**, với chủ đề phân tích và trực quan hóa dữ liệu về sản phẩm **Trà Hoa**. 

Dự án này bao gồm nhiều công cụ và phương pháp trực quan hóa dữ liệu khác nhau, từ xử lý dữ liệu cơ bản đến xây dựng biểu đồ tương tác và dashboard phân tích chuyên sâu.

## 👤 Thông tin chủ sở hữu
- **Chủ sở hữu:** Bùi Quang Huy
- **Liên hệ:** buiquanghuy352k5@gmail.com


## 📁 Cấu trúc dự án

Dự án được chia thành nhiều thư mục tương ứng với các công cụ/ngôn ngữ được sử dụng:

* **`D3.js/`**: Chứa source code HTML, CSS, và JavaScript (D3.js) để trực quan hóa dữ liệu trên nền tảng Web. Dữ liệu thô được đặt trong thư mục `data/` dưới định dạng CSV.
* **`django/`**: Mã nguồn của ứng dụng Web được xây dựng bằng framework Django kết hợp với D3.js. Ứng dụng này dùng để quản lý và hiển thị trực quan các phân tích lên trang web.
* **`powerbi/`**: Chứa file Power BI (`.pbix`) với các dashboard phân tích tương tác và chuyên sâu.
* **`tableau/`**: Chứa các file Tableau (`.twbx`, `.twbr`) để vẽ biểu đồ và xây dựng dashboard báo cáo.(https://public.tableau.com/app/profile/huy.bui6298/viz/Viz_Data_TraHoa_TQHDL/D1)
* **`Sql/`**: Chứa file Jupyter Notebook (`.ipynb`) sử dụng SQL để truy vấn và xử lý dữ liệu.
* **`python/`**: Chứa file Jupyter Notebook (`.ipynb`) dùng Python (Pandas, Matplotlib/Seaborn...) để tiền xử lý dữ liệu và vẽ biểu đồ thăm dò.

## 🚀 Hướng dẫn chạy dự án Web (Django)

Để khởi chạy web app trên máy cá nhân, hãy thực hiện các bước sau:

1. Mở terminal và di chuyển vào thư mục `django`:
   ```bash
   cd django
   ```
2. Khởi chạy server:
   ```bash
   python manage.py runserver
   ```
3. Truy cập vào đường dẫn hiển thị trên terminal (thường là `http://127.0.0.1:8000/`) bằng trình duyệt.

## 🛠 Các công nghệ sử dụng
- Python (Pandas, Jupyter Notebook)
- SQL
- D3.js, HTML, CSS, JavaScript
- Django
- Microsoft Power BI
- Tableau
