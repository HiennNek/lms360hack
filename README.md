# LMS360 Hack - Hiện đáp án LMS360
## Version hiện tại: v4.2.1

<div id=“pics”>
  <img width="49%" alt="image" src="https://github.com/user-attachments/assets/fdde0a50-880e-4b84-84fb-201b4cd616bd" />
  <img width="49%" alt="image" src="https://github.com/user-attachments/assets/869324f7-89d3-4975-8c68-25ae756da4d2" />
</div>

#

> [!NOTE]
>## Hướng dẫn sử dụng:
>- LƯU Ý: LMS360 Hack hiện tại đã không sử dụng Tampermonkey.
>- Xin hãy sử dụng website [này](https://lms360hack.pages.dev/).
>- Điền URL (đường link) của bài tập LMS360 vào ô “Link LMS360”, sau đó bấm nút "Lấy đáp án"

## Website chính: [lms360hack.pages.dev](https://lms360hack.pages.dev/)
### Backup site (web dự phòng): [hiennnek.github.io/lms360hack](https://hiennnek.github.io/lms360hack/)

#

### [Tìm hiểu cách LMS360 Hack hoạt động](How_it_work.pdf)

#

## FAQ (câu hỏi thường gặp)
> **Cái này có illegal (bất hợp pháp) không?**
- Không :) Miễn có sự đồng ý của giáo viên, người có thẩm quyền.
> **Web này có virus không?**
- Không :) Bạn có thể check mã nguồn của website ngay trên trang GitHub này!
> **Web này có miễn phí không?**
- Có :) 100% miễn phí và mã nguồn mở (open-source)
> **LMS360 Hack có thể được ứng dụng vào việc gì?**
- Bạn có thể sử dụng để kiểm tra đáp án bài làm (nếu có sự cho phép), và thậm chí giáo viên cũng có thể sử dụng công cụ này để check xem bài LMS của mình trông có ổn không mà không cần kiểm tra lại từng câu (GVCN của mình cũng thế)
> **Dự án này hay thế :O**
- Cho mình một ⭐ đi :3

#

### Changelog:
- v4.2.1: Một bản fix nhỏ cho v4.2, đã fix lỗi thứ tự câu trong Interactive video
- v4.2: Giao diện mới, sử dụng backend mới, fix lỗi ~~sắp xếp thứ tự và~~ số thứ tự trong list câu hỏi (sau khi fix cái sắp xếp thứ tự câu hỏi thì nó mọc thêm đống bug nữa)
- v4.1: Đã fix lỗi khi mà lms360hack.pages.dev hiển thị câu hỏi trống khi sử dụng
- v4.0: Phiên bản xịn nhất của LMS360 Hack :D, đang hỗ trợ (và có thể hơn) 11 dạng bài tập
- v3.0: Bản improvement cho v2.0, hỗ trợ nhiều chế độ với câu hỏi trắc nghiệm một đáp án
- v2.0: Bản improvement cho v1.0, có chế độ hiển thị thêm dấu chấm cuối câu cho đáp án đúng (trắc nghiệm một đáp án)
- v1.0: (Không có trên GitHub) Ngày đầu tiên tôi sử dụng LMS360 và cảm thấy hệ thống này thật tệ :)

#

### Source code backend (lms360hack-backend.hiennek1.workers.dev)

#### /src/worker.js
```javascript
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return new Response("What are you doing?", { status: 400 });
    }
    const key = id;
    const { success } = await env.ANTI_DDOS.limit({ key });
    if (!success) {
      return new Response("Trying to DDoS my server?", {
        status: 429,
        headers: {
          "Retry-After": "60",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET"
        }
      });
    }
    const lms360_url = `https://lms360.vn/h5p/${encodeURIComponent(id)}/play`;
    const user_agent = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:143.0) Gecko/20100101 Firefox/143.0",
      "Mozilla/5.0 (Linux; Android 14; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
      "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.110 Safari/537.36",
      "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 15_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.5 Mobile/15E148 Safari/604.1",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko)"
    ];
    const randomUA = user_agent[Math.floor(Math.random() * user_agent.length)];
    try {
      const response = await fetch(lms360_url, {
        headers: { "User-Agent": randomUA }
      });
      const body = await response.text();
      return new Response(body, {
        status: response.status,
        headers: {
          "Content-Type": response.headers.get("content-type") || "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "*"
        }
      });
    } catch (err) {
      return new Response("I smell something bad " + err.message, { status: 500 });
    }
  }
};
export {
  worker_default as default
};
```

#### /wrangler.toml
```toml
name = "lms360hack-backend"
main = "src/worker.js"
workers_dev = true
preview_urls = false
compatibility_date = "2025-10-10"

[observability]
enabled = true
head_sampling_rate = 1

[[ratelimits]]
name = "ANTI_DDOS"
namespace_id = "1001"

  [ratelimits.simple]
  limit = 6
  period = 60

```


#

#### ⚠️ CHỈ PHỤC VỤ MỤC ĐÍNH NGHIÊN CỨU, HỌC TẬP VÀ PHÁT HIỆN LỖ HỔNG BẢO MẬT. KHÔNG ĐƯỢC SỬ DỤNG CHO CÁC BÀI TẬP HOẶC BÀI KIỂM TRA TRÊN LMS360. TÔI SẼ KHÔNG CHỊU TRÁCH NHIỆM CHO CÁC HÀNH VI GIAN LẬN HAY BỊ PHÁT HIỆN, KỈ LUẬT, VI PHẠM PHÁP LUẬT DO SỬ DỤNG CÔNG CỤ NÀY! ⚠️

#### Bằng cách sử dụng lms360hack.pages.dev và các dịch vụ liên quan đến lms360hack/LMS360 Hack hoặc/và có nguồn gốc từ lms360hack/LMS360 Hack, bạn đã đồng ý tuân thủ [các chính sách sử dụng, các điều khoản phân phối và các tuyên bố từ chối trách nhiệm](https://raw.githubusercontent.com/HiennNek/lms360hack/refs/heads/main/LICENSE.md) của tôi.
