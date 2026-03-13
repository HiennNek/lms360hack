> [!NOTE]
>## Hướng dẫn sử dụng:
>- ### Xin hãy sử dụng website [lms360hack.pages.dev](https://lms360hack.pages.dev/)
>- ### Điền URL (đường link) của bài tập LMS360 vào ô *Link LMS360*, sau đó bấm nút *Lấy đáp án*

#

<h1 align="center">
  LMS360 Hack <br>
  Công cụ xem, chỉnh sửa và tải về bài giảng LMS360
</h1>

<p align="center">
<img width="80%" alt="image" src="https://github.com/user-attachments/assets/b1dbaf57-add6-486f-a69a-206679dabde8" />
</p>

#

### FAQ (câu hỏi thường gặp)
> **Cái này có illegal (bất hợp pháp) không?**
- Không :) Miễn có sự đồng ý của giáo viên, người có thẩm quyền.
> **Web này có virus không?**
- Không :) Bạn có thể check mã nguồn của website ngay trên trang GitHub này!
> **Web này có miễn phí không?**
- Có :) 100% miễn phí và mã nguồn mở
> **LMS360 Hack có thể được ứng dụng vào việc gì?**
- Bạn có thể sử dụng để kiểm tra đáp án bài làm (nếu có sự cho phép), và thậm chí giáo viên cũng có thể sử dụng công cụ này để check xem bài LMS của mình trông có ổn không mà không cần kiểm tra lại từng câu (GVCN của mình cũng thế)
- Ngoài ra, nếu sử dụng Advanced mode, bạn còn có thể xem lại và làm những bài tập đã bị khóa / hết hạn! (Nhưng sẽ không tính điểm trên hệ thống LMS360 cho bạn đâu)
> **Dự án này hay thế :O**
- Cho mình một ⭐ đi :3

#
### Mã nguồn back-end: [github.com/HiennNek/lms360hack/tree/back-end](https://github.com/HiennNek/lms360hack/tree/back-end)

> [!NOTE]
> ## Cách build và chạy mã nguồn (code) LMS360 Hack (front-end)
> ### Đầu tiên, bạn phải có `Node.js` và `npm`
> #### Hãy đảm bảo rằng bạn đang ở branch front-end
> ```bash
> git switch front-end
> ```
> #### Cài đặt dependencies bằng: 
> ```bash
> npm install
> ```
> #### Chạy server development:
> > ```bash
> >npm run dev
> >```
> #### Hoặc chạy server production:
> > #### Build:
> > ```bash
> > npm run build
> > ```
> > #### _Output directory: ```./dist```_
> > #### Và mở server bằng phần mềm yêu thích của bạn (Apache, nginx,...)
> > #### Hoặc chạy thử production server bằng
> > ```bash
> > npm run preview
> > ```

#

### Cách LMS360 Hack hoạt động:
<img width="5718" height="8192" alt="2026.1" src="https://github.com/user-attachments/assets/1d0a36ad-44c9-41a8-afd4-9121023ea26a" />


#

### Changelog:

<details>
  <summary>2026.1</summary>
  Thêm tính năng live preview cho những dạng bài phức tạp
</details>

*Kể từ bản 2026.1, định dạng version sẽ là YEAR.RELEASE*
<details>
  <summary>Changelog cũ</summary>
    <details>
    <summary>v6.2</summary>
    Tối ưu hóa giao diện. Chuyển qua sử dụng ViteJS + TypeScript cho code mượt hơn.
    </details>
    <details>
    <summary>v6.1</summary>
    Tối ưu hóa code production
    </details>
    <details>
    <summary>v6.0</summary>
    Giao diện mới, tốc độ loading nhanh hơn + giao diện mượt hơn nhờ Tailwind CSS, hiển thị câu hỏi dạng grid.
    </details>
    <details>
    <summary>v5.3</summary>
    Đã thêm tính năng preview cho trình duyệt Chromium-based
    </details>
    <details>
    <summary>v5.2</summary>
    Thêm tính năng Preview cho Advanced mode, chỉnh một số vấn đề nhỏ.
    </details>
    <details>
    <summary>v5.1</summary>
    Redesign giao diện, fix error handler, thêm auto save vào advanced mode.
    </details>
    <details>
    <summary>v5.0</summary>
    Thêm LMS360 Hack Advanced. Xem, chỉnh sửa và tải về bài giảng LMS360.
    </details>
    <details>
    <summary>v4.3.2</summary>
    Tối ưu hóa độ mượt của giao diện + tối ưu hóa màu sắc giao diện.
    </details>
    <details>
    <summary>v4.3.1</summary>
    Đã thêm tính năng search cho bài tập có bằng hoặc trên 10 câu hỏi + Thêm hiển thị số câu hỏi thật nếu như bài có random.
    </details>
    <details>
    <summary>v4.3</summary>
    Đã chuyển toàn bộ thuật toán xử lý câu hỏi sang backend. Tối ưu hóa tốc độ load + bảo mật
    </details>
    <details>
    <summary>v4.2.2</summary>
    Fix lại giao diện + fix lỗi scroll trên thiết bị di động</details>
    <details>
    <summary>v4.2.1</summary>
    Một bản fix nhỏ cho v4.2, đã fix lỗi thứ tự câu trong Interactive video
    </details>
    <details>
    <summary>v4.2</summary>
    Giao diện mới, sử dụng backend mới, fix lỗi ~~sắp xếp thứ tự và~~ số thứ tự trong list câu hỏi (sau khi fix cái sắp xếp thứ tự câu hỏi thì nó mọc thêm đống bug nữa)</details>
    <details>
    <summary>v4.1</summary>
    Đã fix lỗi khi mà lms360hack.pages.dev hiển thị câu hỏi trống khi sử dụng
    </details>
    <details>
    <summary>v4.0</summary>
    Sự khởi đầu của phiên bản web LMS360 Hack!
    </details>
</details>

#

<a href="https://www.star-history.com/#HiennNek/lms360hack&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=HiennNek/lms360hack&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=HiennNek/lms360hack&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=HiennNek/lms360hack&type=date&legend=top-left" />
 </picture>
</a>

#

#### Bằng cách sử dụng LMS360 Hack hoặc sản phẩm / dịch vụ có liên quan đến LMS360 Hack hoặc sử dụng một phần / toàn bộ mã nguồn của LMS360 Hack, bạn đã đồng ý tuân thủ [chính sách sử dụng, điều khoản phân phối và tuyên bố từ chối trách nhiệm](https://raw.githubusercontent.com/HiennNek/lms360hack/refs/heads/front-end/LICENSE.md) của tôi.
